import { describe, expect, it } from "vitest";

import { loginNoticeFor } from "./login-notice";

function paramsOf(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("loginNoticeFor", () => {
  it("sessão expirada mostra o aviso informativo", () => {
    expect(loginNoticeFor(paramsOf("expired=true"))).toEqual({
      status: "information",
      title: "Sua sessão expirou",
      description: "Por segurança, entre de novo.",
    });
  });

  it("sem parâmetro, não mostra aviso", () => {
    expect(loginNoticeFor(paramsOf(""))).toBeNull();
  });

  it("ignora expired com valor diferente de true", () => {
    expect(loginNoticeFor(paramsOf("expired=1"))).toBeNull();
  });

  it("senha redefinida mostra o aviso de sucesso", () => {
    expect(loginNoticeFor(paramsOf("recovered=true"))?.title).toBe("Senha redefinida com sucesso");
  });
});
