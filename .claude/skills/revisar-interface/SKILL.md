---
name: revisar-interface
description: Revisa código de interface (componentes, telas, CSS Modules) contra um checklist de acessibilidade, formulários, conteúdo, toque e performance, com achados em file:line. Use quando receber "/revisar-interface <arquivos ou padrão>".
disable-model-invocation: true
argument-hint: <arquivo, pasta ou padrão>
---

# /revisar-interface

Revisão de interface com achados em `file:line`, adaptada das Web Interface Guidelines da Vercel para o LetzPlay (ver "Origem e licença" no fim). Argumento: os arquivos, a pasta ou o padrão a revisar (ex.: `src/components/ui/FormInput`, `app/(auth)/entrar/page.tsx`). Sem argumento, revisar os arquivos de UI do diff contra o `master` (`git diff --name-only origin/master...HEAD -- '*.tsx' '*.css'`).

A saída vai para a conversa, e de lá para o PR ou o comentário no Linear. Nada de arquivo de relatório gravado no repo, nada de abrir navegador, nada de buscar regras pela rede: o checklist é este arquivo, fixado numa versão revisada.

## Como revisar

1. **Ler os arquivos inteiros**, o `.tsx` e o `.module.css` de cada componente ou tela do argumento. Quando o problema pode estar resolvido em outro lugar (o componente filho já tem `aria-label`, o token já tem o valor certo, o layout já trata a safe area), abrir esse lugar antes de apontar.
   - **Escopo:** os arquivos do argumento são os revisados e ganham seção na saída. Componentes do DS que uma tela usa, consumidores de um componente e o `reset.css` são lugares de consulta, não de revisão.
   - **Decisão já tomada:** o `.mdx` do componente (seção "Decisões de design") e os docs de `docs/` contam como fonte. Antes de apontar algo que parece escolha deliberada, conferir lá.
   - **Onde o achado mora:** no arquivo onde a correção entra. Se a tela não consegue corrigir porque falta prop no componente do DS (ex.: o FormInput não repassa `spellCheck`), o achado aponta para o componente, citando o consumidor que sofre com isso. Arquivo fora do escopo que recebe a correção ganha seção própria na saída.
   - **Regra que vale para todo controle** (`-webkit-tap-highlight-color`, `touch-action`): se nenhum lugar global trata, um achado só, apontando para `styles/reset.css`, e não um por componente.
2. **Passar o checklist abaixo** seção por seção. As regras de foco, tap target, cor e tipografia do DS moram no `docs/TOKENS.md`: ler as seções "Regras fundamentais", "Acessibilidade — tap target" e "Acessibilidade — foco" antes de julgar esses temas, em vez de confiar em valores de memória.
3. **Aplicar a regra de prova** a cada candidato a achado (próxima seção).
4. **Escrever a saída** no formato do fim.

### Regra de prova

Achado sem evidência no código não entra. Cada achado precisa de:

- **o trecho que viola**, numa linha que existe no arquivo (o `file:line` aponta para ela);
- **a regra violada**, do checklist, do `docs/TOKENS.md` ou do `CLAUDE.md`;
- **a correção**, concreta o bastante para outro agente aplicar.

Na dúvida, o candidato vai para "Considerados e rejeitados", com o motivo. É melhor nenhum achado do que um achado sem sustentação: um falso positivo custa uma rodada de revisão e ensina a ignorar a skill. "Pode ser que…", "vale verificar…" e "considere…" sem trecho que viole não são achados.

Também não são achados:

- o que o DS decidiu de propósito (ver "Decisões do DS que valem aqui");
- o que já está documentado como hurdle ou stub no `CLAUDE.md` (ex.: "Componentes com stubs sem comportamento");
- os problemas conhecidos listados abaixo.

**Fora do checklist.** Um problema real que nenhuma regra cobre (bug de estado, id duplicado, controle que continua ativo com o campo desabilitado) não vai para os rejeitados, onde ficaria escondido. Vai para "Fora do checklist", com a mesma exigência de prova: trecho, cenário concreto em que quebra e correção. Sem cenário concreto, é rejeitado.

### Problemas conhecidos

Não reportar como achado novo. Se o escopo revisado esbarrar no problema, citar uma linha em "Problemas conhecidos" na saída, apontando para o `app/layout.tsx` mesmo que ele esteja fora do escopo.

- **Zoom desligado.** Enquanto o `app/layout.tsx` tiver `maximumScale: 1` e `userScalable: false`, o app viola a regra "nunca desabilitar o zoom" (WCAG 1.4.4). A correção já tem issue (ENG-152, liberar o zoom e passar o texto dos inputs para 16px). Vale também para o texto digitado em `input`, `textarea` e `select` abaixo de 16px, que é a causa do zoom desligado. Quando o `layout.tsx` não tiver mais essas opções, este item deixa de valer, e a regra volta a ser achado comum.

## Decisões do DS que valem aqui

As fontes de mercado divergem destas decisões; aqui vale o DS.

- **Contraste por WCAG 2.1 AA:** 4,5:1 para texto normal, 3:1 para texto grande e para o que não é texto (borda de campo, ícone com significado, foco). Não usar APCA como critério de achado.
- **Press só com state layer** (`::after` com `--color-state-layer-pressed`), sem `transform: scale(…)`. Escala no press é achado.
- **Cards chapados:** sem borda e sem sombra. Sombra (`--shadow-subtle`, `--shadow-strong`) só no que flutua (linha fixada, Toast, Dialog). Sombra em card é achado.
- **Área tocável de 48px** em todo botão, inclusive o só de ícone (`--dimension-tap-target-minimum`). Mais rígido que os 44px das fontes.
- **Cor e tipografia sempre por token semântico** (`--color-background-*`, `--color-foreground-*`, `--color-border-*`, `--text-*`). Paleta (`--color-coral-500`), `--font-size-*`, valor bruto de cor ou `px` de fonte no componente é achado.
- **Seleção em grafite, ação em coral** e **desabilitado mantém a forma** (`docs/TOKENS.md` > "Regras fundamentais").
- **Caixa de frase** em títulos, botões e rótulos ("Salvar placar", não "Salvar Placar"). Title Case é achado.

## Checklist

### Acessibilidade

- Botão só de ícone tem `aria-label` no `<button>`, não no `<Icon>`.
- Todo controle de formulário tem `<label>` (com `htmlFor` ou envolvendo o controle) ou `aria-label`.
- Ação é `<button>`; navegação é `<a>` ou `<Link>`. `<div onClick>` e `<span onClick>` são achado.
- Elemento interativo que não é nativo (raro, e precisa de motivo) tem `role`, `tabIndex` e handler de teclado.
- Imagem tem `alt` (`alt=""` se decorativa).
- Ícone decorativo fica `aria-hidden` (o `<Icon />` já faz por padrão); ícone com significado tem `aria-label` e `aria-hidden={false}` (`CLAUDE.md` > "Ícones").
- Atualização assíncrona (toast, validação, contador) é anunciada: `aria-live="polite"` ou `role="status"`/`role="alert"`.
- Erro de campo ligado ao campo por `aria-describedby`, com `aria-invalid` quando inválido.
- HTML semântico antes de ARIA (`<button>`, `<a>`, `<label>`, `<table>`, `<nav>`, `<main>`).
- Títulos em hierarquia (`<h1>` a `<h6>`, sem pular nível), um `<h1>` por tela.
- Âncora de título tem `scroll-margin-top` quando há cabeçalho fixo.
- Mídia com significado tem legenda ou descrição; mídia decorativa fica fora da árvore de acessibilidade.

### Foco

- Todo elemento interativo tem foco visível em `:focus-visible`, no estilo do DS (`docs/TOKENS.md` > "Acessibilidade — foco").
- `outline: none` só com substituto em `:focus-visible`. Campo de texto nunca zera o outline em `:focus`.
- `:focus-visible` em vez de `:focus` para o ring (sem ring no clique).
- Controle composto agrupa o foco com `:focus-within` quando faz sentido.
- Cabeçalho, barra ou overlay fixos não cobrem o elemento focado (`scroll-padding`/`scroll-margin`).
- Sobre fundo forte ou colorido, o ring usa a variante `*-on-strong`.

### Formulários

- Campo tem `name` com significado e `autoComplete` correto (`email`, `current-password`, `new-password`, `one-time-code`, `tel`…).
- `type` e `inputMode` certos (`email`, `tel`, `numeric`…), para o teclado certo no celular.
- Colar nunca é bloqueado (`onPaste` com `preventDefault`).
- Corretor desligado em código e @username (`spellCheck={false}` e `autoCapitalize="none"`). `type="email"` já desliga corretor e capitalização nos navegadores; a regra pesa no `type="text"` que recebe e-mail, código ou @username.
- Checkbox e radio: rótulo e controle formam uma área tocável só, sem zona morta.
- O botão de envio fica habilitado até a requisição começar; durante ela, mostra carregando e bloqueia o segundo envio.
- Erro aparece junto do campo; no envio com erro, o foco vai para o primeiro campo inválido.
- Placeholder, quando existe, mostra um exemplo do formato (`ana@email.com`, `(11) 91234-5678`) ou é frase de convite terminada em `…` ("Buscar jogadores…"). Campo sem formato a exemplificar (senha) pode ficar sem placeholder; um placeholder que só repete o rótulo não é achado. Placeholder nunca substitui o rótulo.
- `autoComplete="off"` em campo que não é de auth, para o gerenciador de senha não se oferecer.
- Sair com alterações não salvas avisa antes (`beforeunload` ou guarda do roteador).

### Movimento

- Respeita `prefers-reduced-motion` (versão reduzida ou sem movimento). Transição só de cor não se move e não precisa da guarda.
- Movimento (posição, tamanho, entrada e saída) anima só `transform` e `opacity`. Transição de cor de estado (`background-color`, `border-color`, `color`) é permitida, com a propriedade listada.
- Nunca `transition: all`: as propriedades são listadas.
- Duração e curva vêm dos tokens `--motion-*`, não de valor solto.
- `transform-origin` coerente com o gatilho (o menu cresce a partir do botão).
- Em SVG, transformação num `<g>` com `transform-box: fill-box; transform-origin: center`.
- Animação interrompível: responde ao usuário no meio do caminho.
- Movimento automático de mais de 5 segundos ao lado de outro conteúdo tem como pausar ou esconder.

### Tipografia e copy

- Reticências com `…`, não `...`. Estado de carregamento termina com `…`: "Carregando…", "Salvando…", "Enviando…".
- Aspas curvas “ ” em texto de interface, não `"` reto.
- Espaço inseparável entre número e unidade ou entre partes que não podem quebrar: `10&nbsp;MB`, `R$&nbsp;50`, `6&nbsp;×&nbsp;4`.
- `font-variant-numeric: tabular-nums` em número que se compara (placar, posição, pontos, contagem).
- `text-wrap: balance` em títulos curtos e `text-wrap: pretty` em parágrafos, para evitar viúva.
- Caixa de frase (ver "Decisões do DS").
- Voz ativa e falando com o jogador ("Confirme o placar", não "O placar deverá ser confirmado").
- Número em algarismo em contagem ("3 jogos", não "três jogos").
- Rótulo de botão específico ("Salvar placar", "Enviar código"), não genérico ("Continuar", "OK") quando a ação tem nome.
- Mensagem de erro diz o que fazer, não só o que deu errado ("Senha incorreta. Tente de novo ou recupere a senha.").

### Conteúdo variável

- Container de texto trata conteúdo longo: `text-overflow: ellipsis`, `-webkit-line-clamp` ou `overflow-wrap: anywhere`.
- Filho de flex que precisa truncar tem `min-width: 0`.
- Estado vazio tratado: string ou lista vazia não renderiza UI quebrada. Lista vazia tem um próximo passo (`EmptyState`).
- Texto vindo do usuário (nome, @username, nome de competição): pensar no curto, no médio e no muito longo.
- Skeleton espelha o conteúdo final (mesmas alturas), para não pular quando carrega.

### Imagens

- Imagem com `width` e `height` explícitos (ou `next/image` com dimensões ou `fill` num container dimensionado), para não causar CLS.
- Abaixo da dobra: carregamento preguiçoso (`loading="lazy"`, padrão do `next/image`).
- Acima da dobra e crítica: `priority` (`next/image`) ou `fetchPriority="high"`.

### Performance

- Lista grande (mais de 50 itens) é virtualizada ou usa `content-visibility: auto`. Bibliotecas como `virtua` são exemplos, não recomendação: instalar dependência pede justificativa (`CLAUDE.md` > "Regras gerais").
- Nada de leitura de layout no render (`getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`).
- Leituras e escritas no DOM agrupadas, sem intercalar.
- Campo controlado barato por tecla; sem trabalho pesado no `onChange`.
- Fontes pelo `next/font` (já é o caso do Arimo); `<link rel="preconnect">` para domínio externo de asset, se houver.
- Vídeo curto em loop (`<video autoplay muted loop playsinline>`) em vez de GIF animado, com imagem parada de alternativa.

### Navegação e estado

- A URL reflete o estado que vale compartilhar ou voltar: filtro, aba, categoria, paginação (`searchParams`). Bibliotecas como `nuqs` são exemplo, não recomendação.
- Link é `<a>`/`<Link>`, para funcionar Cmd/Ctrl+clique e clique do meio.
- Ação destrutiva pede confirmação (Dialog) ou dá janela de desfazer; nunca é imediata.
- Sem beco sem saída: toda tela tem como voltar ou seguir.

### Toque e interação

- `touch-action: manipulation` em controles tocáveis (evita o atraso do toque duplo).
- `-webkit-tap-highlight-color` definido de propósito.
- `overscroll-behavior: contain` em modal, drawer e sheet.
- Durante arraste: sem seleção de texto, `inert` no que está sendo arrastado.
- Gesto (arrastar, deslizar, pinça) tem alternativa por toque/clique e por teclado.
- `autoFocus` com parcimônia: só no desktop, num campo principal único; no celular, ele abre o teclado sem pedido.
- Regra `:hover` dentro de `@media (hover: hover)` (`CLAUDE.md` > "iOS: sticky hover").
- Hover, press e foco usam state layer e são mais visíveis que o repouso.

### Layout e safe areas

- Layout de borda a borda usa `env(safe-area-inset-*)` (o `viewportFit: "cover"` do `layout.tsx` depende disso).
- Sem barra de rolagem indesejada: o conteúdo não estoura a largura (430px de coluna, `--dimension-layout-max`).
- Flex e grid em vez de medir com JavaScript.

### Tema

- O app não tem modo escuro: não cobrar `color-scheme: dark`.
- `<select>` nativo com `background-color` e `color` explícitos.

### Locale

- Datas, horas e números com `Intl.DateTimeFormat`/`Intl.NumberFormat` em `pt-BR`, não formato montado à mão.
- Nome de marca, código e identificador com `translate="no"` quando a tradução automática estragaria.

### Hidratação

- Campo com `value` tem `onChange` (ou usa `defaultValue`).
- Data e hora renderizadas no servidor e no cliente não divergem (fuso, `Date.now()`).
- `suppressHydrationWarning` só onde é inevitável.

### Antipadrões (sempre achado)

- `user-scalable=no` ou `maximum-scale=1` (salvo o problema conhecido acima).
- `onPaste` com `preventDefault`.
- `transition: all`.
- `outline: none` sem substituto em `:focus-visible`.
- Navegação por `onClick` sem `<a>`/`<Link>`.
- `<div>` ou `<span>` com handler de clique.
- Imagem sem dimensões.
- Campo sem rótulo; botão só de ícone sem `aria-label`.
- Data ou número formatados à mão.
- `autoFocus` sem justificativa.
- Gesto sem alternativa por toque e teclado.
- Atributo `style=` (o `CLAUDE.md` proíbe CSS inline).
- Cor ou fonte fora dos tokens semânticos; escala no press; sombra em card.

## Saída

Agrupar por arquivo. Uma linha por achado: `file:line`, o problema e a correção, curtos. Explicar só quando a correção não é óbvia. Sem preâmbulo.

```text
## src/components/ui/Exemplo/Exemplo.tsx

src/components/ui/Exemplo/Exemplo.tsx:42 - botão só de ícone sem aria-label → aria-label="Fechar" no <button>
src/components/ui/Exemplo/Exemplo.tsx:67 - "Salvando..." → "Salvando…"

## src/components/ui/Exemplo/Exemplo.module.css

src/components/ui/Exemplo/Exemplo.module.css:18 - transition: all → transition: background-color var(--motion-duration-short-3) var(--motion-easing-standard)

## src/components/ui/Outro/Outro.tsx

✓ sem achados

## Problemas conhecidos

- app/layout.tsx:20 - zoom desligado e texto dos inputs em 14px (já tem issue)

## Fora do checklist

- Exemplo.tsx:88 - o botão interno continua focável com o campo desabilitado; com `disabled`, o Tab para nele e o clique muda o estado → repassar `disabled` ao <button>

## Considerados e rejeitados

- Outro.tsx:30 - <div onClick> parecia ação sem botão, mas o clique só repassa para o <input> interno, que é o controle real e já tem rótulo
- Exemplo.module.css:55 - coral-500 em texto passaria abaixo de 4,5:1, mas é a barra de progresso (não texto, 3:1 basta)
```

- **Achados**, por arquivo, na ordem das linhas. Arquivo sem achado aparece com `✓ sem achados`, para mostrar que foi lido.
- **Problemas conhecidos**: só se o escopo esbarrar num deles. Senão, a seção sai.
- **Fora do checklist**: só se houver. Senão, a seção sai.
- **Considerados e rejeitados**: o que pareceu achado e não passou na regra de prova, com o motivo. Sempre presente; se nada foi rejeitado, `Nenhum.` Ela mostra o que foi olhado e evita que a próxima revisão aponte o mesmo falso positivo.

## Origem e licença

Adaptada de [`vercel-labs/web-interface-guidelines`](https://github.com/vercel-labs/web-interface-guidelines), commit `e3d624baaf29dc1fc645aff3e38f03e564d2d6b1`, arquivo `command.md` (com o `README.md` como contexto). MIT © 2025 Vercel Labs; texto completo da licença em `LICENSE.md`, nesta pasta.

O que mudou em relação à fonte:

- traduzida e reescrita como checklist de revisão, com a regra de prova (inspirada na `improve-ui` da UI Skills), a seção "Considerados e rejeitados" (formato do Jakub Krehel) e a seção "Fora do checklist";
- sem busca das regras pela rede: o conteúdo fica fixado neste commit e só muda por PR;
- removidos o Title Case (usamos caixa de frase), o APCA (o DS usa WCAG 2.1 AA), a detecção de idioma e as regras de modo escuro;
- `nuqs` e `virtua` ficaram como exemplos, sem recomendação de instalar;
- foco, área tocável e tokens apontam para o `docs/TOKENS.md`, e entraram as decisões do DS (press, sombra, 48px, tokens semânticos);
- copy em pt-BR (`…`, "Salvando…", caixa de frase).
