import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

vi.mock("@/src/lib/supabase/env", () => ({
  getSupabasePublicEnv: () => ({ url: "http://localhost:54321", publishableKey: "sb_publishable_test" }),
}));

const { proxy } = await import("./proxy");

const STALE_SESSION_COOKIE = "sb-127-auth-token=token-expirado";

function requestTo(path: string, cookie?: string): NextRequest {
  const headers = cookie ? { cookie } : undefined;
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers });
}

function loggedOut() {
  getUser.mockResolvedValue({ data: { user: null } });
}

describe("proxy — rota protegida sem usuário", () => {
  beforeEach(() => getUser.mockReset());

  // Regressão: o proxy mandava para `/?expired=true` e o redirect("/entrar")
  // da página raiz descartava o parâmetro, então o aviso nunca aparecia.
  it("com cookie de sessão inválido, vai direto para /entrar?expired=true", async () => {
    loggedOut();

    const response = await proxy(requestTo("/feed", STALE_SESSION_COOKIE));

    expect(response.headers.get("location")).toBe("http://localhost:3000/entrar?expired=true");
  });

  it("sem cookie de sessão, vai para /entrar sem aviso", async () => {
    loggedOut();

    const response = await proxy(requestTo("/feed"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/entrar");
  });

  it("não redireciona rota de auth pública, mesmo com cookie inválido", async () => {
    loggedOut();

    const response = await proxy(requestTo("/entrar?expired=true", STALE_SESSION_COOKIE));

    expect(response.headers.get("location")).toBeNull();
  });
});

describe("proxy — volta para a tela do link depois do login (EX21, PF20)", () => {
  beforeEach(() => {
    getUser.mockReset();
    loggedOut();
  });

  it.each([
    ["/explorar?q=ana", "http://localhost:3000/entrar?next=%2Fexplorar%3Fq%3Dana"],
    ["/jogadores/lucas", "http://localhost:3000/entrar?next=%2Fjogadores%2Flucas"],
  ])("guarda o caminho pedido %s", async (path, expected) => {
    const response = await proxy(requestTo(path));

    expect(response.headers.get("location")).toBe(expected);
  });

  it("guarda o caminho junto com o aviso de sessão expirada", async () => {
    const response = await proxy(requestTo("/jogadores/lucas", STALE_SESSION_COOKIE));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/entrar?expired=true&next=%2Fjogadores%2Flucas"
    );
  });

  // `//evil.com` no caminho da requisição viraria redirecionamento aberto depois do login
  it("não guarda caminho que aponta para outra origem", async () => {
    const response = await proxy(new NextRequest("http://localhost:3000//evil.com"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/entrar");
  });
});

describe("proxy — usuário logado", () => {
  it("em rota de auth pública, vai para /feed", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });

    const response = await proxy(requestTo("/entrar"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/feed");
  });
});
