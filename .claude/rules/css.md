---
paths:
  - "**/*.css"
---

# CSS e design tokens

A fonte dos valores é `styles/tokens/*.css` (`primitives.css` e `semantic.css`). O `docs/TOKENS.md` documenta a arquitetura, as tabelas e os padrões de implementação: leia a seção correspondente antes de criar token, state layer, foco ou animação.

## Regras fundamentais

Cópia de `docs/TOKENS.md` > "Regras fundamentais": ao mudar uma regra, mudar nas duas no mesmo PR.

- **Cor e tipografia são sempre semânticas nos componentes.** Nenhum componente usa paleta (`--color-coral-500`) nem `--font-size-*`/`--line-height-*` direto: usa `--color-background-*`, `--color-foreground-*`, `--color-border-*` e `--text-*`.
- **Escalas podem ser usadas direto.** `--spacing-*`, `--radius-*`, `--dimension-*`, `--motion-*`, `--border-width-*` e `--font-weight-*` não têm camada semântica e vão direto no componente. Um token semântico de escala só nasce quando o mesmo valor carrega uma intenção repetida (ex.: `--radius-card`, `--radius-form-input`).
- **Tokens semânticos apontam para primitivos.** Nunca para valores brutos. Todo semântico mora em `semantic.css`.
- **CSS Modules para tudo que é componente.** Nenhum estilo de componente em arquivos globais.
- **BEM dentro dos `.module.css`.** Nomenclatura: `.card__header`, `.btn--primary`.
- **State layers via `::after`.** Hover, press e focus são camadas semitransparentes sobrepostas — não variações de cor calculadas por componente.
- **`:focus-visible` obrigatório.** Nunca remover outline sem substituir com `:focus-visible`. Nenhum componente remove o outline em `:focus`: campos de texto indicam foco pela borda `--color-border-strong` **e** pelo ring de `:focus-visible` (ver "Acessibilidade — foco").
- **Área tocável de 48px em todo botão**, inclusive o só de ícone (ver "Acessibilidade — tap target").
- **Seleção em grafite, ação em coral.** O que está selecionado ou marcado usa `--color-background-inverse` com `--color-foreground-on-inverse` (Chip selecionado, Checkbox marcado). O coral (`--color-background-accent`) fica para ação (botão, link) e não compete com o botão principal. Selecionado e desabilitado segue o preenchido desabilitado do Button primary (`--color-background-disabled` com `--color-foreground-on-disabled`).
- **Desabilitado mantém a forma.** Só o que já é preenchido (Button primary, item selecionado) fica com fundo `--color-background-disabled`. O que não tem fundo continua sem fundo: borda `--color-border-subtle` e texto `--color-foreground-disabled` (Button secondary, Chip e Checkbox não selecionados), ou só o texto (Button ghost).

## Onde está o resto no `docs/TOKENS.md`

- **Texto digitado em campo:** valor e placeholder de `input`, `textarea` e `select` em `body-lg` (16px), nunca menos ("Texto digitado em campo").
- **State layers:** o padrão do `::after` com os tokens `--color-state-layer-*` e as variantes `*-on-strong` ("State layers").
- **Foco e tap target:** ring de `:focus-visible`, foco de campo de texto, área de 48px no botão só de ícone ("Acessibilidade — foco" e "Acessibilidade — tap target").
- **Motion:** gate de frequência, sem ease-in, transição abaixo de 300ms, só `transform` e `opacity`, movimento reduzido ("Motion: regras"). Para criar animação, a skill `movimento`.
- **Override por componente:** double-fallback com custom property local ("Override tokens por componente").

## Hurdles de CSS no iOS

### iOS: auto-zoom ao focar inputs

**Sintoma:** iOS Safari/Chrome dá zoom na página ao focar um campo cujo `font-size` efetivo é menor que 16px (os campos tinham 14px).

**Solução:** texto digitado e placeholder de todo `input`, `textarea` e `select` em `body-lg` (16px), nunca menos (`docs/TOKENS.md` > "Texto digitado em campo"). O `viewport` do `app/layout.tsx` não usa `maximumScale` nem `userScalable: false`, e o `app/layout.test.ts` falha se voltarem.

**Por que não travar o zoom:** era a solução antiga. O Safari do iOS 10+ ignora a trava no pinch, mas o Chrome do Android a respeita e bloqueia o zoom manual, o que falha a WCAG 1.4.4 (Resize Text) e a auditoria `meta-viewport` do Lighthouse.

Origem: PR #162 (a troca da trava de zoom pelos 16px no campo); o hurdle original é anterior ao histórico do repo.

### iOS: "sticky hover" em botões com `:hover`

**Sintoma:** Primeiro tap em um elemento com regra `:hover` não dispara `click` no iOS — aplica o estado hover e espera o segundo tap.

**Solução:** Envolver todas as regras `:hover` em `@media (hover: hover)` para que só apliquem em dispositivos com cursor real. Padrão seguido em todos os `.module.css` do DS.

Origem não localizada (anterior ao histórico do repo).

