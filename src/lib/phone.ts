/**
 * Telefone para o "Abrir no WhatsApp" (docs/SCHEDULING.md §7). No MVP, só números
 * do Brasil (+55). O banco guarda em E.164 (`+5531999990001`), o formato que o
 * link `wa.me` usa sem o `+`, e o mesmo do check da migration.
 */

const BRAZIL_COUNTRY_CODE = "55";
// DDD de dois dígitos sem zero, e 8 (fixo) ou 9 dígitos (celular). Igual ao check
// `profile_private_phone_format` da migration: o que passa aqui passa no banco
const BRAZIL_E164 = /^\+55[1-9]{2}[0-9]{8,9}$/;
const NATIONAL_LENGTHS = new Set([10, 11]);

export const PHONE_REQUIRED = "Informe o telefone com DDD";
export const PHONE_INVALID = "Telefone inválido. Use o DDD e o número, ex.: (31) 99999-0001";
export const PHONE_CONSENT_REQUIRED = "Marque a caixa para salvar o telefone";

/** Texto da finalidade ao lado da caixa de consentimento (M21, M22). */
export const PHONE_CONSENT_TEXT =
  "Mostrar meu telefone aos adversários e ao meu parceiro enquanto o jogo não acontece, para marcarmos pelo WhatsApp";

/**
 * Número digitado → E.164 do Brasil, ou `null` se não for um número brasileiro válido.
 * Aceita máscara, espaços, o `+55` e o zero de operadora na frente do DDD.
 * @example toBrazilE164("(31) 99999-0001") // "+5531999990001"
 */
export function toBrazilE164(input: string): string | null {
  const digits = input.replace(/\D/g, "").replace(/^0+/, "");
  // Com `+`, o que vem depois é o código do país: `+1 415 555 0101` tem 11
  // dígitos, como um celular brasileiro, mas é dos Estados Unidos
  const hasCountryCode = input.trim().startsWith("+");
  const national =
    !hasCountryCode && NATIONAL_LENGTHS.has(digits.length) ? digits : withoutCountryCode(digits);
  if (national === null) return null;
  const e164 = `+${BRAZIL_COUNTRY_CODE}${national}`;
  return BRAZIL_E164.test(e164) ? e164 : null;
}

function withoutCountryCode(digits: string): string | null {
  if (!digits.startsWith(BRAZIL_COUNTRY_CODE)) return null;
  const national = digits.slice(BRAZIL_COUNTRY_CODE.length);
  return NATIONAL_LENGTHS.has(national.length) ? national : null;
}

/**
 * E.164 do Brasil → como o jogador lê o número.
 * @example formatBrazilPhone("+5531999990001") // "(31) 99999-0001"
 */
export function formatBrazilPhone(e164: string): string {
  if (!BRAZIL_E164.test(e164)) return e164;
  const national = e164.slice(1 + BRAZIL_COUNTRY_CODE.length);
  const ddd = national.slice(0, 2);
  const number = national.slice(2);
  const split = number.length - 4;
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`;
}

export type PhoneFormValues = { phone: string; consent: boolean };

export type PhoneFieldErrors = Partial<Record<keyof PhoneFormValues, string>>;

/** Resposta das actions de salvar e apagar o telefone. `null` antes do primeiro envio. */
export type PhoneFormState = { error?: string; fieldErrors?: PhoneFieldErrors } | null;

/**
 * Erros por campo, ou `null` se o número vale e o consentimento foi dado (M21).
 * @example validatePhoneForm({ phone: "31999990001", consent: false }) // { consent: PHONE_CONSENT_REQUIRED }
 */
export function validatePhoneForm(values: PhoneFormValues): PhoneFieldErrors | null {
  const errors: PhoneFieldErrors = {};
  if (!values.phone.trim()) errors.phone = PHONE_REQUIRED;
  else if (toBrazilE164(values.phone) === null) errors.phone = PHONE_INVALID;
  if (!values.consent) errors.consent = PHONE_CONSENT_REQUIRED;
  return Object.keys(errors).length === 0 ? null : errors;
}

/**
 * Lê o formulário do telefone. A caixa desmarcada não vai no `FormData`.
 * @example readPhoneForm(formData) // { phone: "(31) 99999-0001", consent: true }
 */
export function readPhoneForm(formData: FormData): PhoneFormValues {
  const phone = formData.get("phone");
  return { phone: typeof phone === "string" ? phone.trim() : "", consent: formData.get("consent") === "on" };
}
