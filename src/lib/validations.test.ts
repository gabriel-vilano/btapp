import { describe, it, expect } from "vitest";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateOtp,
  validateUsername,
  slugifyName,
  validateAvatar,
  validateAvatarType,
  AVATAR_MAX_BYTES,
} from "./validations";

describe("validateName", () => {
  it("rejeita nome vazio", () => {
    expect(validateName("").valid).toBe(false);
  });

  it("rejeita nome com 1 caractere", () => {
    expect(validateName("A").valid).toBe(false);
  });

  it("aceita nome com 2 caracteres", () => {
    expect(validateName("Jo").valid).toBe(true);
  });

  it("ignora espaços ao redor", () => {
    expect(validateName("  Jo  ").valid).toBe(true);
  });

  it("rejeita nome com apenas espaços", () => {
    expect(validateName("   ").valid).toBe(false);
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
  function createFile(type: string, bytes: number): File {
    return new File([new ArrayBuffer(bytes)], "test.jpg", { type });
  }

  it("aceita JPEG", () => {
    expect(validateAvatar(createFile("image/jpeg", 100_000)).valid).toBe(true);
  });

  it("aceita PNG", () => {
    expect(validateAvatar(createFile("image/png", 100_000)).valid).toBe(true);
  });

  it("aceita WebP", () => {
    expect(validateAvatar(createFile("image/webp", 100_000)).valid).toBe(true);
  });

  it("rejeita GIF", () => {
    expect(validateAvatar(createFile("image/gif", 100_000)).valid).toBe(false);
  });

  it("aceita arquivo com exatamente AVATAR_MAX_BYTES", () => {
    expect(validateAvatar(createFile("image/jpeg", AVATAR_MAX_BYTES)).valid).toBe(true);
  });

  // Regressão: a tela aceitava até 5MB, mas o bucket (2MB) e o body da server action
  // (1MiB) recusavam no envio. Uma foto de 3MB tem que ser barrada já na validação.
  it("rejeita foto de 3MB com a mensagem de 1MB", () => {
    expect(validateAvatar(createFile("image/jpeg", 3 * 1024 * 1024))).toEqual({
      valid: false,
      error: "Foto deve ter no máximo 1MB",
    });
  });

  it("rejeita arquivo 1 byte acima de AVATAR_MAX_BYTES", () => {
    expect(validateAvatar(createFile("image/jpeg", AVATAR_MAX_BYTES + 1)).valid).toBe(false);
  });

  // O resto do multipart (username, id da action) precisa caber junto no body da action
  it("deixa folga para o resto do form no body de 1MiB da server action", () => {
    const NEXT_SERVER_ACTION_BODY_LIMIT = 1024 * 1024;
    expect(NEXT_SERVER_ACTION_BODY_LIMIT - AVATAR_MAX_BYTES).toBeGreaterThanOrEqual(32 * 1024);
  });
});

describe("validateAvatarType", () => {
  it("aceita JPEG de qualquer tamanho (o tamanho é checado depois do redimensionamento)", () => {
    const photo = new File([new ArrayBuffer(8 * 1024 * 1024)], "foto.jpg", { type: "image/jpeg" });
    expect(validateAvatarType(photo).valid).toBe(true);
  });

  it("rejeita HEIC", () => {
    const photo = new File(["x"], "foto.heic", { type: "image/heic" });
    expect(validateAvatarType(photo)).toEqual({ valid: false, error: "Formato aceito: JPG, PNG ou WebP" });
  });
});
