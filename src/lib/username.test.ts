import { describe, expect, it } from "vitest";
import { validateUsername } from "./validations";
import {
  USERNAME_FALLBACK_BASE,
  pickFreeUsername,
  usernameBaseFromName,
  usernameCandidate,
  usernameSearchPrefix,
} from "./username";

describe("usernameBaseFromName", () => {
  it("junta nome e sobrenome em minúsculas, sem espaço", () => {
    expect(usernameBaseFromName({ firstName: "Gabriel", lastName: "Vilano" })).toBe("gabrielvilano");
  });

  it("remove acentos e cedilha", () => {
    expect(usernameBaseFromName({ firstName: "Conceição", lastName: "Araújo" })).toBe("conceicaoaraujo");
  });

  it("remove partículas do sobrenome", () => {
    expect(usernameBaseFromName({ firstName: "Ana Clara", lastName: "de Souza" })).toBe("anaclarasouza");
    expect(usernameBaseFromName({ firstName: "José", lastName: "dos Santos e Silva" })).toBe("josesantossilva");
  });

  it("mantém a primeira palavra mesmo quando parece partícula", () => {
    expect(usernameBaseFromName({ firstName: "Da", lastName: "Costa" })).toBe("dacosta");
  });

  it("descarta hífen, apóstrofo e outros símbolos", () => {
    expect(usernameBaseFromName({ firstName: "Anne-Marie", lastName: "D'Ávila" })).toBe("annemariedavila");
  });

  it("nome longo é cortado no limite da validateUsername", () => {
    const base = usernameBaseFromName({ firstName: "Maria Eduarda", lastName: "de Vasconcelos Albuquerque" });
    expect(base).toBe("mariaeduardavasconce");
    expect(validateUsername(base)).toEqual({ valid: true });
  });

  it("nome curto que ainda passa no mínimo fica como está", () => {
    expect(usernameBaseFromName({ firstName: "Li", lastName: "Wu" })).toBe("liwu");
  });

  it("sem letras latinas suficientes, cai no prefixo padrão", () => {
    expect(usernameBaseFromName({ firstName: "李", lastName: "" })).toBe(USERNAME_FALLBACK_BASE);
    expect(usernameBaseFromName({ firstName: "", lastName: "" })).toBe(USERNAME_FALLBACK_BASE);
  });
});

describe("usernameCandidate", () => {
  it("a primeira variação é a própria base", () => {
    expect(usernameCandidate("gabrielvilano", 1)).toBe("gabrielvilano");
  });

  it("as seguintes ganham o número no fim", () => {
    expect(usernameCandidate("gabrielvilano", 2)).toBe("gabrielvilano2");
  });

  it("base no limite é cortada para o número caber", () => {
    const candidate = usernameCandidate("mariaeduardavasconce", 12);
    expect(candidate).toBe("mariaeduardavascon12");
    expect(validateUsername(candidate)).toEqual({ valid: true });
  });
});

describe("usernameSearchPrefix", () => {
  it("é prefixo de todas as variações, mesmo com número de 4 dígitos", () => {
    const base = "mariaeduardavasconce";
    const prefix = usernameSearchPrefix(base);
    expect(usernameCandidate(base, 1).startsWith(prefix)).toBe(true);
    expect(usernameCandidate(base, 9999).startsWith(prefix)).toBe(true);
  });
});

describe("pickFreeUsername", () => {
  it("base livre: usa a base", () => {
    expect(pickFreeUsername("ana", new Set())).toBe("ana");
  });

  it("base em uso: primeiro número livre, começando em 2", () => {
    expect(pickFreeUsername("ana", new Set(["ana"]))).toBe("ana2");
    expect(pickFreeUsername("ana", new Set(["ana", "ana2", "ana3"]))).toBe("ana4");
  });

  it("buraco na sequência é reaproveitado", () => {
    expect(pickFreeUsername("ana", new Set(["ana", "ana3"]))).toBe("ana2");
  });

  it("todas as variações em uso: null", () => {
    const taken = new Set(Array.from({ length: 9999 }, (_, i) => usernameCandidate("ana", i + 1)));
    expect(pickFreeUsername("ana", taken)).toBeNull();
  });
});
