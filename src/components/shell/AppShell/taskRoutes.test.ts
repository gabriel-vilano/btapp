import { describe, expect, it } from "vitest";
import { currentTab, mainTabHref } from "@/src/lib/navigation/mainTabs";
import { isTaskRoute } from "./taskRoutes";

describe("isTaskRoute", () => {
  it("reconhece o fluxo de lançar o resultado (N18)", () => {
    expect(isTaskRoute("/jogos/match-1/resultado")).toBe(true);
    expect(isTaskRoute("/jogos/match-1/resultado/")).toBe(true);
  });

  it("não esconde a navegação na partida nem nas abas (N4)", () => {
    expect(isTaskRoute("/jogos/match-1")).toBe(false);
    expect(isTaskRoute("/jogos")).toBe(false);
    expect(isTaskRoute("/feed")).toBe(false);
  });
});

describe("rota de tarefa dentro da casca (N10)", () => {
  it("mantém a aba de origem ao lançar pelo Feed, e o Voltar leva de volta a ela", () => {
    // Feed → partida → lançar: nenhuma das duas é raiz de aba, a origem segue
    const onMatch = currentTab("/jogos/match-1", "feed");
    const onReport = currentTab("/jogos/match-1/resultado", onMatch);
    expect(onReport).toBe("feed");
    // "Fechar" volta à partida, que continua com o Feed marcado
    expect(currentTab("/jogos/match-1", onReport)).toBe("feed");
    expect(mainTabHref(onReport)).toBe("/feed");
  });
});
