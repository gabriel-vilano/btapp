import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { buildFormData, redirectSignal } from "@/app/(auth)/actions.test-utils";
import { deletePhone, savePhone } from "./actions";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// redirect() real lança NEXT_REDIRECT e interrompe a action; o mock imita isso
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function createSupabaseMock() {
  const profilePrivate = {
    upsert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn(),
    eq: vi.fn().mockResolvedValue({ error: null }),
  };
  profilePrivate.update.mockReturnValue(profilePrivate);
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } }) },
    from: vi.fn().mockReturnValue(profilePrivate),
    profilePrivate,
  };
}

let supabase: ReturnType<typeof createSupabaseMock>;

beforeEach(() => {
  vi.clearAllMocks();
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>);
});

const VALID_FIELDS = { phone: "(31) 99999-0001", consent: "on" };
const SETTINGS = "/perfil/configuracoes";

describe("savePhone", () => {
  it("grava o número em E.164 com o momento do consentimento e volta às Configurações", async () => {
    await expect(savePhone(null, buildFormData(VALID_FIELDS))).rejects.toThrow(redirectSignal(SETTINGS));

    expect(supabase.from).toHaveBeenCalledWith("profile_private");
    const row = supabase.profilePrivate.upsert.mock.calls[0][0];
    expect(row).toEqual({
      id: "user-123",
      phone: "+5531999990001",
      phone_consented_at: expect.any(String),
      updated_at: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(row.phone_consented_at))).toBe(false);
    expect(revalidatePath).toHaveBeenCalledWith(SETTINGS);
  });

  it("não mexe na data de nascimento, que mora na mesma linha", async () => {
    await expect(savePhone(null, buildFormData(VALID_FIELDS))).rejects.toThrow(redirectSignal(SETTINGS));
    expect(Object.keys(supabase.profilePrivate.upsert.mock.calls[0][0])).not.toContain("birth_date");
  });

  it("sem consentimento, não salva (M21)", async () => {
    const result = await savePhone(null, buildFormData({ phone: "(31) 99999-0001" }));
    expect(result).toEqual({ fieldErrors: { consent: "Marque a caixa para salvar o telefone" } });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("número de fora do Brasil ou incompleto volta como erro do campo", async () => {
    const result = await savePhone(null, buildFormData({ phone: "+1 415 555 0101", consent: "on" }));
    expect(result?.fieldErrors?.phone).toMatch(/^Telefone inválido/);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("vindo do confronto, volta para ele", async () => {
    const fields = { ...VALID_FIELDS, volta: "/jogos/match-1" };
    await expect(savePhone(null, buildFormData(fields))).rejects.toThrow(redirectSignal("/jogos/match-1"));
  });

  it("ignora um destino de volta fora do app", async () => {
    const fields = { ...VALID_FIELDS, volta: "//evil.com" };
    await expect(savePhone(null, buildFormData(fields))).rejects.toThrow(redirectSignal(SETTINGS));
  });

  it("sem sessão, pede login de novo", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    expect(await savePhone(null, buildFormData(VALID_FIELDS))).toEqual({
      error: "Sessão expirada. Faça login novamente.",
    });
  });

  it("falha ao gravar devolve erro e não sai da tela", async () => {
    supabase.profilePrivate.upsert.mockResolvedValueOnce({ error: { code: "23514", message: "check" } });
    expect(await savePhone(null, buildFormData(VALID_FIELDS))).toEqual({
      error: "Não foi possível salvar. Tente novamente.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deletePhone", () => {
  it("grava null no número e no consentimento, só na linha do jogador (M25)", async () => {
    await expect(deletePhone()).rejects.toThrow(redirectSignal(SETTINGS));
    expect(supabase.profilePrivate.update).toHaveBeenCalledWith(
      expect.objectContaining({ phone: null, phone_consented_at: null })
    );
    expect(supabase.profilePrivate.eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("falha ao apagar devolve erro", async () => {
    supabase.profilePrivate.eq.mockResolvedValueOnce({ error: { message: "network" } });
    expect(await deletePhone()).toEqual({ error: "Não foi possível apagar. Tente novamente." });
  });
});
