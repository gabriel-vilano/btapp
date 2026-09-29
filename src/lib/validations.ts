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

export function validateUsername(username: string) {
  if (!username) {
    return { valid: true };
  }
  if (username.length < 3) {
    return { valid: false, error: "Username precisa ter pelo menos 3 caracteres" };
  }
  if (username.length > 20) {
    return { valid: false, error: "Username pode ter no máximo 20 caracteres" };
  }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: "Apenas letras minúsculas, números, pontos e underscores" };
  }
  return { valid: true };
}

export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 20);
}

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function validateAvatar(file: File) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { valid: false, error: "Formato aceito: JPG, PNG ou WebP" };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { valid: false, error: "Foto deve ter no máximo 5MB" };
  }
  return { valid: true };
}
