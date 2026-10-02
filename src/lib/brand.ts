// Fonte única do nome do produto no código. O nome é provisório: o rename
// de hoje e os futuros custam uma linha aqui, e não uma varredura do repo.
// Em src/, app/ e e2e/ (TS, TSX e MDX) ninguém escreve o literal: importa
// `brand` (em MDX, `{brand.name}`).
//
// Onde o TypeScript não alcança, não dá para importar, então o literal é
// permitido. Esta é a lista desses lugares; ao aparecer outro, acrescentar aqui:
//   - supabase/        (templates de e-mail, `subject` e `project_id` do config.toml)
//   - package.json     (e o package-lock.json, gerado a partir dele)
//   - .claude/         (skills, scripts e textos dos agentes)
//   - patches/         (comentário de atribuição dentro do patch)
//
// Sem `baseUrl` nem `supportEmail` de propósito: nenhum código os consome
// hoje (o compartilhamento do perfil usa `window.location.origin`) e o
// domínio ainda não existe. Entram quando houver o primeiro consumidor.
export const brand = { name: "btapp", shortName: "btapp" } as const;
