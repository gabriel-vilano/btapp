import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import { AVATAR_MAX_BYTES } from "@/src/lib/validations";
import { checkUsername, createProfile } from "./actions";
import {
  asSupabaseClient,
  buildFormData,
  buildPngFile,
  createSupabaseMock,
  redirectSignal,
  TEST_USER,
  type SupabaseMock,
} from "./actions.test-utils";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));
// redirect() real lança NEXT_REDIRECT e interrompe a action; o mock imita isso
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const INTERNAL_ERROR = "PostgrestError: relation profiles_pkey violated at node-7";

let supabase: SupabaseMock;

beforeEach(() => {
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(asSupabaseClient(supabase));
});

function mockUsernameTaken() {
  supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({ data: { id: "outro-user" }, error: null });
}

function mockUsernameQueryFailure() {
  supabase.profilesQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: INTERNAL_ERROR } });
}

const USERNAME_CHECK_FAILED = "Não foi possível verificar o username. Tente novamente.";

describe("checkUsername", () => {
  it("rejeita formato inválido sem consultar o banco", async () => {
    const result = await checkUsername("Ana Souza");
    expect(result).toEqual({
      available: false,
      error: "Apenas letras minúsculas, números, pontos e underscores",
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("username em uso não está disponível", async () => {
    mockUsernameTaken();
    expect(await checkUsername("ana.bt")).toEqual({ available: false });
    expect(supabase.profilesQuery.eq).toHaveBeenCalledWith("username", "ana.bt");
  });

  it("username livre está disponível", async () => {
    expect(await checkUsername("ana.bt")).toEqual({ available: true });
  });

  // Regressão: antes o `error` da query era ignorado e a falha virava "disponível"
  it("falha na consulta não vira disponível e não vaza o erro interno", async () => {
    mockUsernameQueryFailure();
    expect(await checkUsername("ana.bt")).toEqual({ available: false, error: USERNAME_CHECK_FAILED });
  });
});

describe("createProfile", () => {
  it("sem sessão: pede login de novo", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const result = await createProfile(null, buildFormData({ username: "ana.bt" }));
    expect(result).toEqual({ error: "Sessão expirada. Faça login novamente." });
    expect(supabase.profilesQuery.upsert).not.toHaveBeenCalled();
  });

  // Regressão: o erro de username ia para `fieldErrors.name`
  it("username inválido devolve erro no campo username e não salva", async () => {
    const result = await createProfile(null, buildFormData({ username: "an" }));
    expect(result).toEqual({
      fieldErrors: { username: "Username precisa ter pelo menos 3 caracteres" },
    });
    expect(supabase.profilesQuery.upsert).not.toHaveBeenCalled();
  });

  it("username em uso: mensagem amigável e não salva", async () => {
    mockUsernameTaken();
    const result = await createProfile(null, buildFormData({ username: "ana.bt" }));
    expect(result).toEqual({ error: "Username já está em uso." });
    expect(supabase.profilesQuery.upsert).not.toHaveBeenCalled();
  });

  it("falha ao verificar username: não salva", async () => {
    mockUsernameQueryFailure();
    const result = await createProfile(null, buildFormData({ username: "ana.bt" }));
    expect(result).toEqual({ error: USERNAME_CHECK_FAILED });
    expect(supabase.profilesQuery.upsert).not.toHaveBeenCalled();
  });

  it("username é opcional: salva com null e vai para o feed", async () => {
    await expect(createProfile(null, buildFormData({ username: "" }))).rejects.toThrow(
      redirectSignal("/feed"),
    );
    expect(supabase.profilesQuery.maybeSingle).not.toHaveBeenCalled();
    expect(supabase.profilesQuery.upsert).toHaveBeenCalledWith({
      id: TEST_USER.id,
      first_name: "Ana Clara",
      last_name: "de Souza",
      full_name: "Ana Clara de Souza",
      username: null,
      avatar_url: null,
    });
  });

  it("cadastro antigo, só com full_name: separa a primeira palavra como nome", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { ...TEST_USER, user_metadata: { full_name: "João Pedro  Silva" } } },
    });
    await expect(createProfile(null, buildFormData({ username: "" }))).rejects.toThrow(
      redirectSignal("/feed"),
    );
    expect(supabase.profilesQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ first_name: "João", last_name: "Pedro Silva", full_name: "João Pedro Silva" }),
    );
  });

  it("cadastro antigo com nome de uma palavra: sobrenome fica null", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { ...TEST_USER, user_metadata: { full_name: "Gabriel" } } },
    });
    await expect(createProfile(null, buildFormData({ username: "" }))).rejects.toThrow(
      redirectSignal("/feed"),
    );
    expect(supabase.profilesQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ first_name: "Gabriel", last_name: null, full_name: "Gabriel" }),
    );
  });

  it("com foto: sobe no bucket do usuário e salva a URL pública", async () => {
    const form = buildFormData({ username: "ana.bt", avatar: buildPngFile() });

    await expect(createProfile(null, form)).rejects.toThrow(redirectSignal("/feed"));
    expect(supabase.storage.from).toHaveBeenCalledWith("avatars");
    expect(supabase.avatarsBucket.upload).toHaveBeenCalledWith(
      "user-123/avatar.png",
      expect.any(File),
      { upsert: true, contentType: "image/png" },
    );
    expect(supabase.profilesQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: "https://cdn.test/avatars/user-123/avatar.png" }),
    );
  });

  it("falha no upload da foto: mensagem amigável e não salva", async () => {
    supabase.avatarsBucket.upload.mockResolvedValueOnce({ error: { message: INTERNAL_ERROR } });
    const result = await createProfile(null, buildFormData({ username: "", avatar: buildPngFile() }));
    expect(result).toEqual({ error: "Erro ao enviar foto. Tente novamente." });
    expect(supabase.profilesQuery.upsert).not.toHaveBeenCalled();
  });

  // Regressão: antes a extensão vinha do nome e o contentType do `type` enviados pelo usuário
  it("extensão e contentType vêm dos bytes, não do nome enviado", async () => {
    const avatar = buildPngFile("foto.html");
    await expect(createProfile(null, buildFormData({ username: "", avatar }))).rejects.toThrow(
      redirectSignal("/feed"),
    );
    expect(supabase.avatarsBucket.upload).toHaveBeenCalledWith(
      "user-123/avatar.png",
      expect.any(File),
      { upsert: true, contentType: "image/png" },
    );
  });

  it("rejeita tipo declarado fora da lista sem subir nada", async () => {
    const avatar = new File(["<svg onload=alert(1)>"], "foto.svg", { type: "image/svg+xml" });
    const result = await createProfile(null, buildFormData({ username: "", avatar }));
    expect(result).toEqual({ error: "Formato aceito: JPG, PNG ou WebP" });
    expect(supabase.avatarsBucket.upload).not.toHaveBeenCalled();
    expect(supabase.profilesQuery.upsert).not.toHaveBeenCalled();
  });

  it("rejeita arquivo que declara image/png mas não é imagem", async () => {
    const avatar = new File(["<html><script>alert(1)</script>"], "foto.png", { type: "image/png" });
    const result = await createProfile(null, buildFormData({ username: "", avatar }));
    expect(result).toEqual({ error: "Formato aceito: JPG, PNG ou WebP" });
    expect(supabase.avatarsBucket.upload).not.toHaveBeenCalled();
  });

  it("rejeita foto acima do limite sem subir nada", async () => {
    const oversized = new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], "foto.png", { type: "image/png" });
    const result = await createProfile(null, buildFormData({ username: "", avatar: oversized }));
    expect(result).toEqual({ error: "Foto deve ter no máximo 1MB" });
    expect(supabase.avatarsBucket.upload).not.toHaveBeenCalled();
  });

  it("corrida no username (unique violation no upsert): mensagem de username em uso", async () => {
    supabase.profilesQuery.upsert.mockResolvedValueOnce({
      error: { message: 'duplicate key value violates unique constraint "profiles_username_key"' },
    });
    const result = await createProfile(null, buildFormData({ username: "ana.bt" }));
    expect(result).toEqual({ error: "Username já está em uso." });
  });

  it("erro desconhecido ao salvar: mensagem genérica, sem vazar o erro interno", async () => {
    supabase.profilesQuery.upsert.mockResolvedValueOnce({ error: { message: INTERNAL_ERROR } });
    const result = await createProfile(null, buildFormData({ username: "ana.bt" }));
    expect(result).toEqual({ error: "Erro ao salvar perfil. Tente novamente." });
  });
});
