# TOKENS.md — LetzPlay

Documento vivo do design system: arquitetura CSS, tokens primitivos e semânticos, escala tipográfica e padrões de implementação. A documentação de cada componente fica no MDX ao lado dele (ver `CLAUDE.md` > "Documentação de componentes").

Os valores vêm de `styles/tokens/`. Ao mudar um token no CSS, atualizar a tabela aqui no mesmo PR.

---

## Arquitetura CSS

### Abordagem

CSS customizado com **CSS Modules** para escopo de componente e **CSS Custom Properties** para design tokens.
Sem Tailwind. Sem CSS-in-JS.

### Estrutura de arquivos

```
styles/
  tokens/
    primitives.css     ← valores brutos (paleta, escala, motion)
    semantic.css       ← intenções de design (background, foreground, border, state)
  reset.css            ← normalização do browser
app/
  globals.css          ← importa reset e tokens, define a base do documento
src/components/
  <grupo>/             ← ui, auth, icons…
    NomeComponente/
      NomeComponente.tsx
      NomeComponente.module.css
```

### Regras fundamentais

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

---

## Tokens primitivos

Arquivo: `styles/tokens/primitives.css`

Valores brutos sem semântica. Paleta de cores e tamanhos de fonte nunca vão direto em componentes; as escalas (espaçamento, radius, dimensões, motion, border width e pesos) podem ir (ver "Regras fundamentais").

### Família tipográfica

| Token         | Valor                                      |
| ------------- | ------------------------------------------ |
| `--font-sans` | `var(--font-arimo), system-ui, sans-serif` |

Fonte: Arimo (Google Fonts), variável 400–700. Carregada via `next/font` no `layout.tsx`.
Variável CSS injetada pelo Next.js: `--font-arimo`.

### Tamanhos de fonte

Naming: o sufixo numérico representa o valor em centésimos de rem (ex: `150` = `1.5rem` = 24px). Torna o valor explícito no nome, sem precisar consultar tabela.

| Token             | rem      | px   |
| ----------------- | -------- | ---- |
| `--font-size-062` | 0.625rem | 10px |
| `--font-size-075` | 0.75rem  | 12px |
| `--font-size-087` | 0.875rem | 14px |
| `--font-size-100` | 1rem     | 16px |
| `--font-size-125` | 1.25rem  | 20px |
| `--font-size-150` | 1.5rem   | 24px |
| `--font-size-175` | 1.75rem  | 28px |
| `--font-size-200` | 2rem     | 32px |
| `--font-size-250` | 2.5rem   | 40px |
| `--font-size-300` | 3rem     | 48px |
| `--font-size-350` | 3.5rem   | 56px |

### Pesos

| Token                   | Valor |
| ----------------------- | ----- |
| `--font-weight-regular` | 400   |
| `--font-weight-bold`    | 700   |

### Line-heights

Valores absolutos (não relativos) para ritmo vertical consistente independente do font-size.

| Token               | rem     | px   |
| ------------------- | ------- | ---- |
| `--line-height-100` | 1rem    | 16px |
| `--line-height-125` | 1.25rem | 20px |
| `--line-height-150` | 1.5rem  | 24px |
| `--line-height-175` | 1.75rem | 28px |
| `--line-height-200` | 2rem    | 32px |
| `--line-height-225` | 2.25rem | 36px |
| `--line-height-250` | 2.5rem  | 40px |
| `--line-height-300` | 3rem    | 48px |
| `--line-height-350` | 3.5rem  | 56px |
| `--line-height-400` | 4rem    | 64px |

### Letter-spacing

| Token                           | Valor  | Uso             |
| ------------------------------- | ------ | --------------- |
| `--font-letter-spacing-none`    | 0px    | padrão          |
| `--font-letter-spacing-display` | -0.6px | títulos grandes |
| `--font-letter-spacing-signal`  | 0.5px  | badges, labels  |

### Espaçamento — escala base-8

| Token                   | Valor |
| ----------------------- | ----- |
| `--spacing-0`           | 0px   |
| `--spacing-25`          | 2px   |
| `--spacing-50`          | 4px   |
| `--spacing-75`          | 6px   |
| `--spacing-100`         | 8px   |
| `--spacing-125`         | 10px  |
| `--spacing-150`         | 12px  |
| `--spacing-200`         | 16px  |
| `--spacing-250`         | 20px  |
| `--spacing-300`         | 24px  |
| `--spacing-400`         | 32px  |
| `--spacing-450`         | 36px  |
| `--spacing-500`         | 40px  |
| `--spacing-600`         | 48px  |
| `--spacing-700`         | 56px  |
| `--spacing-800`         | 64px  |
| `--spacing-page-margin` | 16px  |
| `--spacing-page-gutter` | 8px   |

### Dimensões fixas

| Token                            | Valor | Uso                        |
| -------------------------------- | ----- | -------------------------- |
| `--dimension-tap-target-minimum` | 48px  | WCAG — área mínima tocável |
| `--dimension-action-height-sm`   | 32px  | botão pequeno              |
| `--dimension-action-height-md`   | 40px  | botão médio (padrão)       |
| `--dimension-action-height-lg`   | 48px  | botão grande               |
| `--dimension-icon-xs`            | 12px  |                            |
| `--dimension-icon-sm`            | 16px  |                            |
| `--dimension-icon-md`            | 24px  | padrão                     |
| `--dimension-icon-lg`            | 32px  |                            |
| `--dimension-icon-xl`            | 64px  |                            |
| `--dimension-avatar-24`          | 24px  | avatar na aba Perfil       |
| `--dimension-avatar-32`          | 32px  | avatar pequeno (stack)     |
| `--dimension-avatar-40`          | 40px  | avatar do header de card   |
| `--dimension-avatar-48`          | 48px  | avatar grande, logo        |
| `--dimension-avatar-96`          | 96px  | avatar de perfil / upload  |
| `--dimension-layout-max`         | 430px | largura máxima do conteúdo |

### Border radius

| Token                 | Valor              | Uso                     |
| --------------------- | ------------------ | ----------------------- |
| `--radius-none`       | 0px                |                         |
| `--radius-sm`         | 4px                | chips, tags             |
| `--radius-md`         | 8px                | inputs, botões pequenos |
| `--radius-lg`         | 16px               | cards                   |
| `--radius-xl`         | 24px               | modais, bottom sheets   |
| `--radius-full`       | 9999px             | pill, avatar            |

### Border width

| Token                   | Valor |
| ----------------------- | ----- |
| `--border-width-thin`   | 0.5px |
| `--border-width-medium` | 1px   |
| `--border-width-thick`  | 2px   |

### Sombras

| Token             | Uso                                 |
| ----------------- | ----------------------------------- |
| `--shadow-subtle` | cards, elementos elevados levemente |
| `--shadow-strong` | modais, popovers, bottom sheets     |

### Opacidade — para state layers

| Token           | Valor |
| --------------- | ----- |
| `--opacity-50`  | 0.04  |
| `--opacity-100` | 0.08  |
| `--opacity-150` | 0.12  |
| `--opacity-200` | 0.16  |
| `--opacity-250` | 0.2   |

### Camadas (z-index)

| Token         | Valor | Uso                          |
| ------------- | ----- | ---------------------------- |
| `--z-base`    | 0     | conteúdo da página           |
| `--z-sticky`  | 100   | headers e barras fixas       |
| `--z-overlay` | 500   | scrim, modais, bottom sheets |
| `--z-toast`   | 1000  | toasts, sempre acima de tudo |

### Motion — durações

| Token                        | Valor  | Uso                                                  |
| ---------------------------- | ------ | ---------------------------------------------------- |
| `--motion-duration-instant`  | 17ms   | sem percepção                                        |
| `--motion-duration-short-1`  | 50ms   | micro-interações                                     |
| `--motion-duration-short-2`  | 83ms   | marcar e desmarcar (ícone do Checkbox)               |
| `--motion-duration-short-3`  | 167ms  | state layer, cor e borda; saída do Toast             |
| `--motion-duration-medium-1` | 250ms  | padrão de UI: entrada do Toast, do Dialog e do sheet |
| `--motion-duration-medium-2` | 333ms  | teto para transição de UI maior                      |
| `--motion-duration-medium-3` | 500ms  | loops (Spinner) e momentos raros; não é transição de UI |
| `--motion-duration-long-1`   | 667ms  | loops e momentos raros; não é transição de UI        |
| `--motion-duration-long-2`   | 833ms  | loops e momentos raros; não é transição de UI        |
| `--motion-duration-long-3`   | 1000ms | loops (pulso do Skeleton) e momentos raros           |

### Motion — easings

| Token                         | Valor                           | Uso                                                        |
| ----------------------------- | ------------------------------- | ---------------------------------------------------------- |
| `--motion-easing-linear`      | `cubic-bezier(0, 0, 1, 1)`      | progresso, rotação contínua (Spinner)                      |
| `--motion-easing-standard`    | `cubic-bezier(0.3, 0, 0, 1)`    | maioria das transições: cor, state layer, elemento que se move na tela |
| `--motion-easing-continuous`  | `cubic-bezier(0.3, 0, 0.7, 1)`  | loops                                                      |
| `--motion-easing-quick-enter` | `cubic-bezier(0, 0, 0, 1)`      | elementos entrando (ease-out)                              |
| `--motion-easing-quick-exit`  | `cubic-bezier(0.23, 1, 0.32, 1)` | elementos saindo (ease-out)                               |
| `--motion-easing-soft-enter`  | `cubic-bezier(0, 0, 0.7, 1)`    | entrada suave (ease-out)                                   |
| `--motion-easing-bounce`      | `cubic-bezier(0.3, 0, 0, 1.25)` | só gesto com momento (soltar um arrasto) ou momento raro; nunca em ação utilitária |

**Por que `quick-exit` é ease-out.** A curva antiga, `cubic-bezier(1, 0, 1, 1)`, era ease-in: o elemento ficava parado no começo da saída e só acelerava no fim, então a UI parecia demorar a responder ao toque. A saída agora usa a curva ease-out das regras do Emil Kowalski: começa rápida e assenta no fim, o que dá a resposta imediata. O `--motion-easing-soft-exit` (`cubic-bezier(0.3, 0, 1, 1)`), também ease-in e sem consumidor, foi removido. Se uma saída precisar de uma curva mais calma, usar `--motion-easing-soft-enter`, que já é ease-out.

### Motion: regras

Regras do DS para animação, adotadas das skills de motion do Emil Kowalski (`emilkowalski/skills`, `animate` e `review-animations`).

- **Gate de frequência.** Ação de teclado, ou repetida mais de 100 vezes por dia, não anima. Ação de dezenas de vezes por dia anima de forma quase imperceptível (o state layer, em `short-3`). Ação ocasional (Dialog, sheet, Toast) usa a animação padrão. A rara (primeira vez, sucesso) é onde mora o deleite.
- **Propósito nomeado.** Toda animação tem um: feedback, consistência espacial, indicar estado, evitar mudança brusca ou explicar. Sem propósito, não anima.
- **Sem ease-in em UI**, na entrada nem na saída. Entrada usa `quick-enter` ou `soft-enter`; saída, `quick-exit`. O `standard` serve para o que muda sem entrar nem sair (cor, state layer, elemento que se move na tela).
- **Transição de UI abaixo de 300ms** (`medium-1` como padrão). Dialog e sheet podem chegar a 500ms. Loops (Spinner, Skeleton) ficam fora da regra; `medium-3` e `long-*` são para eles e para momentos raros.
- **Sem bounce em ação utilitária** (menu, toggle, Dialog). O `--motion-easing-bounce` fica para gesto com momento (soltar um arrasto) ou momento raro.
- **Só `transform` e `opacity`** no que se move. Nunca `scale(0)`: o elemento parte de perto do tamanho final (o Dialog centralizado parte de `scale(0.96)`).
- **Origem no gatilho.** Popover e menu crescem a partir do elemento que os abriu. Dialog centralizado e sheet são a exceção: entram do centro e da base.
- **Transição em vez de keyframes no que se dispara rápido ou empilha** (Toast). A transição parte do estado em que o elemento está, então uma saída no meio da entrada não dá salto. Para animar a entrada no mount com transição, usar `@starting-style`.
- **Movimento reduzido mais suave, e não zero.** Com `prefers-reduced-motion: reduce`, tirar o deslocamento e manter o esmaecimento (Toast), ou desacelerar o loop (Spinner). Cortar tudo faz o elemento surgir de golpe.
- **Press é só state layer, sem escala.** O `:active` escurece o `::after` (ver "State layers"); o componente não encolhe ao toque.

### Breakpoints

| Token             | Valor  |
| ----------------- | ------ |
| `--breakpoint-sm` | 512px  |
| `--breakpoint-md` | 600px  |
| `--breakpoint-lg` | 800px  |
| `--breakpoint-xl` | 1100px |

### Paleta de cores

Escala de 8 stops por família. 100 = mais claro, 800 = mais escuro.

**Neutral**

| Token                 | Valor   |
| --------------------- | ------- |
| `--color-neutral-100` | #ffffff |
| `--color-neutral-200` | #f7f7f7 |
| `--color-neutral-250` | #ededed |
| `--color-neutral-300` | #e5e5e5 |
| `--color-neutral-400` | #c7c7c7 |
| `--color-neutral-500` | #8f8f8f |
| `--color-neutral-600` | #707070 |
| `--color-neutral-700` | #363636 |
| `--color-neutral-800` | #191919 |

**Coral — cor de marca**

| Token               | Valor                   |
| ------------------- | ----------------------- |
| `--color-coral-100` | #fff7f5                 |
| `--color-coral-200` | #ffe1d7                 |
| `--color-coral-300` | #ffa78a                 |
| `--color-coral-400` | #ff6a38                 |
| `--color-coral-500` | #f3511b ← brand primary |
| `--color-coral-600` | #d03706                 |
| `--color-coral-700` | #5e1d08                 |
| `--color-coral-800` | #2f0e04                 |

**Coral de ação × coral de marca.** O coral-500 (`#f3511b`) dá 3,50:1 com o branco e não passa no contraste AA de texto (4,5:1, WCAG 1.4.3). Por isso a **cor de ação** (texto e fundo de botão, link de ação, destaque em texto) é o **coral-600** (`#d03706`): 4,96:1 com o branco, 4,63:1 sobre `--color-background-secondary` e 4,70:1 sobre o coral-100. O coral-500 fica como **cor de marca** (`--color-brand`) e para usos que não são texto (logo, ilustração, barra de progresso como a do CheerBar), onde o mínimo é 3:1 (WCAG 1.4.11). Os tokens `--color-background-accent`, `--color-foreground-accent` e `--color-border-accent` apontam para o coral-600. A borda não é texto e passaria com o 500, mas fica no 600 para o botão secondary ter borda e texto no mesmo tom.

**Kiwi — success**

| Token              | Valor   |
| ------------------ | ------- |
| `--color-kiwi-100` | #f6fef6 |
| `--color-kiwi-200` | #e0fae0 |
| `--color-kiwi-300` | #a6f0a5 |
| `--color-kiwi-400` | #4ce160 |
| `--color-kiwi-500` | #3cc14e |
| `--color-kiwi-600` | #288034 |
| `--color-kiwi-700` | #1b561a |
| `--color-kiwi-800` | #0c310d |

**Red — attention / error**

| Token             | Valor   |
| ----------------- | ------- |
| `--color-red-100` | #fff5f5 |
| `--color-red-200` | #ffdede |
| `--color-red-300` | #ffa0a0 |
| `--color-red-400` | #ff5c5c |
| `--color-red-500` | #f02d2d |
| `--color-red-600` | #d50b0b |
| `--color-red-700` | #570303 |
| `--color-red-800` | #2a0303 |

**Blue — informação, links**

| Token              | Valor   |
| ------------------ | ------- |
| `--color-blue-100` | #f5f9ff |
| `--color-blue-200` | #d4e5fe |
| `--color-blue-300` | #84b4fb |
| `--color-blue-400` | #4d93fc |
| `--color-blue-500` | #0968f6 |
| `--color-blue-550` | #005fcc |
| `--color-blue-600` | #0049b8 |
| `--color-blue-650` | #003aa5 |
| `--color-blue-700` | #002a69 |
| `--color-blue-800` | #19133a |

**Yellow — warning**

| Token                | Valor   |
| -------------------- | ------- |
| `--color-yellow-100` | #fffcf5 |
| `--color-yellow-200` | #fff8d5 |
| `--color-yellow-300` | #ffe58a |
| `--color-yellow-400` | #ffbd14 |
| `--color-yellow-500` | #eebb04 |
| `--color-yellow-600` | #855f00 |
| `--color-yellow-700` | #553b06 |
| `--color-yellow-800` | #312102 |

---

## Tokens semânticos

Arquivo: `styles/tokens/semantic.css`

Intenções de design. Sempre apontam para primitivos. Usados diretamente nos componentes.

### Escala tipográfica semântica

Sistema de **4 roles** (`display`, `title`, `body`, `label`), com variantes por tamanho no padrão t-shirt (`sm` / `md` / `lg`). O naming é consistente com `--spacing-*`, `--radius-*` e `--dimension-*`.

Cada escala define apenas **size + line-height + tracking**. **O peso é desacoplado** — o componente escolhe `font-weight` independentemente via `--font-weight-regular` ou `--font-weight-bold`. Isso permite qualquer combinação (ex: title regular, body bold) sem precisar inventar escala nova.

**Por que não usar o shorthand `font:`:** ele redefine sub-propriedades (`font-variant`, `font-stretch`), não cobre `letter-spacing`, e acopla família à escala. As propriedades individuais mantêm a composabilidade.

#### Roles

| Role      | Propósito                                                           | Característica                    |
| --------- | ------------------------------------------------------------------- | --------------------------------- |
| `display` | Números grandes, scores, ranking, logo                              | Tracking negativo (`-0.6px`)      |
| `title`   | Headings de página e seção                                          | Sem tracking                      |
| `body`    | Prose, descrições, input text                                       | Sem tracking, voltada pra leitura |
| `label`   | Form labels, helper, metadata, botões, (futuro) badges/pills/status | Sem tracking por padrão           |

#### Escalas disponíveis

| Escala       | Size                     | Line-height                | Tracking           | Uso típico                                    |
| ------------ | ------------------------ | -------------------------- | ------------------ | --------------------------------------------- |
| `display-lg` | `--font-size-350` (56px) | `--line-height-400` (64px) | display (`-0.6px`) | Números hero (ranking, score)                 |
| `display-md` | `--font-size-300` (48px) | `--line-height-350` (56px) | display (`-0.6px`) | Números grandes                               |
| `display-sm` | `--font-size-250` (40px) | `--line-height-300` (48px) | display (`-0.6px`) | Números médios                                |
| `title-lg`   | `--font-size-175` (28px) | `--line-height-225` (36px) | —                  | Headers de páginas de auth                    |
| `title-md`   | `--font-size-150` (24px) | `--line-height-200` (32px) | —                  | Títulos de seção, OTP input                   |
| `title-sm`   | `--font-size-125` (20px) | `--line-height-175` (28px) | —                  | Subtítulos, headings terciários               |
| `body-lg`    | `--font-size-100` (16px) | `--line-height-150` (24px) | —                  | Descrições de página, texto digitado em campo |
| `body-md`    | `--font-size-087` (14px) | `--line-height-125` (20px) | —                  | Prose, texto secundário                       |
| `label-lg`   | `--font-size-087` (14px) | `--line-height-125` (20px) | —                  | Texto de botão, rótulos de ação               |
| `label-md`   | `--font-size-075` (12px) | `--line-height-100` (16px) | —                  | Form labels, helper, metadata, alerts, toasts |

**Observação sobre `body-md` vs `label-lg`:** têm valores idênticos (14px/20lh) mas nomes diferentes. O nome comunica **papel**, não tamanho — `.button { font-size: var(--text-label-lg-size) }` deixa claro que é rótulo de ação, enquanto `.description { font-size: var(--text-body-md-size) }` indica prose. Podem evoluir separadamente.

#### Texto digitado em campo

**Texto digitado em campo usa `body-lg`, nunca menos de 16px.** Vale para o valor e o placeholder de todo `input`, `textarea` e `select` (FormInput, SearchField e os que vierem), em qualquer tela e qualquer ponteiro. Rótulo, texto de apoio e mensagem de erro continuam em `label-md` (12px). O campo continua com 48px de altura.

**Por quê:** o Safari do iOS dá zoom na página ao focar um campo com texto menor que 16px. A saída antiga era travar o zoom no viewport (`maximumScale: 1, userScalable: false`), mas o Chrome do Android respeita a trava e impede o pinch, o que falha a [WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) e a auditoria `meta-viewport` do Lighthouse. Com 16px no campo o iOS não dá auto-zoom, e o viewport fica livre.

#### Padrão de uso no componente

```css
/* Button.module.css — peso bold aplicado explicitamente */
.btn {
  font-size: var(--text-label-lg-size);
  line-height: var(--text-label-lg-line-height);
  letter-spacing: var(--text-label-lg-tracking);
  font-weight: var(--font-weight-bold);
}

/* HeroNumber.module.css — display tracking negativo */
.number {
  font-size: var(--text-display-md-size);
  line-height: var(--text-display-md-line-height);
  letter-spacing: var(--text-display-md-tracking);
  font-weight: var(--font-weight-bold);
}

/* Description.module.css — body regular */
.text {
  font-size: var(--text-body-lg-size);
  line-height: var(--text-body-lg-line-height);
  letter-spacing: var(--text-body-lg-tracking);
  font-weight: var(--font-weight-regular);
}
```

#### YAGNI — adicionar variantes conforme precisar

Só existem hoje as variantes com consumidor real ou mapeadas para telas próximas do roadmap. Quando surgir caso de uso para:

- **`body-sm`**: texto muito pequeno de prose (raro, talvez desnecessário).
- **`label-sm`** (10px, possivelmente com tracking positivo): **continua sem existir.** Decidido no primeiro Badge: badges, pills e status usam `label-md` (12px) em negrito. 12px é o menor texto do app, e 10px ao sol de uma quadra é arriscado. Reabrir só se um contador de aba (CountBadge) não couber em `label-md`.
- **`label-lg-caps`** (com tracking positivo para maiúsculas): eyebrows, category labels.

Adicionar uma variante é trivial: estender a tabela em `semantic.css` e documentar aqui.

### Cores — background

| Token                                 | Primitivo             | Uso                                        |
| ------------------------------------- | --------------------- | ------------------------------------------ |
| `--color-background-primary`          | `--color-neutral-100` | superfície principal (branco)              |
| `--color-background-secondary`        | `--color-neutral-200` | superfície secundária                      |
| `--color-background-tertiary`         | `--color-neutral-300` | divisores, skeleton                        |
| `--color-background-elevated`         | `--color-neutral-100` | modais, cards elevados                     |
| `--color-background-inverse`          | `--color-neutral-700` | fundo escuro                               |
| `--color-background-strong`           | `--color-neutral-800` | fundo muito escuro                         |
| `--color-background-accent`           | `--color-coral-600`   | coral — ação principal                     |
| `--color-background-attention`        | `--color-red-600`     | erro, destructive                          |
| `--color-background-success`          | `--color-kiwi-600`    | confirmação                                |
| `--color-background-disabled`         | `--color-neutral-400` | desabilitado                               |
| `--color-background-accent-subtle`    | `--color-coral-100`   | coral claro — highlight sutil              |
| `--color-background-attention-subtle` | `--color-red-100`     | erro sutil                                 |
| `--color-background-success-subtle`   | `--color-kiwi-100`    | sucesso sutil                              |
| `--color-background-info-subtle`      | `--color-blue-100`    | information sutil — usado pelo Alert quiet |

### Cores — foreground

| Token                             | Primitivo             | Uso                             |
| --------------------------------- | --------------------- | ------------------------------- |
| `--color-foreground-primary`      | `--color-neutral-800` | texto principal                 |
| `--color-foreground-secondary`    | `--color-neutral-600` | texto secundário, metadata      |
| `--color-foreground-disabled`     | `--color-neutral-400` | texto desabilitado              |
| `--color-foreground-accent`       | `--color-coral-600`   | destaques, links de ação        |
| `--color-foreground-attention`    | `--color-red-600`     | erros, alertas                  |
| `--color-foreground-success`      | `--color-kiwi-600`    | confirmações                    |
| `--color-foreground-on-accent`    | `--color-neutral-100` | texto branco sobre coral        |
| `--color-foreground-on-attention` | `--color-neutral-100` | texto branco sobre vermelho     |
| `--color-foreground-on-success`   | `--color-neutral-100` | texto branco sobre verde        |
| `--color-foreground-on-inverse`   | `--color-neutral-100` | texto branco sobre fundo escuro |
| `--color-foreground-on-strong`    | `--color-neutral-100` |                                 |
| `--color-foreground-on-disabled`  | `--color-neutral-100` |                                 |
| `--color-foreground-link`         | `--color-blue-500`    | links padrão                    |

### Cores — border

| Token                      | Primitivo             | Uso                     |
| -------------------------- | --------------------- | ----------------------- |
| `--color-border-subtle`    | `--color-neutral-300` | separadores leves       |
| `--color-border-medium`    | `--color-neutral-500` | bordas padrão de inputs |
| `--color-border-strong`    | `--color-neutral-700` | bordas com ênfase       |
| `--color-border-accent`    | `--color-coral-600`   | input em foco           |
| `--color-border-attention` | `--color-red-600`     | input inválido          |
| `--color-border-success`   | `--color-kiwi-600`    | input válido            |

### State layers

Camadas de interação aplicadas via `::after` como overlay semitransparente.
Funcionam em qualquer cor de fundo sem calcular variações por componente.

| Token                                    | Valor                                  | Uso                            |
| ---------------------------------------- | -------------------------------------- | ------------------------------ |
| `--color-state-layer-neutral`            | `transparent`                          | repouso — transparente         |
| `--color-state-layer-hover`              | `rgba(0,0,0,var(--opacity-50))`        | hover                          |
| `--color-state-layer-focus`              | `rgba(0,0,0,var(--opacity-50))`        | foco de teclado                |
| `--color-state-layer-pressed`            | `rgba(0,0,0,var(--opacity-100))`       | press / active                 |
| `--color-state-layer-selected`           | `rgba(0,0,0,var(--opacity-150))`       | item selecionado               |
| `--color-state-layer-hover-on-strong`    | `rgba(255,255,255,var(--opacity-150))` | hover sobre fundo escuro       |
| `--color-state-layer-focus-on-strong`    | `rgba(255,255,255,var(--opacity-150))` | foco sobre fundo escuro        |
| `--color-state-layer-pressed-on-strong`  | `rgba(255,255,255,var(--opacity-200))` | press sobre fundo escuro       |
| `--color-state-layer-selected-on-strong` | `rgba(255,255,255,var(--opacity-250))` | selecionado sobre fundo escuro |
| `--color-state-focus-ring`               | `--color-blue-550`                     | outline de foco por teclado    |
| `--color-state-focus-ring-on-strong`     | `--color-neutral-100`                  | outline de foco sobre fundo escuro ou colorido |

Padrão de implementação nos componentes:

```css
.btn {
  overflow: hidden;
  position: relative;
}

.btn::after {
  background-color: var(--color-state-layer-neutral);
  content: "";
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.btn:hover::after {
  background-color: var(--color-state-layer-hover);
}
.btn:active::after {
  background-color: var(--color-state-layer-pressed);
}

.btn:focus-visible {
  outline: var(--border-width-thick) solid var(--color-state-focus-ring);
  outline-offset: var(--spacing-25);
}

.btn:focus:not(:focus-visible) {
  outline: none;
}
```

### Outros tokens semânticos

| Token                    | Primitivo             | Uso                               |
| ------------------------ | --------------------- | --------------------------------- |
| `--color-brand`          | `--color-coral-500`   | cor de marca                      |
| `--color-scrim`          | `rgba(0,0,0,0.3)`     | overlay de modais e bottom sheets |
| `--color-loading-fill`   | `--color-neutral-250` | skeleton loader                   |
| `--color-loading-first`  | `--color-neutral-200` |                                   |
| `--color-loading-second` | `--color-neutral-300` |                                   |
| `--radius-form-input`    | `--radius-md`         | inputs de formulário              |
| `--radius-card`          | `--radius-lg`         | cards                             |
| `--radius-popover`       | `--radius-lg`         | popovers                          |

---

## Padrões de implementação

### Override tokens por componente

Para componentes que precisam de customização contextual, use double-fallback:

```css
.textbox {
  background-color: var(
    --textbox-background-color,
    /* override local — definido pelo consumidor */
    var(--color-background-secondary) /* semântico — fallback padrão */
  );
}
```

O consumidor pode customizar sem reescrever o componente:

```css
.search-context .textbox {
  --textbox-background-color: var(--color-background-primary);
}
```

### Acessibilidade — tap target

Todo elemento interativo deve ter área mínima tocável de `var(--dimension-tap-target-minimum)` (48px).
Se o elemento for visualmente menor, usar `min-height` ou `padding` para expandir a área de toque.

**Botão só de ícone** (mostrar senha, fechar, sino, busca) tem área de 48×48 mesmo com ícone `sm` (16px): o ícone fica centralizado e o `padding` ou um `::before` posicionado completa a área. Ícone de 16px com 4px de padding dá 24×24, que passa no mínimo da WCAG 2.5.8 (AA) mas não na regra do DS. O `aria-label` vai no `<button>`, não no `<Icon>`.

### Acessibilidade — foco

- **Botões, links e controles** usam o ring de foco do DS: `outline: var(--border-width-thick) solid var(--color-state-focus-ring)` em `:focus-visible`, com `:focus:not(:focus-visible) { outline: none; }` (exemplo em "State layers").
- **Campos de texto** (FormInput, OtpInput e os que vierem) mostram o foco de duas formas: a borda muda para `--color-border-strong` em `:focus`, e o ring de `:focus-visible` aparece por cima. Nenhum campo zera o outline em `:focus`: assim o DS tem um só estilo de foco por teclado.
- **Sobre fundo forte ou colorido** (o fechar do Toast sobre vermelho, verde ou cinza escuro), o ring usa `--color-state-focus-ring-on-strong` (branco). O azul do ring padrão fica abaixo de 3:1 sobre esses fundos (WCAG 1.4.11), como os state layers, que também têm a variante `*-on-strong`. O Button primary não precisa dela: o `outline-offset` põe o ring fora do fundo coral, sobre a superfície da página.
- Controles internos de um componente (o botão de mostrar senha, o fechar do Toast) seguem a mesma regra dos botões. O outline padrão do navegador não é o estilo do DS.
