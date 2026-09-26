import type { NextConfig } from "next";

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

// O Next embute toda NEXT_PUBLIC_* no bundle do navegador, então o build é o último
// ponto antes de um segredo virar público. Roda também no `next dev`, com o .env.local.
assertNoExposedSecrets(process.env);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.0/16", "10.0.0.0/8"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
