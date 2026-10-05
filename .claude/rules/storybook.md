---
paths:
  - "src/**/*.stories.tsx"
  - "src/**/*.mdx"
  - ".storybook/**"
---

# Storybook

Workshop pra desenvolver e testar componentes em isolamento. Cada componente do DS deve ter sua story conforme evolui.

## Comandos

- `npm run storybook` — sobe dev server em `http://localhost:6006` (o script já usa `--host 0.0.0.0`, então abre pela rede local)
- `npm run build-storybook` — build estática em `storybook-static/`
- `npm run test:stories` — roda cada story como teste no Chromium (Playwright + Vitest browser mode)
- `npm run test:all` — unit + storybook

## Onde ficam as stories

Ao lado do componente, sufixo `.stories.tsx`:

```
src/components/ui/Icon/
  Icon.tsx
  Icon.module.css
  Icon.stories.tsx   ← aqui
  index.ts
```

## Estratégia de cobertura

Adotamos a estratégia **DS + componentes críticos** — não documentamos tudo, documentamos o que tem ROI real.

**Tier 1 — DS primitivos (sempre).** Átomos reutilizáveis. Ex: Button, Icon, FormInput, Alert, Toast, Avatar, TextLink. Storybook é o catálogo do design system.

**Tier 2 — Compostos com estados ocultos (sim).** Moléculas que têm múltiplos estados difíceis de reproduzir em produção (loading, empty, error, edge cases). Ex: PasswordChecklist, OtpInput, ResendTimer, AvatarUpload.

**Tier 3 — Blocos reutilizáveis de feature (sim).** LEGO pieces recombinados em vários contextos. Ex: blocos do feed (CardShell, CardHeader, ScoreBlock).

**Tier 4 — Composições finais (geralmente não).** Cards completos / telas. Quando vale, criar **uma story-galeria** mostrando todas as variantes lado a lado, em vez de uma story por composição.

**Não documentar:** páginas (`app/**/page.tsx`), server components com data fetching, layouts puros sem variantes, componentes one-shot usados em um único lugar sem estados ocultos.

**Heurísticas pra decidir caso a caso:**

1. **Heurística do designer:** "Um designer entregaria um Figma frame só desse componente, com todas as variantes lado a lado, fora de qualquer tela?" Se sim → story.
2. **Heurística dos estados invisíveis:** "Esse componente tem estados que produção raramente exibe — loading, empty, error, texto longo, dado faltando?" Se sim → Storybook é o melhor lugar pra surfar.

**Regra do PR:** ao adicionar/evoluir um componente, perguntar antes do merge: *"Esse componente tem 3 ou mais variantes/estados que valem mostrar lado a lado?"* Se sim, story junto no mesmo PR. Se não, segue sem.


## Documentação de componentes

**Fonte única: arquivos `Component.mdx` ao lado de cada componente, renderizados no Storybook.** Não usamos `docs/components/` — foi deprecado e removido em favor de MDX como source of truth.

```
src/components/ui/Button/
  Button.tsx             ← código
  Button.module.css      ← estilo
  Button.stories.tsx     ← stories interativas
  Button.mdx             ← documentação (fonte canônica)
  index.ts
```

Convenção completa de MDX (estrutura de seções, ordem de conteúdo, blocos do Storybook): ver "Padrão de documentação MDX" abaixo.

## Padrão de documentação MDX

Cada componente do Tier 1 e Tier 2 ganha um arquivo `Component.mdx` ao lado, **complementando** o `.stories.tsx`:

```
src/components/ui/Button/
  Button.tsx
  Button.module.css
  Button.stories.tsx   ← stories interativas, controls, args
  Button.mdx           ← documentação rica em prose
  index.ts
```

**Por que MDX se já temos auto-docs:** o auto-docs (aba "Docs" gerada do meta) é raso — só descrição + tabela de props + stories embutidas. MDX permite explicar **decisões de design**, **componentes relacionados**, **acessibilidade**, **anti-padrões** — coisas que não cabem em uma description de story.

**Idioma:** títulos de seções e prose em português. Termos técnicos sem tradução natural permanecem em inglês (ex: `Provider`, `hook`, `props`, nomes de tokens CSS, identificadores de código). Sigla `API` mantém. Convenções específicas de DS (`Don'ts`) traduzimos quando há equivalente claro em PT (`Evitar`).

**Inspiração de estrutura:** [Carbon Design System](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Button/Button.mdx) — adotamos a estrutura por seções (cada variante e cada estado com H2/H3 próprio), `<ArgTypes>` no fim como API, `## References` linkando padrões externos. Diferença: Carbon é DS multi-tenant, então é deliberadamente neutro; o nosso é DS de um produto único, então mantemos **opinião forte** ("uma primary por tela", Don'ts explícitos).

**Imports padrão:**

```mdx
import { Meta, Subtitle, Canvas, ArgTypes } from "@storybook/addon-docs/blocks";
import * as ButtonStories from "./Button.stories";

<Meta of={ButtonStories} />
<Subtitle>Uma linha sobre o propósito do componente.</Subtitle>

**Código-fonte:** [`src/components/ui/Button/Button.tsx`](https://github.com/gabriel-vilano/btapp/blob/master/src/components/ui/Button/Button.tsx)
```

Sempre incluir o link pro código-fonte no topo, logo após o Subtitle.

**Tabelas em MDX:** usar HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`). Sintaxe markdown de pipes não funciona no Storybook 10 + nextjs-vite atual — `remark-gfm` foi tentado mas o `mdxLoaderOptions` hook não propaga remarkPlugins até o compile final do `@mdx-js/mdx` interno do addon-docs. Inline code em cells via `<code>...</code>`. Reavaliar quando upstream resolver.

**Seções recomendadas (na ordem):**

1. **Visão geral** — parágrafo curto descrevendo propósito + `<Canvas>` da story default. Mostra o componente funcionando antes de explicar.
2. **Variantes** — parágrafo intro + `<Canvas of={Stories.AllVariants} />`, depois um **H3 por variante** com prose + Canvas próprio
3. **Estados** — parágrafo intro + H3 por estado (Loading, Disabled, FullWidth, etc), cada um com prose + Canvas
4. **Anatomia** *(opcional)* — partes visuais nomeadas. Só se o componente não for óbvio (FormInput sim, Button não)
5. **Com ícone** *(quando aplicável)* — H3 separados pra leading e trailing
6. **Quando usar** — bullets com casos de uso centrais
7. **Componentes relacionados** — outros componentes próximos e quando preferir cada um (ex: Button vs ButtonLink vs TextLink), com link via `?path=/docs/ui-componente--docs`
8. **Acessibilidade** — semântica HTML, ARIA, foco, tap target. Citar critérios WCAG quando aplicável
9. **Evitar** — anti-padrões comuns com `❌`. Única seção negativa do MDX; é onde mora a opinião do nosso DS
10. **API** — `<ArgTypes of={Stories} />` (não `<Controls>`; Controls é interativo, ArgTypes é documentação read-only)
11. **Decisões de design** *(opcional)* — formato Q&A: por que essa abordagem em vez de alternativas? (ex: "Por que Phosphor em vez de Lucide?", "Por que wrapper em vez de import direto?"). **Critério estrito: só incluir quando há decisão não-óbvia que justificaria questionamento futuro.** Em componentes onde tudo é convencional, não criar a seção — boilerplate vazio polui mais do que ajuda
12. **Referências** — links pra MDN, WAI-ARIA, WCAG, e referência cruzada com `docs/TOKENS.md`

**Ordem de conteúdo dentro de qualquer seção/subseção: sempre Heading → Prose → Canvas.** O leitor precisa de contexto antes de processar o exemplo visual; mostrar o componente primeiro força o leitor a inferir o que está vendo. A regra vale tanto pro H2 quanto pro H3. **Nunca Canvas → Prose** — sem exceção.

**Toda H2 que tem H3 abaixo deve ter prose intro de 1-2 linhas antes do primeiro H3** — orienta o leitor sobre o que vai encontrar. Se a H2 só tem prose+Canvas (sem H3), aplica direto a regra Heading → Prose → Canvas.

**Não fazer:**

- ❌ Duplicar prose do `parameters.docs.description` da story dentro do MDX — descrições curtas de story são legendas, MDX é a doc principal. Quando MDX existe, mantenha as descriptions curtas e factuais; o "porquê" mora no MDX.
- ❌ Documentar implementação interna (estrutura de CSS, lógica de hook). Foco no consumidor: como usar, quando usar, quando não usar.
- ❌ Criar MDX antes de ter stories — MDX referencia stories via `<Canvas of={...} />`. Stories primeiro, MDX depois.
- ❌ TOC manual — Storybook 10 auto-gera TOC do lado direito a partir dos H2/H3 do MDX.

**`docs/components/` foi deprecado.** MDX é a fonte única de documentação por componente. Decisões de design (rationale, alternativas consideradas) que antes ficavam em `docs/components/<nome>.md` agora vão na seção **Decisões de design** do próprio MDX (item 11 da lista acima), logo antes de Referências.

## Padrão de story

- **Nunca nomear `export const X` igual ao componente importado.** `import { Button } from "./Button"` + `export const Button: Story = ...` quebra com "duplicate declaration". Use nomes das *variantes* — `Primary`, `Secondary`, `WithIcon`, `Loading`. (Boilerplate do Storybook 10.3.6 erra isso — não copiar.)
- Use `satisfies Meta<typeof Component>` no meta pra inferência de tipos das stories
- `args` no meta = defaults; cada story sobrescreve apenas o que precisa
- `argTypes.icon: { control: false }` desabilita o control quando o tipo não é serializável (`React.ElementType`)
- Para showcase de variantes lado a lado, use as utilities `.sb-row`, `.sb-stack`, `.sb-pad` do `.storybook/storybook.css` — não use `style=` inline

## Addons ativos

- **a11y** — cada story passa por axe-core; violações aparecem no painel "Accessibility"
- **vitest** — stories viram testes via `npm run test:stories`
- **docs** — auto-doc com MDX e descriptions de stories
- **chromatic** — preparado pra visual regression (não conectado ainda)

## Decisão de adapter

Usamos `@storybook/nextjs-vite` (não `nextjs` webpack). Vite roda mais rápido, alinha com o pipeline do Vitest e é a direção declarada do time do Storybook. Trade aceito: regras webpack do `next.config.ts` não se aplicam — hoje irrelevante porque o `next.config.ts` não tem regras de webpack (só a guarda de segredos e o `allowedDevOrigins`).

## Sobre RSC e `"use client"`

Storybook + Vite não tem RSC. Stories rodam tudo client-side por default. A regra sobre Phosphor em Server Components (ver `.claude/rules/icones.md` > "Phosphor em Server Components") vale para o app real, não para as stories — ali nada quebra.


## Regras do `play` e stories na nuvem

- **Stories nas sessões na nuvem:** o container traz um Chromium mais antigo que o pedido pelo `playwright` do projeto, e a doc do ambiente proíbe `playwright install`. Rodar com `CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium npm run test:stories`: o `vitest.config.ts` passa a variável como `executablePath` do provider. Sem ela (CI, máquina local), nada muda. É outra versão do browser, então o job Stories da CI continua sendo a referência
- **`play` das stories:** esperar a renderização com `findBy*`, não com `getBy*` logo no início. Não depender de rolagem suave, animação ou timer sem controle (rolar com `behavior: "instant"`). Antes de rolar numa tela que usa IntersectionObserver, esperar o primeiro aviso com `firstIntersectionDelivered` (`.storybook/playHelpers.ts`). Nunca espera fixa (`setTimeout`, `sleep`): o que se espera é uma condição, com `findBy*` ou `waitFor`. Story nova ou alterada com `play` passa pela prova de estabilidade da skill `/pegar-issue` (passo 4) antes do push, e a CI repete 5 vezes as stories alteradas pelo PR

## Dump do Testing Library nas stories parece vazio

**Sintoma:** a story falha com `Unable to find an element…`, e o DOM impresso no erro só mostra os placeholders do Storybook. Parece que a story "não montou".

**Causa:** o dump imprime o `document.body` inteiro e corta em 7.000 caracteres (`DEBUG_PRINT_LIMIT`). Os placeholders do Storybook vêm antes da raiz da story e enchem o limite antes do conteúdo. Aumentar o `DEBUG_PRINT_LIMIT` no shell não adianta: no modo browser do Vitest a variável não chega ao `process.env` da página.

**Solução:** imprimir só a raiz da story, sem limite, com um `console.warn` temporário no `play` (o `console.log` do browser não aparece no terminal; o `console.warn` sim):

```ts
import { prettyDOM } from "storybook/test";
// dentro do play, antes da linha que falha
console.warn(prettyDOM(canvasElement, 100_000));
```

Tirar a linha antes do commit.

Origem: PR #125 (estabilidade das stories na CI).

