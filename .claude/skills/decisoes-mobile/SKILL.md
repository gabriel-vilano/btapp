---
name: decisoes-mobile
description: Julgamento de design mobile por lentes nomeadas (Hoober, Hurff, Wroblewski, Clark, Rausch, Budiu, HIG/M3), com opções e trade-offs em vez de decisão silenciosa. Use em issue de PRD com tela, para planejar ou auditar uma tela no celular, e em perguntas de navegação, alcance do polegar, ação primária, sheet ou modal, formulário mobile e gesto. Não escreve código.
argument-hint: "[plan|audit] <tela ou issue>"
---

# /decisoes-mobile

Decide **qual padrão mobile serve e por quê**, não como codar. É o papel de *sparring* do `CLAUDE.md` ("O Gabriel decide; o Claude questiona") com fonte citada: cada achado vem atribuído a uma lente com nome, e cada escolha sem resposta única vira **fork** com 2 ou 3 opções, para o Gabriel decidir.

Dois modos:

- **Plan:** desenhar a experiência mobile de uma tela ou feature antes do código (tipicamente numa issue de PRD).
- **Audit:** revisar uma tela que já existe (código, story, print ou spec).

A skill não grava arquivo no repo, não abre navegador e não gera relatório HTML. A saída é texto para comentário no Linear ou para o corpo do PR.

## Contexto fixo do LetzPlay

Não pergunte o que já está aqui:

- **Plataforma:** web mobile-first (Next.js), aberta no navegador do celular, iOS e Android. Largura de referência de 393 a 430px; tab bar abaixo de 600px e navigation rail a partir dele (`docs/NAVIGATION.md`, N25 e N27).
- **Quem usa:** o jogador competitivo de Beach Tennis, muitas vezes na quadra, ao sol, entre um jogo e outro, com a atenção dividida. Uso alto durante a rodada, baixo entre competições.
- **Design system:** `docs/TOKENS.md`. Alvo de toque de **48px** em todo elemento interativo (mais rígido que os 44pt da Apple); seleção em grafite, ação em coral; press só com state layer, sem escala; cards chapados, sombra só para elevação; contraste por WCAG 2.1 AA; texto digitado em input com 16px.
- **Specs que já decidiram coisas** (regras numeradas por prefixo):

| Spec | Prefixo | Decide |
| --- | --- | --- |
| `docs/NAVIGATION.md` | N | abas, rotas, agenda (aba Jogos), cabeçalhos, estados, layout |
| `docs/SCHEDULING.md` | M | proposta de horário, prazos, telefone do WhatsApp |
| `docs/RESULTS.md` | RG | lançar, confirmar, contestar, fila do admin |
| `docs/PROFILE.md` | PF | perfil do jogador |
| `docs/RANKING.md` | RK | classificação, linha fixada, página da competição |
| `docs/EXPLORE.md` | EX | Explorar, busca, organização |
| `docs/HEAD_TO_HEAD.md` | HH | páginas de H2H |
| `docs/ROUND_DRAW.md` | SR | sorteio da rodada |
| `docs/DOMAIN.md` | R | regras de domínio |
| `docs/FEED_CARDS.md` | § | cards do feed |

## Regra central: não reabrir o que a spec decidiu

Antes de abrir qualquer fork, procure a decisão na spec da tela (e no `TOKENS.md` e no MDX do componente). Um `grep` pelo tema na pasta `docs/` costuma bastar.

O MDX do componente e o `TOKENS.md` contam como decisão escrita, tanto quanto a spec.

- **A spec decidiu e a skill concorda:** registre como "Já decidido" com a regra (ex.: "5 abas com rótulo, N1"). Não vira pergunta.
- **A spec decidiu e uma lente discorda:** vira **observação com fonte**, não fork. Diga a regra, o argumento contrário com a lente, e o sinal que justificaria reabrir (dado do beta, métrica da spec). Quem reabre é o Gabriel.
- **A spec não decidiu:** aí é fork.

O motivo: as specs já passaram por rodadas de decisão com o Gabriel. Uma auditoria que repergunta o que está resolvido gasta a atenção dele e dilui as perguntas que importam.

## As lentes

Oito lentes, cada uma com posição própria. O peso depende do assunto da tela (tabela em `references/designer-lenses.md`, que se lê no início dos dois modos).

| Lente | Voz | Lidera quando o assunto é… |
| --- | --- | --- |
| Realista ergonômico | Steven Hoober | alcance, posição de ação, pega |
| Mapa do polegar | Scott Hurff | custo de cada zona da tela, telas grandes |
| Foco forçado | Luke Wroblewski | prioridade de conteúdo, formulários |
| Manipulação direta | Josh Clark | modelo de toque, gesto × controle visível |
| Taxonomia de navegação | Frank Rausch | estrutura de navegação, modal, sheet |
| Cético empírico | Raluca Budiu / NN/g | varredura, sobreposição de camadas, mitos |
| Ofício moderno | Andy Allen / Sebastiaan de With / Gavin Nelson | movimento, sensação nativa, densidade |
| Cânone de plataforma | Apple HIG / Material 3 | convenções, gestos reservados ao sistema |

## Roteamento

| Modo | Ler | Carregar já |
| --- | --- | --- |
| Plan | `workflows/plan.md` | `references/designer-lenses.md` |
| Audit | `workflows/audit.md` | `references/designer-lenses.md` |

Detecção: "auditar", "revisar", "avaliar", "está bom?" → Audit. "Planejar", "desenhar", "como deveria funcionar", issue de PRD com tela nova → Plan. Ambíguo numa conversa → pergunte; numa sessão autônoma → escolha pelo estado da tela (existe código ou story → Audit).

Referências sob demanda:

- `references/reach-and-ergonomics.md`: posição de ações, alcance, uso com uma mão.
- `references/navigation.md`: tab bar, drawer, sheet, modal, tela cheia.
- `references/forms-and-input.md`: qualquer tela com campo.
- `references/touch-gesture-motion.md`: alvo de toque, gesto, transição.
- `references/content-and-attention.md`: prioridade, varredura, estados vazio, carregando e erro.
- `references/design-forks.md`: os 9 forks recorrentes, com sinais.

## Saída

Todo fork sai no formato **Needs Decision** do `docs/AGENT_WORKFLOW.md`, pronto para virar comentário no Linear:

```
**Decisão necessária:** <pergunta em uma linha>

**Contexto:** <o que motivou, com a lente que levantou>

**Opções:**
1. <opção> — <trade-off>
2. <opção> — <trade-off>

**Recomendação:** <opção e por quê, com o sinal que a sustenta>
```

No máximo dois forks por vez numa conversa. Numa sessão autônoma, todos no mesmo comentário, do mais caro de refazer ao mais barato. O formato completo de cada modo está no workflow.

## Armadilhas: onde o Claude erra em design mobile

As falhas são de julgamento, não de código. Confira cada recomendação contra esta lista.

1. **Hambúrguer porque "fica limpo".** Navegação escondida é pouco achada; a tab bar expõe os destinos. O LetzPlay já decidiu isso (N1, N5).
2. **Ação primária no topo.** Hábito de desktop. O topo é a zona mais cara do polegar.
3. **Projetar para a pega média.** Não existe pega média. Acomode a mais restrita.
4. **Bottom sheet como destino de navegação.** Sheet é para tarefa curta, com o fundo ainda relevante. Nunca empilhar sheets.
5. **Gesto sem pista visível.** Swipe que ninguém vê é recurso de especialista. Precisa de convenção, pista ou alternativa visível.
6. **Formulário em duas colunas e placeholder como rótulo.** No celular, coluna única e rótulo sempre visível.
7. **Movimento como acabamento final.** Transição decidida depois do layout não comunica de onde as coisas vêm.
8. **Densidade de desktop no celular.** Encolher não é priorizar. Algo precisa ser cortado ou adiado.
9. **"Mobile" sem plataforma.** O LetzPlay é web nos dois sistemas: não assuma padrões só do iOS (swipe para voltar, detents de sheet) e marque o que difere no Android.
10. **Otimizar para a tela da vitrine.** Projete para o uso real: uma mão, teclado aberto, interrompido, ao sol.
11. **Reabrir decisão de spec.** Ver "Regra central".

## Origem e licença

Adaptado de `skills/thumb-first-design/` em [kylezantos/thumb-first](https://github.com/kylezantos/thumb-first), commit `8048c78a91a92ef7e718f772380c3580dd8858b8`, MIT © 2026 Kyle Zantos. Texto completo da licença em `LICENSE.md`.

O que mudou em relação à fonte: tradução para o português; só os modos Plan e Audit; sem relatório HTML (`report-template.html` e `output-format.md` ficaram de fora), sem gravar `mobile-audits/` e sem abrir navegador; saída no formato Needs Decision; checagem contra as specs do LetzPlay antes de abrir fork; alvo de toque de 48px; dados de pega marcados como de 2013; referências encurtadas e sem as indicações para skills que não temos.
