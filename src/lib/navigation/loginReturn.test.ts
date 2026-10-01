import { describe, expect, it } from "vitest";

import { safeReturnPath } from "./loginReturn";

describe("safeReturnPath", () => {
  it.each([
    ["/explorar?q=ana", "/explorar?q=ana"],
    ["/jogadores/lucas", "/jogadores/lucas"],
    ["/jogos/123#placar", "/jogos/123#placar"],
  ])("aceita o caminho interno %s", (candidate, expected) => {
    expect(safeReturnPath(candidate)).toBe(expected);
  });

  // Redirecionamento aberto: um link de phishing com `?next=` levaria para fora depois do login
  it.each([
    "//evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "/\\evil.com",
    "/\t/evil.com",
    "evil.com",
    "",
  ])("manda %j para o feed", (candidate) => {
    expect(safeReturnPath(candidate)).toBe("/feed");
  });

  it("sem valor, vai para o feed", () => {
    expect(safeReturnPath(null)).toBe("/feed");
    expect(safeReturnPath(undefined)).toBe("/feed");
  });
});
