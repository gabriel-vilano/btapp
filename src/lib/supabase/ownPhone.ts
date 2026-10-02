import { createClient } from "@/src/lib/supabase/server";

/** O telefone do jogador logado: o número em E.164, `null` sem número, ou `"error"` se a leitura falhou. */
export type OwnPhone = string | null | "error";

/**
 * Lê o telefone do próprio jogador em `profile_private`, que só o dono lê
 * (docs/SCHEDULING.md M23). Sem sessão, devolve `"error"`: quem chega sem
 * login é mandado ao /entrar pelo proxy.
 * @example const phone = await loadOwnPhone(); // "+5531999990001"
 */
export async function loadOwnPhone(): Promise<OwnPhone> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "error";
  const { data, error } = await supabase
    .from("profile_private")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle<{ phone: string | null }>();
  if (error) return "error";
  return data?.phone ?? null;
}
