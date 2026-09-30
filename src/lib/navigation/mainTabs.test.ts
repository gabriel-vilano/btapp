import { describe, expect, it } from "vitest";
import {
  arrivalTab,
  competitionArrivalTab,
  currentTab,
  isMainTab,
  mainTabHref,
  rememberTabRoot,
  tabAtRoot,
  tabBackHref,
} from "./mainTabs";

describe("tabAtRoot", () => {
  it.each([
    ["/feed", "feed"],
    ["/jogos", "jogos"],
    ["/competicoes", "competicoes"],
    ["/explorar", "explorar"],
    ["/perfil", "perfil"],
    ["/jogos/", "jogos"],
  ])("%s é a raiz da aba %s", (pathname, tab) => {
    expect(tabAtRoot(pathname)).toBe(tab);
  });

  it.each(["/jogos/p-123", "/competicoes/copa-tucum", "/perfil/configuracoes", "/jogadores", "/"])(
    "%s não é raiz de aba",
    (pathname) => {
      expect(tabAtRoot(pathname)).toBeNull();
    },
  );
});

describe("arrivalTab (N28)", () => {
  it.each([
    ["/jogos/p-123", "jogos"],
    ["/ranking/masculino-b", "competicoes"],
    ["/competicoes/copa-tucum", "competicoes"],
    ["/organizacoes/arena-mangaba", "explorar"],
    ["/jogadores/lucas", "feed"],
    ["/notificacoes", "feed"],
    ["/perfil/configuracoes", "perfil"],
    ["/rota-que-nao-existe", "feed"],
  ])("%s sem origem marca %s", (pathname, tab) => {
    expect(arrivalTab(pathname)).toBe(tab);
  });
});

describe("currentTab (N10)", () => {
  it("na raiz de uma aba, marca a própria aba mesmo vindo de outra", () => {
    expect(currentTab("/competicoes", "feed")).toBe("competicoes");
  });

  it("num detalhe aberto de dentro do app, mantém a aba de origem", () => {
    expect(currentTab("/jogos/p-123", "feed")).toBe("feed");
    expect(currentTab("/jogadores/lucas", "jogos")).toBe("jogos");
  });

  it("num detalhe sem origem, usa a aba dona da entidade", () => {
    expect(currentTab("/jogos/p-123", null)).toBe("jogos");
    expect(currentTab("/jogadores/lucas", null)).toBe("feed");
  });

  it("num detalhe sem origem, a aba que a tela declarou vence a da rota (N28)", () => {
    expect(currentTab("/competicoes/copa-tucum", null, "explorar")).toBe("explorar");
  });

  it("a aba de origem vence a declarada: de dentro do app, vale a N10", () => {
    expect(currentTab("/competicoes/copa-tucum", "feed", "explorar")).toBe("feed");
  });

  it("na raiz de uma aba, a declarada não muda nada", () => {
    expect(currentTab("/competicoes", null, "explorar")).toBe("competicoes");
  });
});

describe("competitionArrivalTab (N28)", () => {
  it("inscrito cai em Competições; quem não está inscrito, no Explorar", () => {
    expect(competitionArrivalTab(true)).toBe("competicoes");
    expect(competitionArrivalTab(false)).toBe("explorar");
  });
});

describe("rememberTabRoot e tabBackHref (N10, pilha por aba)", () => {
  it("guarda a raiz da aba com a query", () => {
    expect(rememberTabRoot({}, "/explorar", "q=ana&escopo=jogadores")).toEqual({
      explorar: "/explorar?q=ana&escopo=jogadores",
    });
  });

  it("a visita mais recente à raiz substitui a anterior, e a raiz limpa também conta", () => {
    const roots = rememberTabRoot({ explorar: "/explorar?q=ana" }, "/explorar", "");
    expect(roots).toEqual({ explorar: "/explorar" });
  });

  it("num detalhe, não muda nada", () => {
    const roots = { explorar: "/explorar?q=ana" };
    expect(rememberTabRoot(roots, "/jogadores/ana", "")).toBe(roots);
    expect(rememberTabRoot(roots, "/competicoes/copa-tucum", "aba=regras")).toBe(roots);
  });

  it("a mesma URL devolve o mesmo objeto, sem render a mais", () => {
    const roots = { feed: "/feed" };
    expect(rememberTabRoot(roots, "/feed", "")).toBe(roots);
  });

  it("\"Voltar\" leva à raiz como ela estava; sem visita, à raiz limpa", () => {
    const roots = { explorar: "/explorar?q=ana" };
    expect(tabBackHref(roots, "explorar")).toBe("/explorar?q=ana");
    expect(tabBackHref(roots, "competicoes")).toBe("/competicoes");
  });
});

describe("mainTabHref e isMainTab", () => {
  it("a raiz de cada aba é /<aba>", () => {
    expect(mainTabHref("competicoes")).toBe("/competicoes");
  });

  it("aceita só os valores das 5 abas", () => {
    expect(isMainTab("explorar")).toBe(true);
    expect(isMainTab("configuracoes")).toBe(false);
    expect(isMainTab(null)).toBe(false);
  });
});
