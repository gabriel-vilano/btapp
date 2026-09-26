import type { NextConfig } from "next";

// Derivado do NextConfig para não importar de `next/dist/*`, que é interno e muda entre versões
type RemotePattern = Exclude<
  NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number],
  URL
>;

type ExposedSecret = {
  name: string;
  kind: string;
};

type SecretDetector = {
  kind: string;
  matches: (value: string) => boolean;
};

const SECRET_DETECTORS: SecretDetector[] = [
  {
    kind: "secret key do Supabase (sb_secret_…)",
    matches: (value) => value.startsWith("sb_secret_"),
  },
  {
    kind: "service_role key legada do Supabase (JWT)",
    matches: isServiceRoleJwt,
  },
  {
    kind: "connection string do Postgres com senha",
    matches: (value) => /^postgres(ql)?:\/\/[^:/@]+:[^@]+@/.test(value),
  },
];

function isServiceRoleJwt(value: string): boolean {
  const payload = value.split(".")[1];
  if (!payload) return false;

  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof claims === "object" && claims !== null && "role" in claims && claims.role === "service_role";
  } catch {
    return false;
  }
}

/**
 * Lista as variáveis `NEXT_PUBLIC_*` cujo valor tem formato de segredo, sem nunca devolver o valor.
 * Exportada para teste; o build a executa logo abaixo.
 */
export function findExposedSecrets(env: NodeJS.ProcessEnv): ExposedSecret[] {
  return Object.entries(env).flatMap(([name, value]) => {
    if (!name.startsWith("NEXT_PUBLIC_") || !value) return [];
    const detector = SECRET_DETECTORS.find(({ matches }) => matches(value));
    return detector ? [{ name, kind: detector.kind }] : [];
  });
}

function assertNoExposedSecrets(env: NodeJS.ProcessEnv): void {
  const exposed = findExposedSecrets(env);
  if (exposed.length === 0) return;

  const list = exposed.map(({ name, kind }) => `${name} (${kind})`).join(", ");
  throw new Error(
    `Build bloqueado: segredo em variável pública — ${list}. Toda variável NEXT_PUBLIC_* é embutida no JavaScript enviado ao navegador; tire o segredo dela ou renomeie sem o prefixo`
  );
}

const SUPABASE_STORAGE_PUBLIC_PATH = "/storage/v1/object/public/**";

/**
 * Padrão do `next/image` restrito ao Storage público do projeto Supabase configurado.
 * Sem `NEXT_PUBLIC_SUPABASE_URL` devolve `null`: o build da CI roda sem as variáveis do Supabase.
 * Ex: `supabaseStorageImagePattern("http://127.0.0.1:54321")` → host `127.0.0.1`, porta `54321`.
 */
export function supabaseStorageImagePattern(supabaseUrl: string | undefined): RemotePattern | null {
  if (!supabaseUrl) return null;

  const { protocol, hostname, port } = parseSupabaseUrl(supabaseUrl);
  if (protocol !== "https:" && protocol !== "http:") {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL inválida: recebi o protocolo '${protocol}', esperado http: ou https:`
    );
  }

  // `port` vazio casa só com a porta padrão do protocolo; o Supabase local usa porta explícita
  return {
    protocol: protocol === "https:" ? "https" : "http",
    hostname,
    port,
    pathname: SUPABASE_STORAGE_PUBLIC_PATH,
  };
}

function parseSupabaseUrl(supabaseUrl: string): URL {
  try {
    return new URL(supabaseUrl);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL inválida: recebi '${supabaseUrl}', esperado uma URL como https://<projeto>.supabase.co`
    );
  }
}

// O Next embute toda NEXT_PUBLIC_* no bundle do navegador, então o build é o último
// ponto antes de um segredo virar público. Roda também no `next dev`, com o .env.local.
assertNoExposedSecrets(process.env);

// Só o host do projeto, não `*.supabase.co`: o otimizador de imagens do Next baixa a URL
// no servidor, e um curinga deixaria qualquer projeto Supabase usar o nosso como proxy.
const supabaseImagePattern = supabaseStorageImagePattern(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.0/16", "10.0.0.0/8"],
  images: {
    remotePatterns: supabaseImagePattern ? [supabaseImagePattern] : [],
  },
};

export default nextConfig;
