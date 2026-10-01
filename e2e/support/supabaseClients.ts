import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getE2eEnv } from "./env";
import { TEST_PASSWORD } from "./users";

const NO_SESSION_STORAGE = { auth: { persistSession: false, autoRefreshToken: false } };

/** Client com a publishable key e sem login: o que um visitante anônimo alcança pela Data API. */
export function anonymousClient(): SupabaseClient {
  const { supabaseUrl, publishableKey } = getE2eEnv();
  return createClient(supabaseUrl, publishableKey, NO_SESSION_STORAGE);
}

/**
 * Client logado como o usuário, com a publishable key, como o navegador do jogador:
 * a RLS vale como valeria no app. Devolve também o id do usuário.
 */
export async function signedInClient(email: string): Promise<{ client: SupabaseClient; userId: string }> {
  const client = anonymousClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error || !data.user) {
    throw new Error(`Não consegui entrar como ${email}: ${error?.message ?? "sem usuário na resposta"}`);
  }
  return { client, userId: data.user.id };
}
