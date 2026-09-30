import { describe, expect, it } from "vitest";
import { arrivalTab, currentTab, isMainTab, mainTabHref, tabAtRoot } from "./mainTabs";

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
    ["/arenas/arena-mangaba", "explorar"],
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
