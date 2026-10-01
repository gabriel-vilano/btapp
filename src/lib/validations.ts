const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const OTP_LENGTH = 8;
const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);

export const FIRST_NAME_MAX_LENGTH = 30;
// Sobrenome brasileiro costuma ter duas ou três palavras ("de Vasconcelos Albuquerque"
// tem 26 caracteres), por isso o limite é maior que o do nome
export const LAST_NAME_MAX_LENGTH = 40;
const NAME_PART_MIN_LENGTH = 2;

function validateNamePart(value: string, label: string, maxLength: number) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, error: `${label} é obrigatório` };
  }
  if (trimmed.length < NAME_PART_MIN_LENGTH) {
    return {
      valid: false,
      error: `${label} precisa ter pelo menos ${NAME_PART_MIN_LENGTH} caracteres`,
    };
  }
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${label} deve ter no máximo ${maxLength} caracteres` };
  }
  return { valid: true };
}

export function validateFirstName(firstName: string) {
  return validateNamePart(firstName, "Nome", FIRST_NAME_MAX_LENGTH);
}

export function validateLastName(lastName: string) {
  return validateNamePart(lastName, "Sobrenome", LAST_NAME_MAX_LENGTH);
}

export function validateEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: "E-mail é obrigatório" };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Formato de e-mail inválido" };
  }
  return { valid: true };
}

export type PasswordChecks = {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
};

export function validatePassword(password: string): {
  valid: boolean;
  checks: PasswordChecks;
} {
  const checks: PasswordChecks = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const valid = checks.minLength && checks.hasLetter && checks.hasNumber;
  return { valid, checks };
}

export function validateOtp(code: string) {
  if (!OTP_REGEX.test(code)) {
    return { valid: false, error: `Código precisa ter ${OTP_LENGTH} dígitos` };
  }
  return { valid: true };
}

const USERNAME_REGEX = /^[a-z0-9._]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

export function validateUsername(username: string) {
  if (!username) {
    return { valid: true };
  }
  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: `Nome de usuário precisa ter pelo menos ${USERNAME_MIN_LENGTH} caracteres` };
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: `Nome de usuário pode ter no máximo ${USERNAME_MAX_LENGTH} caracteres` };
  }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: "Apenas letras minúsculas, números, pontos e underscores" };
  }
  return { valid: true };
}

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

// 1MB decimal, não 1MiB: o body de uma server action tem limite padrão de 1MiB
// (1.048.576 bytes, `serverActions.bodySizeLimit` do Next). A folga de ~48KB cobre o
// resto do multipart (username, id da action), para uma foto que passa aqui nunca ser
// recusada pelo Next antes da action rodar. O bucket `avatars` usa o mesmo valor.
export const AVATAR_MAX_BYTES = 1_000_000;

export function validateAvatarType(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { valid: false, error: "Formato aceito: JPG, PNG ou WebP" };
  }
  return { valid: true };
}

export function validateAvatar(file: File) {
  const typeValidation = validateAvatarType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { valid: false, error: "Foto deve ter no máximo 1MB" };
  }
  return { valid: true };
}

const BIRTH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Piso só contra erro de digitação no ano (ex.: 0198): ninguém em quadra nasceu antes disso
export const BIRTH_DATE_MIN = "1900-01-01";

// "2026-02-30" passa no padrão, mas o Date o empurra para março: a volta tem de bater
function isRealCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Data de nascimento do `<input type="date">` (AAAA-MM-DD). Opcional: vazio é válido.
 * `today` vem de fora, no mesmo formato, para o "hoje" ser o de Brasília e o teste fixá-lo.
 * @example validateBirthDate("1990-05-12", "2026-10-01") // { valid: true }
 */
export function validateBirthDate(value: string, today: string) {
  if (!value) return { valid: true };
  if (!BIRTH_DATE_PATTERN.test(value) || !isRealCalendarDate(value)) {
    return { valid: false, error: "Data inválida. Use dia, mês e ano" };
  }
  if (value > today) {
    return { valid: false, error: "A data de nascimento não pode ser no futuro" };
  }
  if (value < BIRTH_DATE_MIN) {
    return { valid: false, error: "Confira o ano de nascimento" };
  }
  return { valid: true };
}
