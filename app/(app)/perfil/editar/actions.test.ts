import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { buildFormData, buildPngFile, redirectSignal } from "@/app/(auth)/actions.test-utils";
import { updateProfile } from "./actions";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// redirect() real lança NEXT_REDIRECT e interrompe a action; o mock imita isso
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const USER = { id: "user-123", user_metadata: {} };

// Builder por tabela: a checagem do @username termina em maybeSingle; a gravação, em upsert
function tableQuery() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.neq.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  return query;
}

function createSupabaseMock() {
  const profiles = tableQuery();
  const profilePrivate = tableQuery();
  const avatars = {
    upload: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://cdn.test/avatars/user-123/avatar.png" } }),
  };
  const tables: Record<string, ReturnType<typeof tableQuery>> = { profiles, profile_private: profilePrivate };
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: USER } }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn((table: string) => tables[table]),
    storage: { from: vi.fn().mockReturnValue(avatars) },
    profiles,
    profilePrivate,
    avatars,
  };
}

let supabase: ReturnType<typeof createSupabaseMock>;

beforeEach(() => {
  vi.clearAllMocks();
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>);
});

const VALID_FIELDS = {
  firstName: "Lucas",
  lastName: "Silva Souza",
  username: "lucas.bt",
  birthDate: "1990-05-12",
};

function submit(fields: Record<string, string | File> = VALID_FIELDS) {
  return updateProfile(null, buildFormData(fields));
}

describe("updateProfile", () => {
  it("grava nome, sobrenome e full_name juntos, a data na tabela privada, e volta ao perfil", async () => {
    await expect(submit()).rejects.toThrow(redirectSignal("/perfil"));

    expect(supabase.profiles.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-123",
        first_name: "Lucas",
        last_name: "Silva Souza",
        full_name: "Lucas Silva Souza",
        username: "lucas.bt",
      })
    );
    expect(supabase.profilePrivate.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-123", birth_date: "1990-05-12" })
    );
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { first_name: "Lucas", last_name: "Silva Souza", full_name: "Lucas Silva Souza" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("nunca grava a data de nascimento em profiles, que é legível por qualquer jogador", async () => {
    await expect(submit()).rejects.toThrow(redirectSignal("/perfil"));
    const profileRow = supabase.profiles.upsert.mock.calls[0][0];
    expect(Object.keys(profileRow)).not.toContain("birth_date");
  });

  it("data vazia grava null: é assim que o jogador apaga a data", async () => {
    await expect(submit({ ...VALID_FIELDS, birthDate: "" })).rejects.toThrow(redirectSignal("/perfil"));
    expect(supabase.profilePrivate.upsert).toHaveBeenCalledWith(expect.objectContaining({ birth_date: null }));
  });

  it("sem foto nova, mantém a atual: avatar_url fica fora do upsert", async () => {
    await expect(submit()).rejects.toThrow(redirectSignal("/perfil"));
    expect(supabase.avatars.upload).not.toHaveBeenCalled();
    expect(Object.keys(supabase.profiles.upsert.mock.calls[0][0])).not.toContain("avatar_url");
  });

  it("foto nova grava a URL com versão, para o navegador não mostrar a antiga", async () => {
    await expect(submit({ ...VALID_FIELDS, avatar: buildPngFile() })).rejects.toThrow(redirectSignal("/perfil"));
    expect(supabase.avatars.upload).toHaveBeenCalledWith("user-123/avatar.png", expect.any(File), expect.anything());
    expect(supabase.profiles.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: expect.stringMatching(/^https:\/\/cdn\.test\/avatars\/user-123\/avatar\.png\?v=\d+$/) })
    );
  });

  it("a checagem do @username ignora o próprio jogador", async () => {
    await expect(submit()).rejects.toThrow(redirectSignal("/perfil"));
    expect(supabase.profiles.eq).toHaveBeenCalledWith("username", "lucas.bt");
    expect(supabase.profiles.neq).toHaveBeenCalledWith("id", "user-123");
  });

  it("@username de outro jogador volta como erro do campo, sem gravar nada", async () => {
    supabase.profiles.maybeSingle.mockResolvedValueOnce({ data: { id: "outro" }, error: null });
    expect(await submit()).toEqual({ fieldErrors: { username: "Nome de usuário já está em uso" } });
    expect(supabase.profiles.upsert).not.toHaveBeenCalled();
    expect(supabase.profilePrivate.upsert).not.toHaveBeenCalled();
  });

  it("@username pego entre a checagem e a gravação (23505) também vira erro do campo", async () => {
    supabase.profiles.upsert.mockResolvedValueOnce({ error: { code: "23505", message: "duplicate key" } });
    expect(await submit()).toEqual({ fieldErrors: { username: "Nome de usuário já está em uso" } });
  });

  it("valida no servidor e não toca o banco com campo inválido", async () => {
    const result = await submit({ ...VALID_FIELDS, firstName: "", birthDate: "2999-01-01" });
    expect(result).toEqual({
      fieldErrors: { firstName: "Nome é obrigatório", birthDate: "A data de nascimento não pode ser no futuro" },
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("sem sessão, pede login de novo", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    expect(await submit()).toEqual({ error: "Sessão expirada. Faça login novamente." });
  });

  it("falha ao gravar a data devolve erro e não sai da tela", async () => {
    supabase.profilePrivate.upsert.mockResolvedValueOnce({ error: { code: "42501", message: "rls" } });
    expect(await submit()).toEqual({ error: "Não foi possível salvar. Tente novamente." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("falha nos metadados não vira erro: o perfil já foi salvo", async () => {
    supabase.auth.updateUser.mockResolvedValueOnce({ error: { message: "network" } });
    await expect(submit()).rejects.toThrow(redirectSignal("/perfil"));
  });
});
