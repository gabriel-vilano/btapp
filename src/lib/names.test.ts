import { describe, expect, it } from "vitest";
import { abbreviateName, joinFullName, splitFullName } from "./names";

describe("abbreviateName", () => {
  it("mantém o nome inteiro e abrevia o sobrenome", () => {
    expect(abbreviateName({ firstName: "João Pedro", lastName: "Silva" })).toBe("João Pedro S.");
    expect(abbreviateName({ firstName: "Gabriel", lastName: "Vilano" })).toBe("Gabriel V.");
  });

  it("usa a inicial da última palavra do sobrenome", () => {
    expect(abbreviateName({ firstName: "Ana", lastName: "Souza Lima" })).toBe("Ana L.");
  });

  it("ignora partículas", () => {
    expect(abbreviateName({ firstName: "Maria", lastName: "de Vasconcelos Albuquerque" })).toBe(
      "Maria A.",
    );
    expect(abbreviateName({ firstName: "José", lastName: "Silva e Santos" })).toBe("José S.");
    expect(abbreviateName({ firstName: "Rita", lastName: "Costa Dos" })).toBe("Rita C.");
  });

  it("sobrenome só de partícula: usa a partícula em vez de sumir", () => {
    expect(abbreviateName({ firstName: "Lia", lastName: "da" })).toBe("Lia D.");
  });

  it("inicial maiúscula mesmo com sobrenome em minúsculas", () => {
    expect(abbreviateName({ firstName: "Bia", lastName: "ávila" })).toBe("Bia Á.");
  });

  it("normaliza espaços extras", () => {
    expect(abbreviateName({ firstName: "  João   Pedro ", lastName: "  Silva " })).toBe("João Pedro S.");
  });

  it("sem sobrenome: só o nome", () => {
    expect(abbreviateName({ firstName: "Gabriel", lastName: "" })).toBe("Gabriel");
  });
});

describe("splitFullName", () => {
  it("primeira palavra é o nome, o resto é o sobrenome", () => {
    expect(splitFullName("João Pedro Silva")).toEqual({ firstName: "João", lastName: "Pedro Silva" });
  });

  it("uma palavra só: sobrenome vazio", () => {
    expect(splitFullName("Gabriel")).toEqual({ firstName: "Gabriel", lastName: "" });
  });

  it("normaliza espaços extras", () => {
    expect(splitFullName("  Ana   Souza  Lima ")).toEqual({ firstName: "Ana", lastName: "Souza Lima" });
  });

  it("vazio: nome e sobrenome vazios", () => {
    expect(splitFullName("   ")).toEqual({ firstName: "", lastName: "" });
  });
});

describe("joinFullName", () => {
  it("junta nome e sobrenome com um espaço", () => {
    expect(joinFullName({ firstName: " João Pedro ", lastName: " da  Silva" })).toBe("João Pedro da Silva");
  });
});
