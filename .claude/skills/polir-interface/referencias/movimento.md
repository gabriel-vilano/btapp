# Movimento

Transição × keyframes, entrada e saída, troca de ícone, press e contenção.

**Regras do DS (D2):** o DS adotou as regras de motion do Emil Kowalski. Antes de propor valor, ler a seção "Motion" do `docs/TOKENS.md` e os `--motion-*` de `styles/tokens/primitives.css`: os tokens são a fonte, e esta referência não repete valores que podem mudar.

- nada de ease-in (curva que começa devagar) numa transição de UI: entrada e saída usam curva que desacelera no fim;
- transição de UI abaixo de 300ms; durações longas só em loop (Spinner, Skeleton) ou momento raro;
- sem bounce (overshoot) em ação utilitária;
- só `transform` e `opacity` quando possível; nunca `scale(0)`.

Se o problema está no próprio token (uma curva de saída que ainda é ease-in, por exemplo), o achado aponta o token em `primitives.css`, não cada componente que o usa.

Os valores do Krehel que brigam com isso ficam de fora: blur de 4px em toda entrada, `scale(0.96)` no press, ease-out cravado de 300/150ms.

## Transição × keyframes

| | Transição CSS | Keyframes |
| --- | --- | --- |
| Comportamento | Vai em direção ao estado mais recente | Roda numa linha do tempo fixa |
| Interrompível | Sim: muda de rumo no meio | Não: recomeça do início |
| Usar em | Mudança de estado (hover, abrir/fechar, toggle) | Sequência que roda uma vez, loop |

```css
/* Bom: abrir e fechar no meio inverte suave */
.panel {
  transform: translateY(var(--spacing-200));
  opacity: 0;
  transition:
    transform var(--motion-duration-medium-1) var(--motion-easing-standard),
    opacity var(--motion-duration-medium-1) var(--motion-easing-standard);
}
.panel--open {
  transform: none;
  opacity: 1;
}

/* Ruim: fechar no meio da animação pula ou recomeça */
.panel--open {
  animation: panel-in var(--motion-duration-medium-1) var(--motion-easing-standard) forwards;
}
```

Elemento que se dispara rápido e pode empilhar (Toast, item que entra numa lista) é o caso clássico de transição em vez de keyframes.

## Entrada em etapas

Só para entrada rara em que a ordem ajuda a ler a hierarquia (primeira abertura de um estado vazio, confirmação de resultado registrado). Dividir em blocos semânticos (título, texto, ação) e escalonar com um atraso curto entre eles. Nunca em interação de rotina (troca de aba, hover, digitação).

```css
.stagger__item {
  opacity: 0;
  transform: translateY(var(--spacing-150));
  transition:
    opacity var(--motion-duration-medium-1) var(--motion-easing-standard),
    transform var(--motion-duration-medium-1) var(--motion-easing-standard);
}
.stagger--visible .stagger__item {
  opacity: 1;
  transform: none;
}
.stagger--visible .stagger__item:nth-child(2) { transition-delay: var(--motion-duration-short-1); }
.stagger--visible .stagger__item:nth-child(3) { transition-delay: var(--motion-duration-short-2); }
```

Blur na entrada não é padrão do DS: só serve para mascarar um cross-fade em que as duas formas ficariam visíveis ao mesmo tempo.

## Saída

A saída chama menos atenção que a entrada: o foco do jogador já está indo para outra coisa.

- deslocamento pequeno e fixo (um passo de espaçamento), nunca a altura inteira do elemento;
- mais curta que a entrada;
- curva de saída do DS, sem ease-in;
- quando o movimento não informa nada, a interação se repete muito ou há `prefers-reduced-motion`, remover na hora.

```css
/* Bom: some subindo um pouco */
.item--leaving {
  opacity: 0;
  transform: translateY(calc(-1 * var(--spacing-150)));
  transition:
    opacity var(--motion-duration-short-3) var(--motion-easing-standard),
    transform var(--motion-duration-short-3) var(--motion-easing-standard);
}

/* Ruim: saída dramática que rouba o foco */
.item--leaving {
  transform: translateY(-100%) scale(0.5);
  transition: all var(--motion-duration-medium-3) ease-in;
}
```

## Troca de ícone

Ícone que muda com o estado (curtir/curtido, copiar/copiado, mostrar/esconder senha) troca em cross-fade, não aparece e some seco. Sem lib de animação (o projeto não tem Motion, e não se instala uma para isso): os dois ícones ficam no DOM, um posicionado por cima do outro, e trocam por `opacity` e `transform`.

```tsx
<span className={styles.swap} data-active={isActive}>
  <span className={styles.swap__active}><Icon icon={CheckIcon} size="sm" /></span>
  <span className={styles.swap__idle}><Icon icon={CopyIcon} size="sm" /></span>
</span>
```

```css
.swap {
  position: relative;
  display: inline-flex;
}

.swap__active,
.swap__idle {
  display: inline-flex;
  transition:
    opacity var(--motion-duration-short-3) var(--motion-easing-standard),
    transform var(--motion-duration-short-3) var(--motion-easing-standard);
}

.swap__active {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(0.5);
}

.swap[data-active="true"] .swap__active {
  opacity: 1;
  transform: none;
}

.swap[data-active="true"] .swap__idle {
  opacity: 0;
  transform: scale(0.5);
}
```

O ícone que não é absoluto dá o tamanho. Animar ícone só quando ele aparece por contexto ou troca de estado; ícone de navegação, decorativo ou sempre visível fica parado. O estado também muda por texto ou `aria-label` (o movimento nunca é o único sinal).

## Press

O feedback de toque do DS é o state layer: o `::after` do controle vai para `--color-state-layer-pressed` (ou `-on-strong` sobre fundo forte) no `:active` (D3). **Não se usa `scale()` no press**, e a falta dele não é achado.

É achado: controle interativo sem nenhum estado de `:active`, ou press feito por `scale()`, `filter` ou mudança de tamanho.

## Animação no carregamento da página

Elemento que já nasce no estado padrão não anima ao montar: só na mudança seguinte. Em CSS puro, isso acontece sozinho com transição (não há "estado anterior" na primeira pintura). O risco está em keyframes aplicados direto na classe base, que rodam a cada montagem e a cada volta para a tela.

## Contenção

Movimento é orçamento, não enfeite.

- **Interação frequente sem animação própria.** Hover de linha, digitação, troca de aba e segmento: resposta imediata ou transição de cor/opacidade curta (até `--motion-duration-short-3`).
- **O movimento nunca é o único sinal.** Toda mudança animada também muda cor, ícone ou texto.
- **Curto e preciso vence chamativo.** Se uma animação menor diz o mesmo, ficar com ela.
- **`prefers-reduced-motion`:** menos movimento e mais suave, sem zerar o sinal estático.

```css
@media (prefers-reduced-motion: reduce) {
  .panel {
    transform: none; /* sem deslocamento; a opacidade continua */
  }
}
```
