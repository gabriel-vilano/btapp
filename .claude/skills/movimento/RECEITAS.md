# Receitas de movimento

Implementações prontas para os casos mais comuns, já nos tokens do DS. Partir da receita e adaptar; não reconstruir do zero. Curvas e durações seguem o mapa de PADROES.md > "Curvas" e "Durações". Os seletores `[data-open]` e `[data-closing]` são ilustrativos: usar o atributo ou a classe que o componente já tem.

Antes de copiar, conferir se o componente já existe em `src/components/ui/`: Dialog e Toast já trazem o movimento resolvido, com o motivo comentado no CSS.

## Press

Qualquer elemento tocável. Retorno instantâneo de que a interface ouviu. No DS, o press é o state layer, sem escala (decisão D3; `docs/TOKENS.md` > "State layers").

```css
.button {
  position: relative;
  overflow: hidden;
}

.button::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--color-state-layer-neutral);
  pointer-events: none;
  transition: background-color var(--motion-duration-short-3)
    var(--motion-easing-standard);
}

@media (hover: hover) {
  .button:hover::after {
    background-color: var(--color-state-layer-hover);
  }
}

.button:active::after {
  background-color: var(--color-state-layer-pressed);
}
```

Sobre fundo escuro ou colorido, as variantes `*-on-strong`. O `:active` é toque de verdade no celular, então não vai na media query; o `:hover`, sim.

## Menu, popover, select

Cresce a partir do gatilho, não do nada.

```css
.menu {
  transform-origin: top center; /* abre para baixo do botão: nasce da borda de cima */
  transition:
    opacity var(--motion-duration-short-3) var(--motion-easing-quick-enter),
    transform var(--motion-duration-short-3) var(--motion-easing-quick-enter);
}

@starting-style {
  .menu {
    opacity: 0;
    transform: scale(0.95);
  }
}

.menu[data-closing] {
  opacity: 0;
  transform: scale(0.95);
  transition-timing-function: var(--motion-easing-quick-exit);
}

@media (prefers-reduced-motion: reduce) {
  .menu {
    transition-property: opacity;
  }
}
```

O `transform-origin` é o ponto todo: o painel tem que parecer saído do que foi tocado. Sem Base UI, a origem é fixada pelo lado em que o painel abre. Se o componente abre para lados diferentes conforme o espaço, ele expõe o lado num atributo (`data-side="top"`) e o CSS escolhe a origem por ele.

## Tooltip

O mesmo formato do popover, e mais um detalhe que quase toda implementação esquece.

```css
.tooltip {
  transform-origin: bottom center; /* acima do gatilho */
  transition:
    opacity var(--motion-duration-short-3) var(--motion-easing-quick-enter),
    transform var(--motion-duration-short-3) var(--motion-easing-quick-enter);
}

@starting-style {
  .tooltip {
    opacity: 0;
    transform: scale(0.97);
  }
}

/* Com um tooltip aberto, os vizinhos abrem na hora */
.tooltip[data-instant] {
  transition-duration: var(--motion-duration-instant);
}
```

O atraso do primeiro evita abrir sem querer. Depois dele, pular atraso e animação deixa a barra inteira mais rápida. No celular não há hover: tooltip só faz sentido em desktop.

## Dialog centralizado

O único popover que fica no centro. Já implementado em `src/components/ui/Dialog` (a partir de 800px).

```css
.panel {
  transform-origin: center; /* exceção: não está ancorado num gatilho */
  animation: center-in var(--motion-duration-medium-1)
    var(--motion-easing-quick-enter);
}

.scrim {
  animation: scrim-in var(--motion-duration-medium-1)
    var(--motion-easing-quick-enter);
}

@keyframes center-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}

@keyframes scrim-in {
  from {
    opacity: 0;
  }
}
```

Scrim e painel esmaecem juntos, para lerem como uma superfície só. Keyframe aqui é aceitável: o Dialog é ocasional e só sai desmontando, então não há entrada interrompida (PADROES.md > "Interrupção"). Se ganhar saída animada, passar para transição.

## Sheet

O Dialog abaixo de 800px. Entra da base com o próprio tamanho.

```css
.sheet {
  animation: sheet-in var(--motion-duration-medium-1)
    var(--motion-easing-quick-enter);
}

@keyframes sheet-in {
  from {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheet {
    animation-name: fade-in; /* só esmaece, sem subir */
  }
}
```

Com arraste, vira problema de gesto: ver "Arrastar para fechar".

## Toast

Já implementado em `src/components/ui/Toast`. Transição, e não keyframes, porque toasts empilham e podem sair antes de terminar de entrar.

```css
.toast {
  transition:
    opacity var(--motion-duration-medium-1) var(--motion-easing-quick-enter),
    transform var(--motion-duration-medium-1) var(--motion-easing-quick-enter);
}

@starting-style {
  .toast {
    opacity: 0;
    transform: translateY(var(--spacing-100));
  }
}

.toast--exiting {
  opacity: 0;
  transform: translateY(var(--spacing-100));
  transition-duration: var(--motion-duration-short-3);
  transition-timing-function: var(--motion-easing-quick-exit);
  pointer-events: none; /* saindo, não recebe toque */
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    transition-property: opacity;
  }
}
```

Sai pelo caminho de entrada, e mais rápido do que entrou. Quando os toasts empilham e a lista se reacomoda, o esmaecimento briga com a mudança de altura: não há fórmula para o par, ajustar no olho e conferir de novo no dia seguinte.

## Acordeão

```css
.content {
  overflow: hidden;
  transition:
    height var(--motion-duration-short-3) var(--motion-easing-standard),
    opacity var(--motion-duration-short-3) var(--motion-easing-standard);
}
```

Curto: é das poucas animações que custam layout a cada quadro, então duração longa é cara, além de lenta. Medir a altura do conteúdo em JS em vez de animar até `auto`, ou usar `interpolate-size: allow-keywords` onde o navegador suporta. Com movimento reduzido, só a opacidade.

## Stagger na entrada de um grupo

Para lista ou grade vista de vez em quando, não para a lista rolada o dia inteiro (feed, ranking).

```css
.item {
  animation: item-in var(--motion-duration-medium-1)
    var(--motion-easing-quick-enter) both;
}

.item:nth-child(2) { animation-delay: var(--motion-duration-short-1); }
.item:nth-child(3) { animation-delay: calc(var(--motion-duration-short-1) * 2); }
.item:nth-child(4) { animation-delay: calc(var(--motion-duration-short-1) * 3); }

@keyframes item-in {
  from {
    opacity: 0;
    transform: translateY(var(--spacing-100));
  }
}
```

Decorativo: nunca bloqueia a interação enquanto toca.

## Segurar para confirmar

Para ação destrutiva em que um toque é fácil demais de disparar sem querer.

```css
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--motion-duration-short-3)
    var(--motion-easing-quick-exit); /* soltar: rápido */
}

.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s var(--motion-easing-linear); /* segurar: lento e deliberado */
}
```

`linear` está certo aqui: o preenchimento é indicador de progresso, e progresso não tem curva. O botão não encolhe (D3): o preenchimento já é o retorno. O `2s` nasce como token se a receita entrar no produto.

## Indicador de aba com troca de cor

Cronometrar a troca de cor de cada aba nunca fica certo. Recortar em vez disso.

Duplicar a lista de abas. Estilizar a cópia como o estado ativo (fundo `--color-background-inverse`, texto `--color-foreground-on-inverse`, a regra "seleção em grafite" do DS). Recortar a cópia para só a aba ativa aparecer e animar o recorte na troca:

```css
.tabs__active-copy {
  clip-path: inset(0 60% 0 20%); /* vem da posição da aba ativa */
  transition: clip-path var(--motion-duration-medium-1)
    var(--motion-easing-standard);
  pointer-events: none;
}
```

Texto e fundo mudam juntos, em sincronia perfeita, porque é um elemento só sendo revelado, e não duas cores interpoladas. A cópia é decorativa: `aria-hidden`.

## Revelar na rolagem

Só em superfície de marketing, e o LetzPlay ainda não tem. Não fazer em UI funcional visitada todo dia.

```css
.reveal {
  clip-path: inset(0 0 100% 0);
  transition: clip-path var(--motion-duration-long-1)
    var(--motion-easing-standard);
}

.reveal[data-visible] {
  clip-path: inset(0 0 0 0);
}
```

Disparar com `IntersectionObserver`, uma vez só. Reanimar a cada passagem é a interface brigando com quem lê.

## Arrastar para fechar

O sheet do Dialog já tem (`useSheetDrag` e `sheetDrag.ts`). Os detalhes que separam um arraste bom de um ruim:

```js
// Fechar por impulso, não só por distância
const elapsed = Date.now() - dragStartTime;
const velocity = Math.abs(dragDistance) / elapsed;
if (Math.abs(dragDistance) >= DISMISS_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

```js
// transform no próprio elemento arrastado
panel.style.transform = `translateY(${distance}px)`;
```

- **Pointer capture** quando o arraste começa.
- **Proteção multitoque:** guardar o `pointerId` do início e ignorar os outros ponteiros no `move`, no `up` e no `cancel`.
- **Amortecer além do limite**, com resistência crescente, em vez de parede.
- **Durante o arraste, sem transição** (o painel segue o dedo); ao soltar, a transição volta e leva o painel ao lugar ou para fora. Se o retorno pedir mola, `--motion-easing-bounce`, que é exatamente o gesto com momento que o DS reserva para ele.

## Crossfade que não assenta

Quando dois estados se sobrepõem visivelmente e nenhum ajuste de curva ou duração resolve:

```css
.content {
  transition:
    filter var(--motion-duration-short-3) var(--motion-easing-standard),
    opacity var(--motion-duration-short-3) var(--motion-easing-standard);
}

.content[data-transitioning] {
  filter: blur(2px);
  opacity: 0.7;
}
```

Sem blur, o olho lê dois objetos trocando de lugar. Com blur, uma transformação só. Até 8px, nunca contínuo, nunca em superfície grande.

## Programático, sem lib

Quando o movimento precisa de controle por JS mas não de dependência, a WAAPI tem desempenho de CSS:

```js
const styles = getComputedStyle(document.documentElement);
element.animate(
  [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
  {
    duration: parseFloat(styles.getPropertyValue("--motion-duration-medium-1")),
    easing: styles.getPropertyValue("--motion-easing-standard").trim(),
    fill: "forwards",
  },
);
```

A WAAPI não lê `var()` nas opções, então os tokens vêm do `getComputedStyle`. Acelerada na GPU, interruptível e sem custo de bundle.
