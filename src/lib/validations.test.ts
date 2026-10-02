import { describe, it, expect } from "vitest";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validateOtp,
  validateUsername,
  validateAvatar,
  validateAvatarType,
  validateBirthDate,
  AVATAR_MAX_BYTES,
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

describe("validateBirthDate", () => {
  const TODAY = "2026-10-01";

  it("vazio é válido: a data é opcional", () => {
    expect(validateBirthDate("", TODAY)).toEqual({ valid: true });
  });

  it("aceita uma data real no passado e o próprio dia de hoje", () => {
    expect(validateBirthDate("1990-05-12", TODAY)).toEqual({ valid: true });
    expect(validateBirthDate(TODAY, TODAY)).toEqual({ valid: true });
  });

  it("rejeita data que não existe no calendário", () => {
    expect(validateBirthDate("1990-02-30", TODAY)).toEqual({ valid: false, error: "Data inválida. Use dia, mês e ano" });
  });

  it("rejeita formato fora de AAAA-MM-DD", () => {
    expect(validateBirthDate("12/05/1990", TODAY).valid).toBe(false);
  });

  it("rejeita data no futuro", () => {
    expect(validateBirthDate("2026-10-02", TODAY)).toEqual({
      valid: false,
      error: "A data de nascimento não pode ser no futuro",
    });
  });

  it("rejeita ano antes de 1900, que é erro de digitação", () => {
    expect(validateBirthDate("0198-05-12", TODAY)).toEqual({ valid: false, error: "Confira o ano de nascimento" });
  });
});
