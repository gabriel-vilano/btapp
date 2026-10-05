---
paths:
  - "src/**/*.stories.tsx"
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

Storybook + Vite não tem RSC. Stories rodam tudo client-side por default. A regra sobre Phosphor em Server Components (ver "Common hurdles" > "Phosphor em Server Components") vale para o app real, não para as stories — ali nada quebra.


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

