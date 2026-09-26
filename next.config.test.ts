import { describe, expect, it } from "vitest";

import { findExposedSecrets, supabaseStorageImagePattern } from "./next.config";

// Fixtures montados em partes para o secret scanning do GitHub (repo público)
// não tratar valores de teste como credenciais reais
const FAKE_SECRET_KEY = ["sb", "secret", "valor-que-nao-pode-vazar"].join("_");
const FAKE_POSTGRES_URL =
  "postgresql://postgres:" + "senha-falsa" + "@db.exemplo.supabase.co:5432/postgres";

// O Next declara NODE_ENV como obrigatório em NodeJS.ProcessEnv
function buildEnv(vars: Record<string, string>): NodeJS.ProcessEnv {
  return { NODE_ENV: "test", ...vars };
}

function fakeJwt(role: string): string {
  const encode = (part: object): string =>
    Buffer.from(JSON.stringify(part)).toString("base64url");
  return [encode({ alg: "HS256", typ: "JWT" }), encode({ role }), "assinatura"].join(".");
}

describe("findExposedSecrets", () => {
  it("aponta secret key do Supabase em variável pública", () => {
    expect(
      findExposedSecrets(buildEnv({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: FAKE_SECRET_KEY }))
    ).toEqual([
      {
        name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        kind: "secret key do Supabase (sb_secret_…)",
      },
    ]);
  });

  it("aponta service_role legada (JWT) em variável pública", () => {
    const exposed = findExposedSecrets(
      buildEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: fakeJwt("service_role") })
    );

    expect(exposed.map(({ name }) => name)).toEqual(["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  });

  it("aponta connection string do Postgres com senha em variável pública", () => {
    const exposed = findExposedSecrets(buildEnv({ NEXT_PUBLIC_DATABASE_URL: FAKE_POSTGRES_URL }));

    expect(exposed.map(({ name }) => name)).toEqual(["NEXT_PUBLIC_DATABASE_URL"]);
  });

  it("aceita valores públicos: publishable key, anon JWT e URL do projeto", () => {
    expect(
      findExposedSecrets(
        buildEnv({
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_chave-de-teste",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: fakeJwt("anon"),
          NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
        })
      )
    ).toEqual([]);
  });

  it("ignora segredos em variáveis server-only (sem NEXT_PUBLIC_)", () => {
    expect(
      findExposedSecrets(
        buildEnv({ SUPABASE_SECRET_KEY: FAKE_SECRET_KEY, POSTGRES_URL: FAKE_POSTGRES_URL })
      )
    ).toEqual([]);
  });

  it("nunca devolve o valor do segredo", () => {
    const serialized = JSON.stringify(
      findExposedSecrets(buildEnv({ NEXT_PUBLIC_QUALQUER: FAKE_SECRET_KEY }))
    );

    expect(serialized).not.toContain("valor-que-nao-pode-vazar");
  });
});

describe("supabaseStorageImagePattern", () => {
  it("restringe ao host do projeto em produção, sem porta e só no Storage público", () => {
    expect(supabaseStorageImagePattern("https://exemplo.supabase.co")).toEqual({
      protocol: "https",
      hostname: "exemplo.supabase.co",
      port: "",
      pathname: "/storage/v1/object/public/**",
    });
  });

  it("cobre o Supabase local da CI E2E (http, IP e porta explícita)", () => {
    expect(supabaseStorageImagePattern("http://127.0.0.1:54321")).toEqual({
      protocol: "http",
      hostname: "127.0.0.1",
      port: "54321",
      pathname: "/storage/v1/object/public/**",
    });
  });

  it("não lança sem a variável: o build da CI roda sem o Supabase", () => {
    expect(supabaseStorageImagePattern(undefined)).toBeNull();
    expect(supabaseStorageImagePattern("")).toBeNull();
  });

  it("recusa valor que não é URL, citando o valor recebido", () => {
    expect(() => supabaseStorageImagePattern("exemplo.supabase.co")).toThrow(
      "recebi 'exemplo.supabase.co'"
    );
  });

  it("recusa protocolo que não é http nem https", () => {
    expect(() => supabaseStorageImagePattern("ftp://exemplo.supabase.co")).toThrow(
      "recebi o protocolo 'ftp:'"
    );
  });
});
