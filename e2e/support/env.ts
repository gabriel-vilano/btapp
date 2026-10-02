// Variáveis dos testes E2E, geradas por `scripts/supabase-e2e-env.sh` a partir do Supabase local.
// Os testes criam usuários com a secret key, então só podem rodar contra o Supabase local.

type E2eEnv = {
  supabaseUrl: string;
  publishableKey: string;
  secretKey: string;
  mailpitUrl: string;
};

const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost"]);

/** Lê e valida as variáveis dos testes E2E; recusa qualquer Supabase que não seja local. */
export function getE2eEnv(): E2eEnv {
  const supabaseUrl = requireVar("NEXT_PUBLIC_SUPABASE_URL");
  assertLocalUrl(supabaseUrl);

  return {
    supabaseUrl,
    publishableKey: requireVar("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    secretKey: requireVar("E2E_SUPABASE_SECRET_KEY"),
    mailpitUrl: requireVar("E2E_MAILPIT_URL"),
  };
}

function requireVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} ausente: suba o Supabase local e exporte as variáveis (README > Testes E2E)`);
  }
  return value;
}

function assertLocalUrl(url: string): void {
  const { hostname } = new URL(url);
  if (LOCAL_HOSTNAMES.has(hostname)) return;

  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL aponta para "${hostname}", esperado 127.0.0.1 ou localhost: os testes E2E criam usuários e só rodam contra o Supabase local`
  );
}
