import { describe, expect, it } from "vitest";
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
