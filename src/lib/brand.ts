// Fonte única do nome do produto no código. O nome é provisório: o rename
// de hoje e os futuros custam uma linha aqui, e não uma varredura do repo.
// Em src/, app/ e e2e/ (TS, TSX e MDX) ninguém escreve o literal: importa
// `brand` (em MDX, `{brand.name}`).
//
// Onde o TypeScript não alcança, não dá para importar, então o literal é
// permitido. Esta é a lista desses lugares; ao aparecer outro, acrescentar aqui
// e na allowlist de `brand.guard.test.ts`, que confere se as duas batem:
//   - supabase/        (templates de e-mail e `subject` do config.toml)
//   - .claude/         (skills, scripts e textos dos agentes)
//   - README.md        (título e apresentação do repo)
//   - docs/PRODUCT.md  (o único doc que diz o nome; os outros escrevem "o produto")
// No resto do repo, o guard reprova o literal, e o nome antigo em qualquer lugar.
//
// `name` é o nome de exibição ("BT App", com espaço e maiúsculas). Os
// identificadores técnicos (nome do repo, `name` do package.json, project_id do
// Supabase) seguem "btapp" e não entram na lista: não são o nome de exibição.
// Chaves de storage e hosts de teste são neutros (`bt:`, `app.test`).
//
// Sem `baseUrl` nem `supportEmail` de propósito: nenhum código os consome
// hoje (o compartilhamento do perfil usa `window.location.origin`) e o
// domínio ainda não existe. Entram quando houver o primeiro consumidor.
const name = "BT App";

export const brand = {
  name,
  shortName: name,
  // Para o meio de frase ("…amigos no BT App."): o espaço que não quebra
  // (U+00A0) mantém o nome numa linha só, sem o "BT" no fim de uma e o "App"
  // no começo da outra. Título e logo, que não quebram, usam `name`.
  nameNoBreak: name.replaceAll(" ", "\u00A0"),
} as const;
