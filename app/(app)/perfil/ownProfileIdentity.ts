import { createClient } from "@/src/lib/supabase/server";
import { joinFullName } from "@/src/lib/names";
import type { Player } from "@/src/types/domain/people";
import { nameOf, type ProfileRow } from "./editar/editableProfile";

export type OwnProfileIdentity = Pick<Player, "name" | "username" | "avatar_url">;

/**
 * Nome, @username e foto do jogador logado, para o cabeçalho de `/perfil` (ENG-140).
 * Só `profiles`: a data de nascimento (`profile_private`) não aparece no perfil (PF9).
 * `null` sem sessão, sem perfil, sem @username ou com erro na consulta.
 */
export async function loadOwnProfileIdentity(): Promise<OwnProfileIdentity | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("first_name, last_name, full_name, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();
  if (error || !data?.username) return null;

  return { name: joinFullName(nameOf(data)), username: data.username, avatar_url: data.avatar_url };
}
