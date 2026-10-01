---
name: mobile-nativo
description: Corrige e revisa o que faz o LetzPlay parecer site, e não app, no celular — hover preso no toque, flash do toque, 100vh, safe area, zoom em input, atraso no toque, overscroll, texto de botão selecionado, gesto no eixo errado, theme-color, sticky e fixed quebrados e teclado cobrindo barra fixa. Use ao criar ou revisar layout de tela, barra fixa, sheet, carrossel ou interação de toque, ou quando algo "no celular fica estranho".
---

# /mobile-nativo

Tira, um por um, os sinais de que o app é uma página dentro do navegador. Atua na camada da plataforma: viewport, toque, rolagem, área segura, barra do navegador e teclado. Quase toda correção é uma declaração de CSS ou uma opção do `viewport` do Next.

Fica fora daqui: movimento (duração, curva, o que animar) e decisões de design de tela (onde fica a ação primária, se cabe um sheet). Esta skill não muda layout por gosto: só corrige o comportamento no aparelho.

## Postura

O celular do jogador é a referência, não o DevTools. Emulação de dispositivo não reproduz hover preso, atraso no toque, elástico da rolagem, área segura nem teclado. Quem não tem aparelho (agente na nuvem) diz o que verificou pelo código e o que precisa de um celular de verdade.

Dois erros, e o primeiro é o pior:

1. **Corrigir o que o desktop mostra.** Os defeitos daqui não aparecem no Chrome do desktop.
2. **Usar JavaScript onde CSS ou o `viewport` resolvem.** Um hook `useIsTouchDevice()` para esconder hover é a ferramenta errada; uma media query é a certa.

## Regras firmes

1. **Toda correção vem com o porquê.** Aplicar onde o porquê vale, não por hábito: `user-select: none` em texto de conteúdo é defeito, em botão é correto.
2. **Capacidade, não aparelho.** `(hover: hover)`, `(pointer: coarse)`, `env()`, `dvh`. Nunca decidir por user agent ou largura de tela para adivinhar toque. Toque e mouse convivem (iPad com trackpad, notebook com tela touch).
3. **Nunca desligar o zoom** (decisão D1 do Gabriel). `userScalable: false` e `maximumScale: 1` reprovam na WCAG 1.4.4 e o Chrome do Android bloqueia o pinch. A correção do zoom ao focar é texto digitado com 16px. Ver a seção 4.
4. **Press é state layer, sem escala** (decisão D3). O retorno do toque é o `:active::after` com `--color-state-layer-pressed`, como em `docs/TOKENS.md` > "State layers". Nada de `transform: scale(...)` no `:active`.
5. **Tokens do DS.** Cor, espaçamento e motion vêm dos tokens. Valor literal só onde o CSS var não chega (meta tag), com comentário dizendo qual token ele espelha.
6. **Escopo da issue.** Mudança global (`styles/reset.css`, `app/layout.tsx`) que a issue não pede vira comentário ou issue nova, não diff escondido no PR.

## Tabela de sintomas

Começar aqui. Achar o sintoma e ler a seção.

<table>
<thead><tr><th>Sintoma</th><th>Correção</th><th>Seção</th></tr></thead>
<tbody>
<tr><td>Hover fica preso depois do toque</td><td><code>:hover</code> dentro de <code>@media (hover: hover)</code></td><td>1</td></tr>
<tr><td>Flash cinza ou azul no toque</td><td><code>-webkit-tap-highlight-color: transparent</code></td><td>2</td></tr>
<tr><td>Altura errada, botão sob a barra do navegador</td><td><code>100dvh</code> (shell) ou <code>100svh</code> (primeira dobra)</td><td>3</td></tr>
<tr><td>Página dá zoom ao focar input</td><td>Texto digitado com 16px</td><td>4</td></tr>
<tr><td>Toque parece lento</td><td>Retorno no <code>:active</code> + <code>touch-action: manipulation</code></td><td>5</td></tr>
<tr><td>Rolagem puxa a página ou o pull-to-refresh</td><td><code>overscroll-behavior: contain</code> no rolável interno</td><td>6</td></tr>
<tr><td>Conteúdo sob o notch ou o indicador de início</td><td><code>viewport-fit=cover</code> + <code>env(safe-area-inset-*)</code></td><td>7</td></tr>
<tr><td>Toque longo seleciona o texto do botão</td><td><code>user-select: none</code> no controle</td><td>8</td></tr>
<tr><td>Carrossel ou arraste rola no eixo errado</td><td><code>touch-action</code> ou <code>scroll-snap</code></td><td>9</td></tr>
<tr><td>Barra de status com cor diferente do topo</td><td><code>themeColor</code> no <code>viewport</code></td><td>10</td></tr>
<tr><td><code>sticky</code> não gruda, <code>fixed</code> fora do lugar, teclado cobre a barra, celular deitado com layout de desktop</td><td>Armadilhas de layout</td><td>11</td></tr>
<tr><td>Certo no Chrome, errado no celular</td><td>Testar em aparelho</td><td>12</td></tr>
</tbody>
</table>

## As correções

### 1. Hover preso depois do toque

No toque não existe hover, então o navegador finge um: o primeiro toque aplica o `:hover` e ele fica até o próximo toque em outro lugar. No iOS, pior: o primeiro toque só aplica o hover e não dispara o `click` (hurdle "iOS: sticky hover" do `CLAUDE.md`).

A regra do projeto é `@media (hover: hover)` em toda regra `:hover`, como já fazem os `.module.css` do DS:

```css
@media (hover: hover) {
  .btn:hover::after {
    background-color: var(--color-state-layer-hover);
  }
}
```

**Proposta, não regra:** a fonte original usa `(hover: hover) and (pointer: fine)`, que também exclui caneta e alguns Androids que declaram hover. Se o caso pedir, sugerir no PR como leitura para o Gabriel; não trocar a consulta no repo inteiro.

O toque continua precisando de retorno: o `:active` (seção 5).

### 2. Flash cinza ou azul no toque

O Safari do iOS e o Chrome do Android pintam um destaque translúcido sobre o que tem `click`. É o sinal mais forte de "isto é um site", e briga com o state layer.

```css
html {
  -webkit-tap-highlight-color: transparent;
}
```

Uma vez, global, no `styles/reset.css` (mudança global: seguir a regra 6). Antes, garantir que todo tocável tem `:active` com state layer, porque o destaque do navegador era o único retorno de quem não tem.

### 3. Altura errada

No celular, `100vh` é a maior altura possível, com a barra do navegador recolhida. Ao abrir a página a barra está visível, então um bloco de `100vh` transborda e o botão preso embaixo fica atrás dela.

- **`100dvh`** acompanha a barra aparecendo e sumindo: certo para o shell, sheet e tela cheia. É o padrão do projeto (`body`, `AppShell`, `Dialog`).
- **`100svh`** é a menor altura e nunca transborda nem pula: certo para uma primeira dobra que não deve mudar de tamanho ao rolar.
- **`100vh`/`100lvh`** quase nunca.

### 4. Zoom ao focar o input

O Safari do iOS dá zoom quando o foco cai num campo com texto menor que 16px, e não volta ao sair. Desligar o zoom esconde o sintoma e cria um problema de acessibilidade (regra 3).

A correção é **todo texto digitado e placeholder de `input`, `textarea` e `select` com 16px** (`--text-body-lg-size`), em qualquer ponteiro. Rótulo, ajuda e erro continuam em 12px. Decisão D1 do Gabriel.

**Problema conhecido, não achado novo:** se o `app/layout.tsx` ainda tiver `maximumScale: 1` e `userScalable: false`, ou um campo do DS ainda usar 14px, isso já está na issue "Liberar o zoom do navegador e passar o texto dos inputs para 16px" do Linear. Citar a issue pelo nome; não reportar de novo nem corrigir fora dela. O hurdle "iOS: auto-zoom ao focar inputs" do `CLAUDE.md` descreve a solução antiga enquanto essa issue não entrar.

Já no campo, acertar o teclado: `inputMode="numeric"` em código (o OTP), `type="email"` e `type="tel"` nos seus campos, `autoCapitalize="none"` e `autoCorrect="off"` em @username e código, `enterKeyHint` (`"next"`, `"send"`, `"done"`) para a tecla dizer o que faz. O `FormInput` aceita `type`, `inputMode` e `autoComplete`; atributo de teclado que faltar nele é mudança no componente do DS, com story.

### 5. Toque lento

Duas causas somadas.

**Atraso do duplo toque.** O navegador espera um segundo toque para decidir se é zoom. Com `width=device-width` quase todos já pulam a espera, mas não em todo elemento. `touch-action: manipulation` diz que ali não tem zoom por duplo toque, e o `click` sai na hora:

```css
.btn {
  touch-action: manipulation;
}
```

**Retorno no soltar, não no tocar.** Botão nativo responde quando o dedo encosta. Estilizar o `:active` (e, em JS, ouvir `pointerdown`, não `click`). No LetzPlay o retorno é o state layer, sem escala (regra 4):

```css
.btn:active::after {
  background-color: var(--color-state-layer-pressed);
}
```

Se houver transição no state layer, usar os tokens `--motion-*`; não inventar curva.

### 6. Rolagem que vaza para a página

Rolar além do fim de um rolável interno (o conteúdo do sheet, uma lista) arrasta a página de trás, e no topo dispara o pull-to-refresh do Android.

```css
.sheet__body {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

`contain` mantém o elástico do próprio rolável e não move a página. É o que o `Dialog` já faz. Nunca usar `touchmove` + `preventDefault()`: trava a rolagem e deixa o listener não passivo.

**`overscroll-behavior: none` no `html` não é aplicado por padrão.** Ele desliga o pull-to-refresh do navegador no app inteiro, inclusive no feed, onde puxar para atualizar pode ser desejado. É pergunta de produto: se aparecer o caso, abrir Needs Decision (formato do `docs/AGENT_WORKFLOW.md`), não decidir no PR.

### 7. Conteúdo sob o notch

Sem `viewportFit: "cover"` o navegador põe a página só dentro da área segura e os `env(safe-area-inset-*)` valem 0. Com ele, a página vai até a borda e cada barra devolve o espaço com padding. O `app/layout.tsx` já tem `cover` (N26 do `docs/NAVIGATION.md`).

```css
.bar {
  padding-bottom: calc(var(--spacing-200) + env(safe-area-inset-bottom, 0px));
}
```

Quem precisa: o que é fixo ou grudado nas bordas (cabeçalho, TabBar, NavigationRail, sheet, toast, barra de ação no rodapé). Conteúdo comum ganha a margem pelo cabeçalho. Sempre com fallback `0px` dentro de `calc()`. No app logado, o deslocamento do rodapé já vem do `AppShell` (`--shell-bottom-offset`): barra fixa nova usa a variável em vez de somar a área segura de novo. Na revisão, procurar todo `position: fixed` encostado no rodapé que aparece nas telas logadas, inclusive o que vem de provider (toast), e ver se ele desvia da TabBar.

### 8. Toque longo seleciona o texto do botão

Segurar o dedo num botão seleciona o rótulo ou abre o menu de copiar. Controle nativo não faz isso. Texto que é **controle** não se seleciona; texto que é **conteúdo** precisa continuar selecionável.

```css
.chip {
  user-select: none;
  -webkit-user-select: none;   /* o Safari ainda pede o prefixo */
  -webkit-touch-callout: none; /* sem menu de toque longo em link usado como controle */
}
```

Nunca no `body`. O jogador copia telefone de organizador, placar e mensagem de erro: o `OrganizationContact` é o exemplo de texto que precisa ficar selecionável.

### 9. Gesto no eixo errado

Num arraste horizontal o navegador não sabe se rola a página ou o trilho, e chuta. `touch-action` diz o que o **navegador** ainda pode fazer:

- `pan-y` num carrossel horizontal: o navegador fica com a rolagem vertical, o componente com a horizontal;
- `pan-x` numa alça de arraste vertical;
- `none` só no que trata todos os eixos sozinho (a alça de arrastar do `Dialog`). Em qualquer outro lugar, o jogador não consegue rolar por cima.

Se o carrossel usa a rolagem nativa, preferir `scroll-snap-type: x mandatory` no trilho e `scroll-snap-align: start` nos itens: a física do navegador ganha de mola feita à mão, e o `touch-action` deixa de ser necessário.

### 10. Cor da barra de status

A barra de status e a barra do navegador pegam a cor do `theme-color`. No Next, pelo `viewport` do `app/layout.tsx`:

```ts
export const viewport: Viewport = {
  // espelha --color-background-primary (neutral-100): a meta tag não lê CSS var
  themeColor: "#ffffff",
};
```

A cor é a do topo da tela (o fundo do cabeçalho), não a da marca. **Um valor só:** o app não tem tema escuro, então nada de variante `prefers-color-scheme: dark`. Mudança global (regra 6).

### 11. Armadilhas de layout

Defeitos que falham em silêncio, sem erro no console. As quatro primeiras têm como referência a `responsive-craft` (ver "Origem e licença").

- **`overflow: hidden` num ancestral desliga o `sticky`.** Qualquer `overflow` diferente de `visible` (`hidden`, `auto`, `scroll`) faz daquele ancestral o rolável de referência, e o `sticky` passa a grudar nele, que não rola. Para só cortar o que vaza, usar `overflow: clip`, que corta sem virar rolável. Antes de pôr `overflow` num container de tela, procurar `position: sticky` abaixo dele (cabeçalho, linha fixada, barra de ação).
- **`transform` num ancestral prende o `fixed`.** Um elemento `position: fixed` se posiciona pela tela, salvo quando algum ancestral tem `transform`, `filter`, `backdrop-filter`, `perspective`, `contain: paint` ou `will-change: transform`: aí ele passa a se posicionar por esse ancestral e rola junto. Uma animação de entrada com `transform` no container da página basta para o toast ou o sheet saírem do lugar. Elemento fixo fica fora de ancestrais animados ou vai para um portal.
- **`sticky` dentro de flex ou grid estica e não gruda.** Item de flex ou grid estica até a altura da linha (`align-items: stretch`), então já ocupa todo o espaço e não tem para onde grudar. Pôr `align-self: start` no item `sticky`.
- **Teclado cobrindo a barra fixa.** Quando o teclado abre, a área visível encolhe, mas o `bottom: 0` de um elemento fixo continua contando pela tela inteira em boa parte dos navegadores: a barra com o botão de enviar fica atrás do teclado ou flutua no meio. Verificar toda barra de ação no rodapé com o teclado aberto. A correção barata é a opção `interactiveWidget: "resizes-content"` no `viewport` do Next, que faz o teclado encolher o layout no Chrome do Android como já acontece no iOS (mudança global: regra 6). Só se não bastar, medir com `window.visualViewport` e expor a altura do teclado numa variável CSS.
- **Celular deitado passa no breakpoint de desktop.** Deitado, o celular tem 700 a 950px de largura e só 320 a 430px de altura. Um `@media (min-width: …)` sozinho entrega a ele o layout de desktop (NavigationRail, Dialog centralizado) numa altura de celular: item cortado no fim de coluna que não rola, painel sem espaço útil. Conferir cada breakpoint de largura também com o aparelho deitado. A correção (rolagem no container, `min-height` ou `(pointer: coarse)` na consulta) muda o layout: se a spec não cobre o caso, é leitura para o Gabriel ou Needs Decision, não ajuste silencioso.

### 12. Testar em aparelho

Nada acima aparece na emulação do DevTools.

- Build de produção: `npm run build && npm start`, aberto pelo IP da máquina na rede local (`http://<IP>:3000`). Em `npm run dev` o React não hidrata no iOS (hurdle "iOS Chrome/Safari: React não hidrata em `next dev`" do `CLAUDE.md`), e um handler parece quebrado sem estar. O Storybook também abre pela rede (`npm run storybook`).
- iOS: Safari > Desenvolver > o aparelho. Android: `chrome://inspect`.
- Testar com o teclado aberto, uma vez na horizontal e, se der, num aparelho de alguns anos.
- Agente na nuvem não tem celular: listar no PR, em "Como testar", o que o Gabriel precisa conferir no aparelho.

## Nunca entregar

<table>
<thead><tr><th>Nunca</th><th>Em vez disso</th></tr></thead>
<tbody>
<tr><td><code>userScalable: false</code> ou <code>maximumScale: 1</code></td><td>Texto digitado com 16px</td></tr>
<tr><td><code>:hover</code> fora de <code>@media (hover: hover)</code></td><td>Dentro da media query</td></tr>
<tr><td><code>transform: scale()</code> no <code>:active</code></td><td>State layer <code>--color-state-layer-pressed</code></td></tr>
<tr><td><code>100vh</code> em shell, sheet ou barra no rodapé</td><td><code>100dvh</code></td></tr>
<tr><td>Retorno só no <code>click</code></td><td><code>:active</code> ou <code>pointerdown</code></td></tr>
<tr><td><code>touchmove</code> + <code>preventDefault()</code> contra overscroll</td><td><code>overscroll-behavior: contain</code></td></tr>
<tr><td><code>overscroll-behavior: none</code> no <code>html</code> sem decisão</td><td>Needs Decision</td></tr>
<tr><td><code>user-select: none</code> no <code>body</code> ou em conteúdo</td><td>Só nos controles</td></tr>
<tr><td><code>touch-action: none</code> no que o jogador precisa rolar</td><td><code>pan-x</code> / <code>pan-y</code></td></tr>
<tr><td><code>env(safe-area-inset-*)</code> sem fallback dentro de <code>calc()</code></td><td><code>env(..., 0px)</code></td></tr>
<tr><td><code>overflow: hidden</code> acima de um <code>sticky</code></td><td><code>overflow: clip</code></td></tr>
<tr><td>User agent para detectar toque</td><td><code>(hover)</code> / <code>(pointer)</code></td></tr>
<tr><td>"Corrigido" visto só na emulação</td><td>Aparelho de verdade</td></tr>
</tbody>
</table>

## Saída

Nada de arquivo de relatório no repo e nada de abrir navegador. Duas situações:

**Construindo ou corrigindo:** aplicar as correções no escopo da issue. Depois, em poucas linhas no resumo ou no PR:

- **o que estava errado:** o sintoma da tabela e o porquê em uma linha;
- **o que mudou:** arquivo e declaração, uma linha cada;
- **o que precisa de aparelho:** o que foi verificado pelo código e o que o Gabriel confere no celular.

**Revisando:** um achado por linha, em `arquivo:linha — sintoma — correção`, com a seção desta skill. Separar em três grupos: **achados**, **problemas conhecidos** (já numa issue, citada pelo nome) e **verificado sem achado** (o que foi olhado e está certo, para mostrar a cobertura). Por último, o que precisa de aparelho. Sem achado, dizer isso: não inventar defeito para preencher a lista.

Tom: direto e curto. A maior parte é uma linha; dizer a linha e o porquê. Quando a resposta honesta é "não dá para verificar sem um celular", dizer isso em vez de afirmar que está corrigido.

## Origem e licença

Adaptada da skill `mobile-native` de [`emilkowalski/skills`](https://github.com/emilkowalski/skills/tree/d16ebe60d09a5ba2afcb7054ede9d0a10c9f6128/skills/mobile-native), commit `d16ebe60d09a5ba2afcb7054ede9d0a10c9f6128`. MIT © 2026 Emil Kowalski; o texto da licença está em `LICENSE.md`, nesta pasta.

O que mudou em relação ao original: tradução para o português; sem o bloco "Initial Response" e sem a nota sobre Tailwind; zoom pela decisão D1 (16px em todo texto digitado); press pelo state layer, sem escala (D3); hover em `(hover: hover)`, com `(pointer: fine)` como proposta; `theme-color` sem variante escura; `overscroll-behavior: none` no `html` como pergunta de produto, não padrão; cruzamento com os hurdles do `CLAUDE.md` e os tokens do `docs/TOKENS.md`; a seção 11 é nova.

As quatro primeiras armadilhas da seção 11 foram escritas com palavras próprias, usando como referência a lista de armadilhas da [`kylezantos/responsive-craft`](https://github.com/kylezantos/responsive-craft/tree/4863701762d243d0517b38cb36473b9a70861b72), commit `4863701762d243d0517b38cb36473b9a70861b72`. Nenhum trecho foi copiado: o repositório declara MIT só no README, sem arquivo de licença.

Decisões D1 e D3: documento "Avaliação de skills de mercado" no Linear, seção 10.
