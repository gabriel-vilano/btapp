import { createClient } from "@supabase/supabase-js";

import { getE2eEnv } from "./env";

// Atende as regras de senha do app: 8+ caracteres, com letra e número
export const TEST_PASSWORD = "Senha1234";

/**
 * E-mail único por teste, para os testes não dependerem de ordem nem de limpeza.
 * Ex: `uniqueEmail("login")` → `e2e-login-lx3k9a-4f2c@letzplay.test`
 */
export function uniqueEmail(flow: string): string {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return `e2e-${flow}-${suffix}@letzplay.test`;
}

/** Cria um usuário já confirmado pela API admin do Auth, sem passar pelo e-mail. */
export async function createConfirmedUser(email: string, password = TEST_PASSWORD): Promise<void> {
  const { supabaseUrl, secretKey } = getE2eEnv();
  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: "Jogador", last_name: "E2E", full_name: "Jogador E2E" },
  });

  if (error) {
    throw new Error(`Não consegui criar o usuário de teste ${email}: ${error.message}`);
  }
}
