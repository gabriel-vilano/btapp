const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const OTP_LENGTH = 8;
const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);

export const NAME_MAX_LENGTH = 30;

export function validateName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "Nome precisa ter pelo menos 2 caracteres" };
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres`,
    };
  }
  return { valid: true };
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
