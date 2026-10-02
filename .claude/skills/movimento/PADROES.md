# Padrões de movimento

A régua dos dois modos da `/movimento`: o modo criar escolhe por ela, o modo revisar cita por ela. Os valores são os tokens de `styles/tokens/primitives.css`; o uso de cada um está em `docs/TOKENS.md` > "Motion — durações", "Motion — easings" e "Motion: regras". Este arquivo não repete valores: cita o token.

## Sumário

1. Frequência
2. Propósitos
3. Ferramenta
4. Propriedades e etapas de renderização
5. Curvas
6. Durações
7. Interrupção e tempo assimétrico
8. Gestos e arraste
9. Transform e clip-path
10. Stagger
11. Crossfade que não assenta
12. Acessibilidade
13. Performance
14. Gatilhos de alerta
15. Depuração

## 1. Frequência

| Frequência | Decisão |
| --- | --- |
| 100+ vezes por dia, ou disparada por teclado | Nenhuma animação. Nunca. |
| Dezenas de vezes por dia (hover, navegar numa lista, trocar de aba, marcar um Chip) | Quase imperceptível: o state layer em `short-3`, ou nada |
| Ocasional (Dialog, sheet, Toast) | Animação padrão |
| Rara ou primeira vez (onboarding, sucesso, resultado confirmado) | Onde mora o deleite; decidir com o Gabriel |

Ação de teclado desqualifica, não é questão de julgamento: ela se repete centenas de vezes e a animação a deixa lenta e solta. (O Raycast não anima abrir e fechar, e está certo.)

## 2. Propósitos

Nomear um antes de seguir:

- **Feedback:** confirma que a interface ouviu o jogador.
- **Consistência espacial:** mostra de onde algo veio ou para onde foi.
- **Indicar estado:** torna legível uma mudança de estado.
- **Evitar mudança brusca:** liga um conteúdo que, sem isso, se teletransportaria.
- **Explicar:** demonstra como algo funciona (onboarding).
- **Deleite:** só na faixa rara ou primeira vez.

"Fica bonito" num elemento visto com frequência é motivo para parar. Dado que o jogador está lendo ou usando (placar, posição, delta do ranking) não se move por estilo.

## 3. Ferramenta

Descer a lista e parar na primeira que serve.

| Necessidade | Ferramenta |
| --- | --- |
| Hover, press, cor, alternância controlada por classe ou atributo | Transição CSS |
| Entrada no mount, sem estado em JS | `@starting-style` |
| Movimento predeterminado que precisa ficar liso com a página ocupada | Animação CSS (`@keyframes`), fora da thread principal |
| Controle por JS com desempenho de CSS, sem lib | WAAPI (`element.animate()`) |
| Spring | `linear()` em CSS, gerado a partir da curva do spring; se não couber, fora do escopo |

Animação CSS ganha de JS sob carga: roda fora da thread principal, enquanto um `requestAnimationFrame` perde quadros quando o navegador carrega, roda script ou pinta. CSS para o predeterminado; JS só para o dinâmico e interruptível. Nunca instalar Motion ou outra lib de animação.

Se o pedido é um componente (menu, sheet, toast), o DS já pode ter: o Dialog também é sheet (com arraste em `useSheetDrag`) e o Toast já empilha. Montar à mão um `<div>` que abre e fecha é como se perde gestão de foco.

## 4. Propriedades e etapas de renderização

O navegador desenha um quadro em três etapas, da mais cara para a mais barata:

| Etapa | Propriedades | Custo de animar |
| --- | --- | --- |
| **Layout** | tamanho, posição, fluxo, grid, flex (`width`, `height`, `margin`, `padding`, `top`, `left`) | Recalcula o layout e repinta a cada quadro |
| **Pintura** (paint) | cor, borda, gradiente, máscara, imagem, filtro | Repinta a cada quadro |
| **Composição** (composite) | `transform`, `opacity` | Só recompõe camadas, na GPU |

- **`transform` e `opacity`** no que se move. `clip-path` é a quarta aceita (RECEITAS.md). `height` só em acordeão, onde não há equivalente em `transform`.
- **Pintura só em elemento pequeno e isolado.** É o caso do state layer do DS: `background-color` num `::after` do tamanho do botão, em `short-3`. Não é achado. Pintura animada em contêiner grande é.
- **Nunca `scale(0)`.** Partir de `scale(0.9–0.97)` com `opacity: 0`. Nada no mundo real surge do nada.
- **Origem no gatilho** para popover, menu e tooltip. Sem Base UI, não há `var(--transform-origin)`: fixar no componente, do lado em que o painel nasce (`top center` para um menu que abre para baixo, `bottom center` para cima). **Dialog centralizado e sheet são exceção**: não estão ancorados num gatilho, entram do centro e da base.
- **Percentual no `translate()`** é relativo ao próprio elemento: `translateY(100%)` move a própria altura, qualquer que seja o conteúdo. Preferir a pixels fixos (o sheet do Dialog entra assim).
- **Não dirigir o `transform` de um filho por uma variável CSS no pai**: recalcula o estilo de todos os filhos. Pôr o `transform` no próprio elemento. (O `--dialog-drag-offset` do Dialog é definido no próprio painel que se move, então não cai aqui.)

## 5. Curvas

Ordem de decisão:

| Situação | Token |
| --- | --- |
| Entrar | `--motion-easing-quick-enter` (padrão) ou `--motion-easing-soft-enter` (mais calma) |
| Sair | `--motion-easing-quick-exit` |
| Sheet ou gaveta entrando | `--motion-easing-quick-enter` |
| Mover ou transformar na tela, cor, state layer | `--motion-easing-standard` |
| Movimento constante (progresso, rotação do Spinner) | `--motion-easing-linear` |
| Loop | `--motion-easing-continuous` |
| Gesto com momento (soltar um arraste) ou momento raro | `--motion-easing-bounce` |
| Na dúvida | ease-out: `quick-enter` |

**Nunca ease-in em UI.** Começa devagar e atrasa justo o momento que o jogador está olhando. Ease-out em 200ms *parece* mais rápido que ease-in em 200ms. Também ficam fora as curvas prontas do CSS (`ease`, `ease-out`, `ease-in-out`): são fracas, e o DS tem as próprias.

**Correspondência com o Emil**, para ler as fontes: o `--ease-out` dele, `cubic-bezier(0.23, 1, 0.32, 1)`, é exatamente o `quick-exit`; a curva de gaveta dele corresponde ao `quick-enter` do sheet; o `ease` de hover e cor corresponde ao `standard`. O DS não tem o `--ease-in-out` forte dele. Se um movimento na tela pedir de verdade essa curva (um indicador de aba que desliza), propor o token novo, não escrever o valor cru.

Precisa de uma curva que não existe? Tirar de [easing.dev](https://easing.dev/) ou [easings.co](https://easings.co/), virar token e documentar no `docs/TOKENS.md`. Não inventar à mão.

## 6. Durações

| Elemento | Token |
| --- | --- |
| Troca sem percepção (tooltip depois do primeiro aberto) | `--motion-duration-instant`, ou nenhuma transição |
| Stagger entre itens | `--motion-duration-short-1` |
| Marcar e desmarcar (ícone do Checkbox) | `--motion-duration-short-2` |
| Retorno do press, state layer, cor e borda | `--motion-duration-short-3` |
| Tooltip, popover pequeno | `--motion-duration-short-3` |
| Menu, select | `--motion-duration-short-3` ou `--motion-duration-medium-1` |
| Saída (Toast) | `--motion-duration-short-3`: a saída é mais curta que a entrada |
| Dialog, sheet, entrada do Toast | `--motion-duration-medium-1` (padrão) |
| Teto de transição de UI maior | `--motion-duration-medium-2` |
| Dialog ou sheet longo, com motivo | até `--motion-duration-medium-3` |
| Loops (Spinner, pulso do Skeleton) e momentos raros | `--motion-duration-medium-3` e `--motion-duration-long-*` |

**Transição de UI abaixo de 300ms.** Um menu em 167ms responde melhor que um em 400ms. Spinner mais rápido faz a espera parecer menor no mesmo tempo real.

O Emil põe o toast em 400ms com `ease`, por personalidade (o Sonner). O DS escolheu outra coisa: entrada do Toast em `medium-1` com `quick-enter`, saída em `short-3` com `quick-exit`. A régua é o DS.

## 7. Interrupção e tempo assimétrico

- **Transição, e não keyframes, no que se dispara rápido ou empilha** (toast, toggle, qualquer coisa que o jogador dispara duas vezes em um segundo). A transição retoma do valor atual; o keyframe recomeça do zero e o elemento dá um salto.
- **`@starting-style` para entrar no mount com transição**, sem JS:

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
```

- **Keyframes servem** para o que é predeterminado e não se interrompe no meio: loops, a entrada de algo ocasional que só sai desmontando. Keyframe em elemento ocasional não é achado só por ser keyframe; vira achado se o elemento pode ser interrompido no meio da animação.
- **O que está saindo não recebe toque nem foco.** No estado de saída, `pointer-events: none`; no JS, ignorar um segundo pedido de fechar o que já está saindo. Senão, o botão de fechar de um toast que esmaece ainda dispara.
- **Timer em JS que espera a animação lê a duração do token**, não de um número copiado: `getComputedStyle(el).getPropertyValue("--motion-duration-…")`, ou esperar a animação de fato com `Promise.all(el.getAnimations().map((a) => a.finished))`. Uma cópia à mão corta a saída no meio, ou deixa o elemento invisível ocupando lugar, quando o token muda.
- **Sair pelo caminho de entrada.** O toast que sobe de baixo sai por baixo. Caminho simétrico é o que torna óbvio o arrastar para fechar.
- **Tempo assimétrico onde o jogador decide.** Lento na fase deliberada (segurar para confirmar), rápido na resposta do sistema (soltar):

```css
.overlay {
  transition: clip-path var(--motion-duration-short-3) var(--motion-easing-quick-exit); /* soltar: rápido */
}

.button:active .overlay {
  transition: clip-path 2s var(--motion-easing-linear); /* segurar: lento e deliberado */
}
```

O `2s` não tem token: se a receita entrar no produto, ele nasce como token (regra firme 1).

## 8. Gestos e arraste

- **Dispensar pelo impulso**, não só pela distância: `velocidade = Math.abs(distancia) / tempoDecorrido`. O Emil usa ~0,11 px/ms no toast; o sheet do Dialog tem os próprios limites, registrados no MDX. Um peteleco basta.
- **Amortecer além do limite:** arrastar além da borda natural move cada vez menos. Atrito, e não parede.
- **Pointer capture** quando o arraste começa, para ele continuar quando o dedo sai do elemento.
- **Proteção multitoque:** guardar o `pointerId` de quem começou o arraste e ignorar os eventos de qualquer outro ponteiro no `move`, no `up` e no `cancel`, não só no `down`. No toque, cada dedo tem captura implícita no alvo, então os eventos de um segundo dedo chegam ao mesmo handler e o elemento pula.
- **`transform` no próprio elemento arrastado**, nunca por variável no pai.
- O arraste do sheet do Dialog já existe (`useSheetDrag`, `sheetDrag.ts`). Partir dele.

## 9. Transform e clip-path

- **`scale()` escala os filhos também** (texto, ícone). No press, o DS não usa (D3).
- **`clip-path: inset(t r b l)`**: cada valor come a partir daquele lado. Serve para revelar, para o preenchimento do segurar para confirmar e para a troca de cor do indicador de aba (RECEITAS.md).
- **3D:** `rotateX/Y` com `transform-style: preserve-3d` dá profundidade e virada sem JS. Raro num app de competição.

## 10. Stagger

Entrada em grupo com `--motion-duration-short-1` entre itens. Atraso maior parece lento. Stagger é decorativo: nunca bloqueia a interação enquanto toca. Não usar em lista que o jogador rola o dia inteiro (feed, ranking).

## 11. Crossfade que não assenta

Quando dois estados se sobrepõem visivelmente na transição e nenhum ajuste de curva ou duração resolve, um `filter: blur(2px)` durante a troca funde os dois numa transformação só. Blur animado até 8px, curto e de uma vez: nunca contínuo, nunca em superfície grande (caro, ainda mais no Safari). Antes do blur, tentar `opacity` e `translate`.

## 12. Acessibilidade

```css
@media (prefers-reduced-motion: reduce) {
  .toast {
    transition-property: opacity; /* mantém o esmaecimento, tira o deslocamento */
  }
}

@media (hover: hover) {
  .card:hover::after {
    background-color: var(--color-state-layer-hover); /* toque dispara hover falso */
  }
}
```

- **Movimento reduzido é mais suave, e não zero.** Manter o que ajuda a entender (esmaecimento, cor), tirar movimento e mudança de posição; num loop, desacelerar. Zerar tudo (`animation-duration: 0.01ms !important`) faz o elemento surgir de golpe.
- **Hover dentro de `@media (hover: hover)`**, o padrão do DS. O Emil acrescenta `and (pointer: fine)`; aqui não é exigido.
- **Movimento nunca é o único canal de feedback.** O estado precisa ser legível sem a animação (cor, texto, ícone).

## 13. Performance

- **Nunca intercalar leitura e escrita de layout no mesmo quadro.** Ler tudo antes, escrever depois. Para um efeito que parece de layout, medir uma vez e animar por `transform` (FLIP):

```js
const first = el.getBoundingClientRect();
el.classList.add("moved");
const last = el.getBoundingClientRect();
el.style.transform = `translateY(${first.top - last.top}px)`;
requestAnimationFrame(() => {
  el.style.transition = "transform var(--motion-duration-medium-1) var(--motion-easing-standard)";
  el.style.transform = "";
});
```

- **Rolagem:** nunca animar a partir de `scrollY` ou de eventos de rolagem. `IntersectionObserver` para visibilidade; `animation-timeline: view()` para movimento ligado à rolagem. Pausar o que sai da tela.
- **`requestAnimationFrame` em loop sempre com condição de parada.**
- **Não animar variável CSS** que alimenta `transform`, `opacity` ou posição, nem variável herdada.
- **`will-change` cirúrgico e temporário.** Muitas camadas promovidas, ou grandes, custam memória. Promoção de camada não é garantida: conferir na ferramenta quando importa.
- **WAAPI** dá controle por JS com desempenho de CSS, interruptível e sem lib (RECEITAS.md).
- **View transitions** só em mudança de navegação, não em UI de interação intensa nem onde precisa interromper.
- **Não misturar sistemas de animação** que medem ou mexem no layout no mesmo componente.

## 14. Gatilhos de alerta

Apontar na hora. No modo criar, conferir antes de entregar; no modo revisar, cada um é achado.

| Gatilho | No lugar |
| --- | --- |
| `transition: all` | Nomear as propriedades |
| Entrada em `scale(0)` | `scale(0.95)` com `opacity: 0` |
| Popover ou toast que só esmaece, sem ponto de partida espacial (o scrim e o movimento reduzido estão isentos) | Partir de um `translate` ou `scale` pequeno |
| Ease-in (`ease-in` ou curva com início lento) em entrada ou saída | `quick-enter`, `soft-enter` ou `quick-exit` |
| Curva ou duração escrita à mão, fora dos `--motion-*`, inclusive num timer em JS que espera a animação | O token (no JS, pelo `getComputedStyle` ou pelo `getAnimations()`); se não existe, propor token novo |
| Curva pronta do CSS (`ease`, `ease-out`) em animação deliberada | O token correspondente |
| Animação em atalho de teclado ou ação de 100+ por dia | Nenhuma animação |
| Transição de UI acima de 300ms sem motivo | `short-3` ou `medium-1` |
| `transform-origin: center` em popover ancorado num gatilho | Origem fixada no lado do gatilho |
| Keyframes em toast, toggle ou no que se dispara rápido ou empilha | Transição com `@starting-style` |
| Animar `width`, `height`, `margin`, `padding`, `top` ou `left` | `transform` e `opacity` |
| Variável CSS no pai dirigindo o `transform` do filho | `transform` no próprio elemento |
| Movimento sem `prefers-reduced-motion` | Variante mais suave, não zero |
| `:hover` fora de `@media (hover: hover)` | Envolver na media query |
| `transform: scale(...)` no `:active` (D3) | State layer no `::after` |
| Tempo simétrico em segurar e soltar | Deliberado lento, resposta rápida |
| Grupo entrando todo de uma vez onde cabe stagger | Stagger em `short-1` |
| Lib de animação nova no `package.json` | CSS ou WAAPI |

## 15. Depuração

Recomendar quando a sensação não se decide pelo código:

- **Câmera lenta:** DevTools › Animations em 10% ou 25%, ou a duração 2 a 5 vezes maior por um momento. Ver se a cor cruza limpa, se a curva não para de golpe, se a origem está certa e se as propriedades coordenadas andam juntas.
- **Quadro a quadro:** o painel Animations do Chrome mostra a defasagem entre propriedades coordenadas.
- **Aparelho de verdade** para gesto (sheet, arraste): o celular na mesma rede, no build de produção (hurdle "iOS: React não hidrata em `next dev`" do `CLAUDE.md`).
- **Olho descansado no dia seguinte:** defeitos invisíveis durante o trabalho aparecem depois.
- **Movimento reduzido:** DevTools › Rendering › "Emulate CSS media feature prefers-reduced-motion".
