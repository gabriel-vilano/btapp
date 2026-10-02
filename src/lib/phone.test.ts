import { describe, expect, it } from "vitest";
import {
  formatBrazilPhone,
  PHONE_CONSENT_REQUIRED,
  PHONE_INVALID,
  PHONE_REQUIRED,
  readPhoneForm,
  toBrazilE164,
  validatePhoneForm,
} from "./phone";

describe("toBrazilE164", () => {
  it.each([
    ["(31) 99999-0001", "+5531999990001"],
    ["31999990001", "+5531999990001"],
    ["+55 31 99999-0001", "+5531999990001"],
    ["5531999990001", "+5531999990001"],
    ["031 99999 0001", "+5531999990001"],
    ["(31) 3333-0001", "+553133330001"],
    // DDD 55 (Santa Maria): o 55 do começo é o DDD, não o código do país
    ["(55) 99999-0001", "+5555999990001"],
  ])("aceita %s", (input, expected) => {
    expect(toBrazilE164(input)).toBe(expected);
  });

  it.each([
    ["vazio", ""],
    ["sem DDD", "99999-0001"],
    ["DDD com zero", "(30) 99999-0001"],
    ["dígitos demais", "319999900011"],
    ["de outro país", "+1 415 555 0101"],
    ["letras", "trinta e um"],
  ])("recusa %s", (_case, input) => {
    expect(toBrazilE164(input)).toBeNull();
  });
});

describe("formatBrazilPhone", () => {
  it("formata celular e fixo", () => {
    expect(formatBrazilPhone("+5531999990001")).toBe("(31) 99999-0001");
    expect(formatBrazilPhone("+553133330001")).toBe("(31) 3333-0001");
  });

  it("devolve como veio o que não é E.164 do Brasil", () => {
    expect(formatBrazilPhone("+14155550101")).toBe("+14155550101");
  });
});

describe("validatePhoneForm", () => {
  it("passa com número válido e consentimento", () => {
    expect(validatePhoneForm({ phone: "(31) 99999-0001", consent: true })).toBeNull();
  });

  it("exige o consentimento (M21)", () => {
    expect(validatePhoneForm({ phone: "(31) 99999-0001", consent: false })).toEqual({
      consent: PHONE_CONSENT_REQUIRED,
    });
  });

  it("diz se o número falta ou é inválido", () => {
    expect(validatePhoneForm({ phone: " ", consent: true })).toEqual({ phone: PHONE_REQUIRED });
    expect(validatePhoneForm({ phone: "123", consent: true })).toEqual({ phone: PHONE_INVALID });
  });
});

describe("readPhoneForm", () => {
  it("lê a caixa marcada como `on` e a desmarcada como ausente", () => {
    const checked = new FormData();
    checked.set("phone", " 31999990001 ");
    checked.set("consent", "on");
    expect(readPhoneForm(checked)).toEqual({ phone: "31999990001", consent: true });
    expect(readPhoneForm(new FormData())).toEqual({ phone: "", consent: false });
  });
});
