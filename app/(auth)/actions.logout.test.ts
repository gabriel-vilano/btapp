import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/src/lib/supabase/server";
import { logout } from "./actions";
import { asSupabaseClient, createSupabaseMock, redirectSignal, type SupabaseMock } from "./actions.test-utils";

vi.mock("@/src/lib/supabase/server", () => ({ createClient: vi.fn() }));
// redirect() real lança NEXT_REDIRECT e interrompe a action; o mock imita isso
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

let supabase: SupabaseMock;

beforeEach(() => {
  supabase = createSupabaseMock();
  vi.mocked(createClient).mockResolvedValue(asSupabaseClient(supabase));
});

describe("logout", () => {
  it("encerra a sessão e volta para o login", async () => {
    await expect(logout()).rejects.toThrow(redirectSignal("/entrar"));
  });

  // O padrão do auth-js é `global`, que derrubaria o jogador em todos os aparelhos
  it("sai só deste aparelho (escopo local)", async () => {
    await expect(logout()).rejects.toThrow(redirectSignal("/entrar"));
    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("erro do Supabase: fica na tela com mensagem neutra, sem vazar o erro interno", async () => {
    supabase.auth.signOut.mockResolvedValueOnce({
      error: { message: "AuthRetryableFetchError: connection to auth-internal-7 refused" },
    });
    const result = await logout();
    expect(result).toEqual({ error: "Não foi possível sair. Tente novamente." });
  });
});
