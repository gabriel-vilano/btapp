"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { SETTINGS_PATH } from "@/src/lib/domain/profile-page";
import { PHONE_RETURN_PARAM, phoneReturnPath } from "@/src/lib/navigation/phoneSettings";
import { readPhoneForm, toBrazilE164, validatePhoneForm, type PhoneFormState } from "@/src/lib/phone";

const SAVE_FAILED = "Não foi possível salvar. Tente novamente.";
const DELETE_FAILED = "Não foi possível apagar. Tente novamente.";
const SESSION_EXPIRED = "Sessão expirada. Faça login novamente.";

async function signedInUserId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function returnPathOf(formData: FormData): string {
  const candidate = formData.get(PHONE_RETURN_PARAM);
  return phoneReturnPath(typeof candidate === "string" ? candidate : null);
}

/**
 * Salva o telefone com o consentimento (docs/SCHEDULING.md M20, M21). Revalida aqui,
 * porque a action pode ser chamada direto, fora da tela. Cada gravação é um
 * consentimento novo, dado agora: `phone_consented_at` registra quando.
 */
export async function savePhone(_prevState: PhoneFormState, formData: FormData): Promise<PhoneFormState> {
  const values = readPhoneForm(formData);
  const fieldErrors = validatePhoneForm(values);
  const phone = toBrazilE164(values.phone);
  if (fieldErrors || phone === null) return { fieldErrors: fieldErrors ?? {} };

  const supabase = await createClient();
  const userId = await signedInUserId(supabase);
  if (!userId) return { error: SESSION_EXPIRED };

  // Upsert, porque a linha só existe se o jogador já salvou a data de nascimento.
  // Só as colunas do telefone entram: a data de nascimento fica como está
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profile_private")
    .upsert({ id: userId, phone, phone_consented_at: now, updated_at: now });
  if (error) return { error: SAVE_FAILED };

  revalidatePath(SETTINGS_PATH);
  redirect(returnPathOf(formData));
}

/**
 * Apaga o telefone (M25): grava `null` no número e no consentimento, o que vale
 * como revogação. A tabela não aceita DELETE, e a linha guarda outros dados.
 */
export async function deletePhone(): Promise<PhoneFormState> {
  const supabase = await createClient();
  const userId = await signedInUserId(supabase);
  if (!userId) return { error: SESSION_EXPIRED };

  const { error } = await supabase
    .from("profile_private")
    .update({ phone: null, phone_consented_at: null, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return { error: DELETE_FAILED };

  revalidatePath(SETTINGS_PATH);
  redirect(SETTINGS_PATH);
}
