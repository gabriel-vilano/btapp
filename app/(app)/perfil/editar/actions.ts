"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/server";
import { uploadAvatar } from "@/src/lib/supabase/uploadAvatar";
import { brasiliaToday } from "@/src/lib/brasiliaDateTime";
import { joinFullName } from "@/src/lib/names";
import {
  readEditProfileForm,
  validateEditProfile,
  type EditProfileState,
  type EditProfileValues,
} from "@/src/lib/profileEdit";
import { OWN_PROFILE_PATH } from "@/src/lib/domain/profile-page";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const SAVE_FAILED = "Não foi possível salvar. Tente novamente.";
const USERNAME_TAKEN = "Nome de usuário já está em uso";
// Código do Postgres para violação de unicidade: outro jogador pegou o @username
// entre a checagem e a gravação
const UNIQUE_VIOLATION = "23505";

// O próprio @username não conta como "em uso": quem não mexe nele salva normalmente
async function usernameTakenByOther(
  supabase: SupabaseServerClient,
  userId: string,
  username: string
): Promise<boolean | "error"> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", userId)
    .limit(1)
    .maybeSingle();
  if (error) return "error";
  return data !== null;
}

// Foto nova grava a URL com `?v=`: o caminho no bucket é sempre o mesmo
// (`<id>/avatar.<ext>`), e sem a versão o navegador e a CDN seguiriam com a antiga
async function newAvatarUrl(
  supabase: SupabaseServerClient,
  userId: string,
  avatarFile: FormDataEntryValue | null
): Promise<{ avatarUrl?: string } | { error: string }> {
  if (!(avatarFile instanceof File) || avatarFile.size === 0) return {};
  const uploaded = await uploadAvatar(supabase, userId, avatarFile);
  if ("error" in uploaded) return uploaded;
  return { avatarUrl: `${uploaded.avatarUrl}?v=${Date.now()}` };
}

// Upsert, e não update: o perfil pode não existir se o cadastro parou antes do passo 2.
// Sem foto nova, `avatar_url` fica fora do payload e a atual é mantida.
async function saveProfileRow(
  supabase: SupabaseServerClient,
  userId: string,
  values: EditProfileValues,
  avatarUrl: string | undefined
): Promise<EditProfileState> {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    first_name: values.firstName,
    last_name: values.lastName,
    full_name: joinFullName(values),
    username: values.username,
    updated_at: new Date().toISOString(),
    ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
  });
  if (!error) return null;
  if (error.code === UNIQUE_VIOLATION) return { fieldErrors: { username: USERNAME_TAKEN } };
  return { error: SAVE_FAILED };
}

// Data vazia grava `null`: é assim que o jogador apaga a data informada antes
async function saveBirthDate(supabase: SupabaseServerClient, userId: string, birthDate: string): Promise<boolean> {
  const { error } = await supabase.from("profile_private").upsert({
    id: userId,
    birth_date: birthDate || null,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

// Os metadados só alimentam a sugestão de @username do cadastro. A falha aqui não
// desfaz o que já foi salvo em `profiles`, então não vira erro para o jogador.
async function syncNameMetadata(supabase: SupabaseServerClient, values: EditProfileValues): Promise<void> {
  await supabase.auth.updateUser({
    data: { first_name: values.firstName, last_name: values.lastName, full_name: joinFullName(values) },
  });
}

async function checkUsername(supabase: SupabaseServerClient, user: User, username: string): Promise<EditProfileState> {
  const taken = await usernameTakenByOther(supabase, user.id, username);
  if (taken === "error") return { error: "Não foi possível verificar o nome de usuário. Tente novamente." };
  return taken ? { fieldErrors: { username: USERNAME_TAKEN } } : null;
}

/**
 * Salva "Editar perfil" (PROFILE.md PF9) e volta ao próprio perfil. Revalida tudo de
 * novo aqui, porque a action pode ser chamada direto, fora da tela.
 */
export async function updateProfile(_prevState: EditProfileState, formData: FormData): Promise<EditProfileState> {
  const values = readEditProfileForm(formData);
  const fieldErrors = validateEditProfile(values, brasiliaToday());
  if (fieldErrors) return { fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const usernameProblem = await checkUsername(supabase, user, values.username);
  if (usernameProblem) return usernameProblem;

  const avatar = await newAvatarUrl(supabase, user.id, formData.get("avatar"));
  if ("error" in avatar) return { error: avatar.error };

  const profileProblem = await saveProfileRow(supabase, user.id, values, avatar.avatarUrl);
  if (profileProblem) return profileProblem;
  if (!(await saveBirthDate(supabase, user.id, values.birthDate))) return { error: SAVE_FAILED };

  await syncNameMetadata(supabase, values);
  // A foto e o nome aparecem na casca (aba Perfil), que é do layout
  revalidatePath("/", "layout");
  redirect(OWN_PROFILE_PATH);
}
