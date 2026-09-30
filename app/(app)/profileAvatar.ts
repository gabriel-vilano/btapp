import { createClient } from "@/src/lib/supabase/server";

type ProfileAvatarRow = { avatar_url: string | null; full_name: string };

export type ProfileAvatar = { url: string | null; alt: string };

/**
 * Foto do jogador logado para a aba Perfil (NAVIGATION.md, N1).
 * Sem perfil (cadastro sem o passo 2) ou com erro na consulta, devolve `null` e a aba
 * mostra o ícone: a navegação não depende da foto.
 */
export async function loadProfileAvatar(): Promise<ProfileAvatar | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_url, full_name")
    .eq("id", user.id)
    .maybeSingle<ProfileAvatarRow>();
  if (error || !data) return null;

  return { url: data.avatar_url, alt: data.full_name };
}
