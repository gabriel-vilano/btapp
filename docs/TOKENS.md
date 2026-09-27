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

- **Primitivos nunca são usados diretamente em componentes.** Componentes sempre referenciam tokens semânticos.
- **Tokens semânticos apontam para primitivos.** Nunca para valores brutos.
- **CSS Modules para tudo que é componente.** Nenhum estilo de componente em arquivos globais.
- **BEM dentro dos `.module.css`.** Nomenclatura: `.card__header`, `.btn--primary`.
- **State layers via `::after`.** Hover, press e focus são camadas semitransparentes sobrepostas — não variações de cor calculadas por componente.
- **`:focus-visible` obrigatório.** Nunca remover outline sem substituir com `:focus-visible`.

---

## Tokens primitivos

Arquivo: `styles/tokens/primitives.css`

Valores brutos sem semântica. Nunca usar diretamente em componentes.

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

| Token                        | Valor  | Uso                  |
| ---------------------------- | ------ | -------------------- |
| `--motion-duration-instant`  | 17ms   | sem percepção        |
| `--motion-duration-short-1`  | 50ms   | micro-interações     |
| `--motion-duration-short-2`  | 83ms   |                      |
| `--motion-duration-short-3`  | 167ms  | transições rápidas   |
| `--motion-duration-medium-1` | 250ms  | padrão de UI         |
| `--motion-duration-medium-2` | 333ms  |                      |
| `--motion-duration-medium-3` | 500ms  | transições longas    |
| `--motion-duration-long-1`   | 667ms  | animações elaboradas |
| `--motion-duration-long-2`   | 833ms  |                      |
| `--motion-duration-long-3`   | 1000ms |                      |

### Motion — easings

| Token                         | Valor                           | Uso                    |
| ----------------------------- | ------------------------------- | ---------------------- |
| `--motion-easing-linear`      | `cubic-bezier(0, 0, 1, 1)`      | progresso, loads       |
| `--motion-easing-standard`    | `cubic-bezier(0.3, 0, 0, 1)`    | maioria das transições |
| `--motion-easing-continuous`  | `cubic-bezier(0.3, 0, 0.7, 1)`  | loops                  |
| `--motion-easing-quick-enter` | `cubic-bezier(0, 0, 0, 1)`      | elementos entrando     |
| `--motion-easing-quick-exit`  | `cubic-bezier(1, 0, 1, 1)`      | elementos saindo       |
| `--motion-easing-soft-enter`  | `cubic-bezier(0, 0, 0.7, 1)`    | entrada suave          |
| `--motion-easing-soft-exit`   | `cubic-bezier(0.3, 0, 1, 1)`    | saída suave            |
| `--motion-easing-bounce`      | `cubic-bezier(0.3, 0, 0, 1.25)` | feedback de ação       |

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
| `body-lg`    | `--font-size-100` (16px) | `--line-height-150` (24px) | —                  | Descrições de página, corpo grande            |
| `body-md`    | `--font-size-087` (14px) | `--line-height-125` (20px) | —                  | Prose, input text, texto secundário           |
| `label-lg`   | `--font-size-087` (14px) | `--line-height-125` (20px) | —                  | Texto de botão, rótulos de ação               |
| `label-md`   | `--font-size-075` (12px) | `--line-height-100` (16px) | —                  | Form labels, helper, metadata, alerts, toasts |

**Observação sobre `body-md` vs `label-lg`:** têm valores idênticos (14px/20lh) mas nomes diferentes. O nome comunica **papel**, não tamanho — `.button { font-size: var(--text-label-lg-size) }` deixa claro que é rótulo de ação, enquanto `.description { font-size: var(--text-body-md-size) }` indica prose. Podem evoluir separadamente.

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
- **`label-sm`** (10px, possivelmente com tracking positivo): quando o primeiro badge/pill/status for construído. Neste ponto decidir se volta a chamar `signal`, se fica `label-sm`, ou se vira um role `overline`.
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
| `--color-background-accent`           | `--color-coral-500`   | coral — ação principal                     |
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
| `--color-foreground-accent`       | `--color-coral-500`   | destaques, links de ação        |
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
| `--color-border-accent`    | `--color-coral-500`   | input em foco           |
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
