import { describe, expect, it } from "vitest";
import { PHONE_SETTINGS_PATH, phoneReturnPath, phoneSettingsHref } from "./phoneSettings";

describe("phoneSettingsHref", () => {
  it("sem origem, é a tela do telefone", () => {
    expect(phoneSettingsHref()).toBe(PHONE_SETTINGS_PATH);
  });

  it("leva a tela do confronto no parâmetro de volta", () => {
    expect(phoneSettingsHref("/jogos/match-1")).toBe("/perfil/configuracoes/telefone?volta=%2Fjogos%2Fmatch-1");
  });
});

describe("phoneReturnPath", () => {
  it("volta à tela do confronto", () => {
    expect(phoneReturnPath("/jogos/match-arena-mangaba-mb-r3-1")).toBe("/jogos/match-arena-mangaba-mb-r3-1");
  });

  it.each([null, undefined, "", "//evil.com", "/\\evil.com", "https://evil.com/jogos/1", "/jogos/1/resultado", "/feed"])(
    "qualquer outro destino (%s) vira as Configurações",
    (candidate) => {
      expect(phoneReturnPath(candidate)).toBe("/perfil/configuracoes");
    },
  );
});
