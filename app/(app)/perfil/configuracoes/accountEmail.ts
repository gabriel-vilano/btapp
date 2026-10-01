import { createClient } from "@/src/lib/supabase/server";

/**
 * E-mail da conta logada, para a linha "E-mail" das configurações (N8).
 * Sem sessão devolve `null`: quem chega sem login é mandado ao /entrar pelo proxy.
 */
export async function loadAccountEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}
