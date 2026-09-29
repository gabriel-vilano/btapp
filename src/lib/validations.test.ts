import { describe, it, expect } from "vitest";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validateOtp,
  validateUsername,
  slugifyName,
  validateAvatar,
} from "./validations";

describe("validateFirstName", () => {
  it("rejeita nome vazio ou só com espaços", () => {
    expect(validateFirstName("")).toEqual({ valid: false, error: "Nome é obrigatório" });
    expect(validateFirstName("   ")).toEqual({ valid: false, error: "Nome é obrigatório" });
  });

  it("rejeita nome com 1 caractere", () => {
    expect(validateFirstName("A")).toEqual({
      valid: false,
      error: "Nome precisa ter pelo menos 2 caracteres",
    });
  });

  it("aceita nome com 2 caracteres, ignorando espaços ao redor", () => {
    expect(validateFirstName("Jo").valid).toBe(true);
    expect(validateFirstName("  Jo  ").valid).toBe(true);
  });

  it("aceita nome composto no limite de 30 caracteres", () => {
    expect(validateFirstName("a".repeat(30)).valid).toBe(true);
    expect(validateFirstName("a".repeat(31))).toEqual({
      valid: false,
      error: "Nome deve ter no máximo 30 caracteres",
    });
  });
});

describe("validateLastName", () => {
  it("rejeita sobrenome vazio", () => {
    expect(validateLastName("  ")).toEqual({ valid: false, error: "Sobrenome é obrigatório" });
  });

  it("rejeita sobrenome com 1 caractere", () => {
    expect(validateLastName("S")).toEqual({
      valid: false,
      error: "Sobrenome precisa ter pelo menos 2 caracteres",
    });
  });

  it("aceita sobrenome com partícula e limite de 40 caracteres", () => {
    expect(validateLastName("de Vasconcelos Albuquerque").valid).toBe(true);
    expect(validateLastName("a".repeat(40)).valid).toBe(true);
    expect(validateLastName("a".repeat(41))).toEqual({
      valid: false,
      error: "Sobrenome deve ter no máximo 40 caracteres",
    });
  });
});

describe("validateEmail", () => {
  it("rejeita email vazio", () => {
    expect(validateEmail("").valid).toBe(false);
  });

  it("rejeita formato inválido", () => {
    expect(validateEmail("abc").valid).toBe(false);
    expect(validateEmail("abc@").valid).toBe(false);
    expect(validateEmail("@gmail.com").valid).toBe(false);
  });

  it("aceita formato válido", () => {
    expect(validateEmail("user@email.com").valid).toBe(true);
    expect(validateEmail("test.user@domain.co").valid).toBe(true);
  });
});

describe("validatePassword", () => {
  it("rejeita senha curta", () => {
    const result = validatePassword("Ab1");
    expect(result.valid).toBe(false);
    expect(result.checks.minLength).toBe(false);
  });

  it("rejeita senha sem letra", () => {
    const result = validatePassword("12345678");
    expect(result.valid).toBe(false);
    expect(result.checks.hasLetter).toBe(false);
  });

  it("rejeita senha sem número", () => {
    const result = validatePassword("abcdefgh");
    expect(result.valid).toBe(false);
    expect(result.checks.hasNumber).toBe(false);
  });

  it("aceita senha válida", () => {
    const result = validatePassword("Senha123");
    expect(result.valid).toBe(true);
    expect(result.checks.minLength).toBe(true);
    expect(result.checks.hasLetter).toBe(true);
    expect(result.checks.hasNumber).toBe(true);
  });
});

describe("validateOtp", () => {
  it("rejeita código com menos de 8 dígitos", () => {
    expect(validateOtp("1234567").valid).toBe(false);
  });

  it("rejeita código com letras", () => {
    expect(validateOtp("1234567a").valid).toBe(false);
  });

  it("rejeita código com mais de 8 dígitos", () => {
    expect(validateOtp("123456789").valid).toBe(false);
  });

  it("aceita código de 8 dígitos", () => {
    expect(validateOtp("12345678").valid).toBe(true);
  });
});

describe("validateUsername", () => {
  it("aceita username vazio (campo opcional)", () => {
    expect(validateUsername("").valid).toBe(true);
  });

  it("rejeita username com menos de 3 caracteres", () => {
    expect(validateUsername("ab").valid).toBe(false);
  });

  it("rejeita username com mais de 20 caracteres", () => {
    expect(validateUsername("a".repeat(21)).valid).toBe(false);
  });

  it("rejeita caracteres especiais", () => {
    expect(validateUsername("user@name").valid).toBe(false);
    expect(validateUsername("user name").valid).toBe(false);
    expect(validateUsername("User").valid).toBe(false);
  });

  it("aceita lowercase, números, pontos e underscores", () => {
    expect(validateUsername("gabriel.vilano").valid).toBe(true);
    expect(validateUsername("player_123").valid).toBe(true);
    expect(validateUsername("bt.pro").valid).toBe(true);
  });
});

describe("slugifyName", () => {
  it("converte para lowercase com pontos", () => {
    expect(slugifyName("Gabriel Vilano")).toBe("gabriel.vilano");
  });

  it("remove acentos", () => {
    expect(slugifyName("Jose da Silva")).toBe("jose.da.silva");
    expect(slugifyName("Joao")).toBe("joao");
  });

  it("remove caracteres especiais", () => {
    expect(slugifyName("Ana & Maria")).toBe("ana.maria");
  });

  it("limita a 20 caracteres", () => {
    const result = slugifyName("Nome Muito Grande Que Excede o Limite");
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("remove pontos duplicados", () => {
    expect(slugifyName("Ana  Maria")).toBe("ana.maria");
  });
});

describe("validateAvatar", () => {
  function createFile(type: string, sizeMB: number): File {
    const buffer = new ArrayBuffer(sizeMB * 1024 * 1024);
    return new File([buffer], "test.jpg", { type });
  }

  it("aceita JPEG", () => {
    expect(validateAvatar(createFile("image/jpeg", 1)).valid).toBe(true);
  });

  it("aceita PNG", () => {
    expect(validateAvatar(createFile("image/png", 1)).valid).toBe(true);
  });

  it("aceita WebP", () => {
    expect(validateAvatar(createFile("image/webp", 1)).valid).toBe(true);
  });

  it("rejeita GIF", () => {
    expect(validateAvatar(createFile("image/gif", 1)).valid).toBe(false);
  });

  it("rejeita arquivo maior que 5MB", () => {
    expect(validateAvatar(createFile("image/jpeg", 6)).valid).toBe(false);
  });
});
