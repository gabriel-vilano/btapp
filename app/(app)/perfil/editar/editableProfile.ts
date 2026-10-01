import type { User } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/server";
import { splitFullName } from "@/src/lib/names";
import type { EditableProfile } from "@/src/lib/profileEdit";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
};

type ProfilePrivateRow = { birth_date: string | null };

// Perfil antigo, de antes do nome e sobrenome separados, pode ter só o `full_name`
function nameOf(row: ProfileRow): { firstName: string; lastName: string } {
  if (row.first_name) return { firstName: row.first_name, lastName: row.last_name ?? "" };
  return splitFullName(row.full_name);
}

// Sem linha em `profiles` (cadastro interrompido antes do passo 2), o nome vem dos
// metadados do cadastro e o @username fica para o jogador escolher
function fromMetadata(user: User): EditableProfile {
  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const name =
    typeof metadata.first_name === "string"
      ? { firstName: metadata.first_name, lastName: typeof metadata.last_name === "string" ? metadata.last_name : "" }
      : splitFullName(fullName);
  return { ...name, username: "", avatarUrl: null, birthDate: "" };
}

async function readRows(supabase: SupabaseServerClient, userId: string) {
  const [profile, privateData] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, full_name, username, avatar_url")
      .eq("id", userId)
      .maybeSingle<ProfileRow>(),
    supabase.from("profile_private").select("birth_date").eq("id", userId).maybeSingle<ProfilePrivateRow>(),
  ]);
  return { profile, privateData };
}

/**
 * Dados do jogador logado para "Editar perfil" (PROFILE.md PF9), com a data de
 * nascimento, que só o dono lê (`profile_private`).
 * `null` sem sessão ou com erro numa das leituras: a tela mostra o erro em vez de um
 * formulário vazio, que, salvo, apagaria a data de nascimento gravada.
 */
export async function loadEditableProfile(): Promise<EditableProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { profile, privateData } = await readRows(supabase, user.id);
  if (profile.error || privateData.error) return null;

  const birthDate = privateData.data?.birth_date ?? "";
  if (!profile.data) return { ...fromMetadata(user), birthDate };
  return {
    ...nameOf(profile.data),
    username: profile.data.username ?? "",
    avatarUrl: profile.data.avatar_url,
    birthDate,
  };
}
