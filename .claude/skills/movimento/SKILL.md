---
name: movimento
description: Cria animação e transição no DS do LetzPlay pela ordem certa — se anima, o propósito, as propriedades, o token de curva e duração, a interrupção e o movimento reduzido. Use ao animar, adicionar transição ou mexer em motion de componente. O modo revisar roda só por comando, "/movimento revisar <alvo>".
argument-hint: "[revisar] <alvo>"
---

# /movimento

Motion do LetzPlay em dois modos, com a régua das regras de motion do Emil Kowalski, que o DS adotou (decisão D2; `docs/TOKENS.md` > "Motion: regras"). Origem e licença no fim.

- **Criar** (padrão): transforma um pedido de movimento em CSS que passa no modo revisar de primeira. Dispara sozinho quando a tarefa é animar algo.
- **Revisar**: mede motion existente contra os padrões e fecha com **Bloquear** ou **Aprovar**. Roda **só** quando chamado explicitamente: `/movimento revisar <arquivos, pasta ou componente>`. Sem alvo, revisar os `.module.css` e `.tsx` do diff contra o `master` (`git diff --name-only origin/master...HEAD -- '*.css' '*.tsx'`). Nunca entrar no modo revisar por iniciativa própria, nem no meio do modo criar: a revisão é um portão que o Gabriel ou a `/pegar-issue` decidem abrir.

Fica fora daqui: comportamento de plataforma no celular (hover preso, `dvh`, safe area, toque), que é da `mobile-nativo`, e polimento visual que não é movimento, da `polir-interface`.

A saída vai para a conversa e, de lá, para o PR ou o comentário no Linear. Nada de arquivo de relatório no repo, nada de abrir navegador, nada de instalar lib.

## Referências desta pasta

- [PADROES.md](PADROES.md): a régua compartilhada pelos dois modos. Frequência, propósitos, **mapa de curvas e durações para os tokens `--motion-*`**, propriedades e etapas de renderização, interrupção, gestos, acessibilidade e a lista de gatilhos de alerta. Ler sempre que precisar de um valor exato ou de uma citação.
- [RECEITAS.md](RECEITAS.md): receitas prontas (press, dropdown, tooltip, Dialog, sheet, Toast, acordeão, stagger, segurar para confirmar, indicador de aba, arrastar para fechar, crossfade, WAAPI), já nos tokens do DS. Ler quando o pedido bate com uma delas e partir dela, não do zero.

## Regras firmes

Valem nos dois modos.

1. **Tokens do DS, nunca valores soltos.** Toda curva e duração vem de um `--motion-*` (mapa em PADROES.md > "Curvas" e "Durações"). Se nenhum token serve, propor o token novo em `styles/tokens/primitives.css` e na tabela do `docs/TOKENS.md` no mesmo PR, e não escrever o valor cru. A regra é do próprio Emil: estender os tokens do projeto, não criar um sistema paralelo.
2. **Press é só state layer, sem escala** (decisão D3). O `:active` escurece o `::after` com `--color-state-layer-pressed` (`docs/TOKENS.md` > "State layers"). `transform: scale(...)` no `:active` é defeito, e a ausência de escala não é achado.
3. **Hover dentro de `@media (hover: hover)`**, o padrão do DS (hurdle "iOS: sticky hover" do `CLAUDE.md`). Não exigir `and (pointer: fine)`: o Emil pede, o DS ainda não adotou.
4. **Só CSS, transição antes de keyframes.** A ferramenta mais barata que resolve: transição, `@starting-style`, animação CSS, WAAPI. Nunca instalar Motion (`motion.dev`) nem outra lib de animação. Spring só em CSS, com `linear()`; se não couber, fica fora do escopo e vira comentário na issue.
5. **Sem Base UI.** Não existe `var(--transform-origin)` aqui: a origem é fixada por componente, no lado em que o painel nasce do gatilho (`transform-origin: top center` num menu que abre para baixo).
6. **Movimento reduzido e hover chegam junto com a animação**, nunca depois. Reduzido é mais suave, e não zero: tirar o deslocamento e manter o esmaecimento.
7. **Decisão registrada não é achado.** Antes de apontar, procurar o motivo no comentário do CSS, no `docs/TOKENS.md` e no MDX do componente. Se a escolha está justificada e o motivo se sustenta contra os padrões, ela vai para "verificado sem achado", com a citação. Se o motivo não se sustenta, o achado cita o motivo e diz por que ele não vale.
8. **Cor que se anima termina num par que passa no WCAG 2.1 AA** (decisão D5), como qualquer cor do DS.

## Modo criar

Postura: design engineer sênior que constrói a animação. Dois erros, e o primeiro é pior: **animar o que não deveria animar** (o passo 1 existe para produzir zero linhas de código às vezes, e isso é sucesso) e **animar a coisa certa com o ingrediente errado** (ease-in na entrada, `scale(0)`, keyframes num toast, duração que deixa o menu lento).

Não apresentar menu de opções de movimento: decidir, dar o motivo em uma linha e escrever o código. A exceção é a decisão de produto (animar ou não um momento de deleite, por exemplo o resultado confirmado): essa é do Gabriel, e vira pergunta.

Seguir a sequência na ordem. Os passos 1 e 2 decidem tudo: não escolher curva antes de saber se anima.

1. **Deve animar?** Classificar pela frequência (PADROES.md > "Frequência"). Ação de teclado ou 100+ vezes por dia não anima, e ponto. Se o pedido cai aqui, dizer isso com franqueza e oferecer a alternativa sem movimento (troca de estado instantânea, um sinal estático).
2. **Para quê?** Nomear o propósito numa palavra da lista (PADROES.md > "Propósitos"). Sem nome, não anima. Conferir também a função: dado que o jogador está lendo ou usando (placar, posição no ranking) não se move por estilo.
3. **Ferramenta.** A mais barata que resolve (PADROES.md > "Ferramenta"). Se o pedido é um *componente* (menu, sheet, toast), conferir antes se o DS já tem: `src/components/ui/` tem Dialog (também sheet) e Toast. Não refazer à mão.
4. **Propriedades.** `transform` e `opacity`; `clip-path` como quarta; `height` só em acordeão. Nunca `scale(0)`; parte de `scale(0.9–0.97)` com `opacity: 0`. Origem no gatilho, fixada por componente. Percentual no `translate()`. Detalhes e as etapas de renderização em PADROES.md > "Propriedades".
5. **Curva e duração.** Pelos tokens (PADROES.md > "Curvas" e "Durações"). Nunca ease-in em UI. UI abaixo de 300ms; Dialog e sheet até 500ms.
6. **Interrupção e saída.** Transição, e não keyframes, no que se dispara rápido ou empilha. Sair pelo caminho de entrada. Tempo assimétrico onde o jogador decide (PADROES.md > "Interrupção").
7. **Movimento reduzido e hover.** Na mesma entrega (PADROES.md > "Acessibilidade").

Antes de terminar, passar o resultado pela lista de **gatilhos de alerta** (PADROES.md): cada um é um Bloquear automático no modo revisar.

**Saída do modo criar.** O código é a entrega. Depois dele, no máximo umas linhas:

- **o gate:** a faixa de frequência e o propósito nomeado; se algo do pedido foi recusado, o quê e por quê;
- **os ingredientes:** ferramenta, propriedades, token de curva, token de duração, uma linha cada;
- **o que conferir no olho:** quando o resultado depende de sensação que o código não mostra (um crossfade, a altura de uma lista que entra), dizer qual story abrir e como olhar: DevTools › Animations em 10% ou 25% da velocidade, quadro a quadro, no celular de verdade, e de novo no dia seguinte. Agente sem navegador diz o que verificou pelo código e o que fica para o Gabriel.

## Modo revisar

Postura: olho rígido para o acabamento. A animação que "funciona", mas arrasta, nasce do lugar errado, dispara demais ou perde quadros é regressão, e não aprovação. O padrão é apontar; aprovar se conquista. Mas achado sem prova não entra: cada um cita `arquivo:linha`, o padrão violado e o valor certo, tirado de PADROES.md. Prefira nenhum achado a um achado sem sustentação.

**Os dez padrões.** Cada animação do alvo é medida contra eles; violação é achado.

1. **Movimento justificado.** Responde "por que anima?" com um propósito da lista.
2. **Adequado à frequência.** Teclado e 100+ por dia: nenhuma animação. Dezenas por dia: quase imperceptível.
3. **Curva que responde.** Entrada e saída ease-out (`quick-enter`, `soft-enter`, `quick-exit`). Ease-in em UI bloqueia.
4. **UI abaixo de 300ms.** Acima disso precisa de motivo (Dialog e sheet até 500ms; loops fora).
5. **Origem e física.** Popover, menu e tooltip crescem do gatilho; Dialog centralizado e sheet são exceção. Nunca `scale(0)`.
6. **Interruptível.** O que se dispara rápido ou se arrasta (toast, toggle, arraste) usa transição ou retoma de onde está; keyframe recomeça do zero.
7. **Só composição.** `transform` e `opacity`. Animar `width`, `height`, `margin`, `padding`, `top` ou `left` é achado de performance. O state layer (`background-color` num `::after` pequeno) é a exceção sancionada do DS (PADROES.md > "Propriedades").
8. **Acessibilidade.** `prefers-reduced-motion` respeitado, mais suave e não zero; hover em `@media (hover: hover)`.
9. **Entrada e saída assimétricas** onde o jogador decide (segurar, confirmar algo destrutivo): fase deliberada lenta, resposta do sistema rápida.
10. **Coesão.** O movimento combina com a personalidade do componente e do produto: o LetzPlay é ferramenta de competição, então movimento seco e rápido. Na dúvida se o movimento está certo, o melhor é muitas vezes apagá-lo.

**Hierarquia de correção.** Ao propor a correção, preferir a mais alta da lista:

1. **Apagar** a animação (alta frequência, sem propósito, disparada por teclado).
2. **Reduzir:** duração menor, deslocamento menor, menos propriedades.
3. **Corrigir a curva:** ease-in → token ease-out.
4. **Corrigir origem e física:** `transform-origin` no gatilho; `scale(0)` → `scale(0.95)` com `opacity`.
5. **Tornar interruptível:** keyframes → transição.
6. **Levar para a composição:** propriedade de layout → `transform`/`opacity`; WAAPI se precisa de JS.
7. **Tempo assimétrico:** fase deliberada lenta, resposta rápida.
8. **Polir:** blur para mascarar crossfade, stagger, `@starting-style` na entrada.
9. **Acessibilidade e coesão:** movimento reduzido, `@media (hover: hover)`, ajuste à personalidade.

**Formato da saída.** Sempre nesta ordem.

**1. Achados.** Uma tabela, uma linha por achado. Nunca lista de "Antes:/Depois:".

| Onde | Antes | Depois | Por quê |
| --- | --- | --- | --- |
| `Menu.module.css:12` | `transition: all 300ms` | `transition: opacity var(--motion-duration-short-3) var(--motion-easing-quick-enter), transform …` | `all` anima propriedades sem querer, fora da composição |
| `Menu.module.css:20` | `transform-origin: center` | `transform-origin: top center` | o menu abre para baixo do botão; cresce de onde nasceu |

Sem achado, escrever "Nenhum achado." no lugar da tabela.

**2. Veredito.** O comentário restante agrupado por impacto, do maior para o menor, omitindo os grupos vazios:

1. **Quebra a sensação:** curva lenta, surge do nada, anima ação de alta frequência ou de teclado.
2. **Simplificação perdida:** animação que devia sair ou encolher.
3. **Performance:** propriedade fora da composição, risco de perder quadros, recálculo em cascata.
4. **Interrupção e tempo:** keyframes onde cabe transição; tempo simétrico onde devia ser assimétrico.
5. **Origem, física e coesão:** origem errada, personalidade destoante, crossfade brusco.
6. **Acessibilidade:** movimento reduzido e hover.

Depois, **Verificado sem achado**: o que foi olhado e está certo, em uma linha cada, com as decisões registradas citadas (regra firme 7). Mostra a cobertura, e é aqui que entram os "considerados e rejeitados".

Fechar com a decisão explícita, em negrito:

- **Bloquear:** qualquer quebra de sensação, animação em ação de teclado ou alta frequência, `scale(0)` ou ease-in em UI, `scale` no `:active`, ou animação fora da composição com correção fácil.
- **Aprovar:** sem quebra de sensação, nada que devia ser apagado, curvas e durações nos tokens e dentro dos limites, interrupção tratada onde precisa, movimento reduzido respeitado.

Quando a sensação não dá para julgar pelo código, recomendar o olho em câmera lenta e no dia seguinte (PADROES.md > "Depuração") em vez de chutar um valor.

## Tom

Opinião forte e curta. Quando a resposta honesta é "isto não deveria animar", dizer isso: é por essa resposta que a skill existe. Quando a sensação não se decide pelo código, dizer isso em vez de inventar um valor.

## Origem e licença

Adaptada de duas skills de [`emilkowalski/skills`](https://github.com/emilkowalski/skills/tree/d16ebe60d09a5ba2afcb7054ede9d0a10c9f6128), commit `d16ebe60d09a5ba2afcb7054ede9d0a10c9f6128`: `animate` (com o `RECIPES.md`), que virou o modo criar e o `RECEITAS.md`, e `review-animations` (com o `STANDARDS.md`), que virou o modo revisar. As tabelas das duas foram fundidas no `PADROES.md`. MIT © 2026 Emil Kowalski.

O glossário de etapas de renderização (composição, pintura, layout) e as regras de pintura, camadas e blur do `PADROES.md` vêm da skill `fixing-motion-performance` de [`ibelick/ui-skills`](https://github.com/ibelick/ui-skills/tree/ebf5f26cd275b1412be8a2c8784c4f8da628e7c2), commit `ebf5f26cd275b1412be8a2c8784c4f8da628e7c2`. MIT © 2026 Julien Thibeaut.

O texto da licença MIT, com o copyright das duas fontes, está em `LICENSE.md`, nesta pasta.

O que mudou em relação aos originais: tradução para o português; sem o bloco "Initial Response"; as duas skills fundidas numa só, com o modo revisar só por comando; curvas e durações trocadas pelos tokens `--motion-*` do DS; `var(--transform-origin)` (Base UI) trocado por origem fixada por componente; springs só em CSS (`linear()`), sem Motion; sem as indicações de `pick-ui-library`, `improve-animations`, `find-animation-opportunities` e `animate-expo`; press pelo state layer, sem escala (decisão D3), e por isso sem os gatilhos de "pressable sem scale"; hover em `@media (hover: hover)`, sem o `(pointer: fine)`; são novas a regra de decisão registrada (regra firme 7), a seção "Verificado sem achado" e, no `PADROES.md`, "o que está saindo não recebe toque" e "timer em JS lê a duração do token".

Decisões D2, D3 e D5: documento "Avaliação de skills de mercado" no Linear, seção 10.
