import {
  validateBirthDate,
  validateFirstName,
  validateLastName,
  validateUsername,
} from "@/src/lib/validations";

/** O que a tela "Editar perfil" mostra e grava (PROFILE.md PF9). */
export type EditableProfile = {
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  /** `AAAA-MM-DD`, ou vazio quando o jogador não informou. */
  birthDate: string;
};

export type EditProfileField = "firstName" | "lastName" | "username" | "birthDate";

export type EditProfileFieldErrors = Partial<Record<EditProfileField, string>>;

export type EditProfileState = { error?: string; fieldErrors?: EditProfileFieldErrors } | null;

export type EditProfileValues = Omit<EditableProfile, "avatarUrl">;

/**
 * Lê os campos de texto do formulário, sem espaços nas pontas. A foto vem à parte.
 * @example readEditProfileForm(formData).username // "lucas.bt"
 */
export function readEditProfileForm(formData: FormData): EditProfileValues {
  const text = (name: EditProfileField) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  return {
    firstName: text("firstName"),
    lastName: text("lastName"),
    username: text("username"),
    birthDate: text("birthDate"),
  };
}

// No cadastro o @username pode ficar vazio (vira a sugestão); aqui ele já existe e
// apagá-lo tiraria o jogador da rota /jogadores/[username] (PF20)
function usernameError(username: string): string | undefined {
  if (!username) return "Nome de usuário é obrigatório";
  return validateUsername(username).error;
}

/**
 * Erros de formato por campo, ou `null` se tudo vale. A unicidade do @username é do servidor.
 * `today` é o dia de hoje em Brasília (`brasiliaToday()`), no formato `AAAA-MM-DD`.
 * @example validateEditProfile(values, "2026-10-01") // { birthDate: "A data de nascimento não pode ser no futuro" }
 */
export function validateEditProfile(values: EditProfileValues, today: string): EditProfileFieldErrors | null {
  const errors: EditProfileFieldErrors = {
    firstName: validateFirstName(values.firstName).error,
    lastName: validateLastName(values.lastName).error,
    username: usernameError(values.username),
    birthDate: validateBirthDate(values.birthDate, today).error,
  };
  const present = Object.entries(errors).filter(([, message]) => message !== undefined);
  return present.length === 0 ? null : Object.fromEntries(present);
}
