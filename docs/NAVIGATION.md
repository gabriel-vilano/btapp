# NAVIGATION.md — LetzPlay

Spec da navegação do app e da agenda do jogador (aba "Jogos"): quais abas existem, o que fica fora delas, como cada card do feed leva ao detalhe, como a agenda se organiza, como ela divide o trabalho com o bloco de pendências do feed, e o que mostram as abas Competições e Explorar.

> Este doc decide **onde as coisas moram e como se chega a elas**. O conteúdo de cada tela é da spec dela: ranking (`docs/RANKING.md`), perfil (`docs/PROFILE.md`), registro de partidas, H2H e feed com dados reais. As regras de domínio estão em `docs/DOMAIN.md` (R…) e as da marcação em `docs/SCHEDULING.md` (M…). As regras daqui são numeradas **N1, N2…** para não colidir com elas; os números já citados por outras specs não mudam, e as regras novas começam na N28. Rotas são propostas: o nome final é decisão de implementação, a estrutura (uma rota por entidade) não.

---

## Fontes

As siglas de decisão são as mesmas do `docs/DOMAIN.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DEC-JOGOS** | Aba "Jogos" como agenda do jogador; registro de resultado contextual, sem aba; volume de 2 a 8 jogos por mês |
| **DEC-NAV** | Decisões do Gabriel na issue das referências visuais (26/09): registrar resultado não vai na tab bar (a HIG reserva a tab bar para navegação); "Jogos" é destino, não ação; o feed abre com um bloco sobre o próprio jogador **só quando há ação**; ranking como lista completa com a linha da própria dupla fixada |
| **DEC-NAV-L** | Decisões do Gabriel na issue desta spec (26/09, ~23:37 UTC): leituras L1 e L3 a L9 confirmadas; **L2 rejeitada**: a aba de origem continua marcada ao abrir um detalhe (N10) |
| **DEC-NAV-Q** | Decisões do Gabriel na issue desta spec (29/09, ~18:20 UTC): Q1 a Q5. Cinco abas com Competições (as do jogador) e Explorar (descoberta e busca); a aba Competições abre na lista; Explorar enxuto no MVP; agenda por ação; admin dentro da competição; uma busca só, no Explorar, com três escopos |
| **SCHED** | `docs/SCHEDULING.md` §6: estados da marcação no confronto e quais entram nas pendências do feed |
| **RANK** | `docs/RANKING.md`: classificação (RK1), seletor de categoria dentro dela (RK6), página da competição (RK17) e StandingSummaryItem |
| **FEED** | `docs/FEED_CARDS.md`: cards, destinos de toque já previstos (H2H, perfil, "Comentar" leva ao detalhe) e §11.2 (descoberta de organizações fica numa tela de competições, não no feed) |
| **REF** | `docs/discovery/referencias/07-navegacao.md` (28 tab bars de apps de esporte e fitness), `06-descoberta-competicoes.md` e os arquivos de ranking e perfil |
| **DSC** | `docs/DISCOVERY.md`: JTBD 1 (encontrar competição), com evidência fraca para a oportunidade 1.2 |
| **HIG** | Apple Human Interface Guidelines, "Tab bars" (lido em 26/09/2026): "Use a tab bar to support navigation, not to provide actions"; "Make sure the tab bar is visible when people navigate to different sections of your app… The exception is when a modal view covers the tab bar"; "Reserve badges for critical information" |
| **M3** | Material Design 3, "Navigation bar" e "Navigation rail" (lidos em 25 e 26/09/2026): 3 a 5 destinos na barra; janelas compactas (abaixo de 600dp) "should always use a navigation bar"; o rail serve às janelas médias e maiores, com 3 a 7 destinos |
| **ARIA** | WAI-ARIA 1.2 e MDN `aria-current`: barra de rotas é `<nav>` com links, não o widget Tabs |
| **LEIT** | Leitura do agente desta spec. As da primeira versão foram respondidas (DEC-NAV-L); as novas, a confirmar, estão na seção 12 |

---

## 1. Princípio

**Cinco destinos, um lugar para cada coisa.** O problema 2 do audit do app atual é de arquitetura de informação: menu com 19+ itens, busca duplicada e perfil sobrecarregado (`CLAUDE.md`). A resposta desta spec é uma regra só, aplicada a tudo: **cada entidade tem uma rota, e cada ação tem uma casa**. Os atalhos (bloco de pendências, notificação, badge) levam até a casa; eles não viram uma segunda casa.

| Problema do audit | Como esta spec resolve |
| --- | --- |
| Menu com 19+ itens | 5 abas com rótulo e nenhum menu lateral nem aba "Mais" (N1, N5) |
| Busca duplicada | Uma busca, dentro do Explorar, e nenhuma lupa nas outras abas (N6) |
| Perfil sobrecarregado | Configurações e conta saem do perfil público para uma tela própria, atrás de um ícone (N8) |

---

## 2. Abas

- **N1. O app tem 5 abas, nesta ordem: Feed · Jogos · Competições · Explorar · Perfil.** Rótulo de uma palavra em todas; o Perfil usa o avatar do jogador no lugar do ícone. [DEC-NAV-Q Q1, REF, M3]

| Aba | O que é | JTBD | Rota proposta |
| --- | --- | --- | --- |
| **Feed** | Activity stream (`FEED_CARDS.md`), com o bloco "Sua vez" no topo quando há pendência (N20) | 4, 2 | `/feed` |
| **Jogos** | A agenda do jogador: o que fazer, o que vem, o que espera o outro lado e o histórico (seção 5) | 2, 3 | `/jogos` |
| **Competições** | As competições **do jogador**: os rankings e torneios em que ele está inscrito, com a posição de cada um (seção 6) | 2, 5 | `/competicoes` |
| **Explorar** | Descoberta de competições e arenas, e a busca do app (seção 7) | 1 | `/explorar` |
| **Perfil** | O próprio perfil (`PROFILE.md`) e a porta para as configurações | 5 | `/perfil` |

**Por que Competições e Explorar são abas separadas.** As duas falam de competição, mas respondem a perguntas diferentes: "onde eu estou nas competições que jogo?" (JTBD 2, uso semanal) e "o que existe para eu jogar?" (JTBD 1, uso raro, entre temporadas). Juntar as duas faria o jogador atravessar a vitrine para chegar à própria posição, ou esconderia a vitrine atrás da lista dele. "Competições" é o guarda-chuva do domínio para ranking e torneio (`DOMAIN.md`); os jogadores falam "ranking" e "torneio", e o rótulo foi escolha do Gabriel.

**Por que 5.** É o máximo do M3 e a contagem mais comum da amostra (19 de 28 apps, REF). Com 5, não sobra vaga: um destino novo entra dentro de uma aba existente, nunca como sexta aba.

- **N2. Registrar resultado e registrar amistoso não são abas.** São ações com casa própria (seção 5.4). [DEC-NAV, DEC-JOGOS, HIG]
- **N3. Duas abas têm badge, cada uma com um número só:** a aba **Jogos** conta as pendências "Sua vez" (5.1), e a aba **Competições** conta as pendências de admin, só para quem é admin de alguma competição (N30). Curtida, amizade e evento novo no feed não são críticos e não têm badge. [HIG, REF, DEC-NAV-Q Q3]
- **N4. A tab bar fica visível em todas as telas, inclusive nas de detalhe** (confronto, perfil de outro jogador, classificação, página da competição). Ela some só nos **fluxos modais de tarefa**: lançar resultado, registrar amistoso, propor horários, editar perfil e as decisões do admin, que abrem em tela cheia com "Fechar". [HIG, DEC-NAV-L L1]

  **Por quê:** a HIG diz que esconder a tab bar faz a pessoa esquecer em que área do app está, com a exceção do modal, que é "temporário e autocontido".

---

## 3. O que fica fora das abas

- **N5. Não existe menu lateral nem aba "Mais".** Nenhum dos 28 apps de esporte da amostra usa menu lateral como navegação principal, e a aba "Mais" com lista longa só muda o "19+ itens" de lugar (REF). [REF, HIG]
- **N6. A busca é uma só e mora no Explorar** (seção 7), com três escopos: **Jogadores · Competições · Arenas**. **Nenhuma outra aba tem lupa.** É a resposta direta à busca duplicada do audit. [DEC-NAV-Q Q5]
- **N7. As notificações ficam no sino, no topo do Feed** (rota proposta `/notificacoes`), com um ponto quando há não lidas. Cada notificação leva à tela da entidade (confronto, perfil, classificação, área de admin). Nenhum app da amostra usa notificação como aba (REF). O conteúdo e o canal são da spec de notificações básicas. [REF, DEC-NAV-Q Q5]
- **N8. Configurações e conta ficam atrás de uma engrenagem no topo do próprio Perfil** (rota proposta `/perfil/configuracoes`). A tela reúne: dados da conta (e-mail, senha), telefone para o WhatsApp com o consentimento e o apagamento (M20–M25), e, por último, **"Sair"**. Sair não pede confirmação: é reversível com um login. [REF (Strava, Peloton), `SCHEDULING.md` §7, DEC-NAV-L L8]
- **N9. A página da competição existe, mas não é aba** (rota proposta `/competicoes/[competicao]`). Chega-se a ela pela aba Competições, pelo Explorar, pelo cabeçalho dos cards do feed e pela tela do confronto. O conteúdo, no ranking, é da `RANKING.md` (RK17); no torneio, da spec que vier. **Para o admin da competição, a página tem a área "Administrar"** (N29), com tudo o que ele decide. [R15, RANK, DEC-NAV-Q Q3]

### Cabeçalho de cada aba

| Aba | Cabeçalho |
| --- | --- |
| Feed | Logo · sino (N7) |
| Jogos | Título "Jogos" · botão "Registrar amistoso" (N19) |
| Competições | Título "Competições" |
| Explorar | Título "Explorar" · campo de busca (N32) |
| Perfil | Título com o @username · engrenagem (N8) |

As telas de detalhe têm cabeçalho com "Voltar" e o título da entidade. O seletor de categoria fica dentro da classificação, não no cabeçalho da aba (`RANKING.md`, RK6).

---

## 4. Do feed ao detalhe

- **N10. Cada entidade tem uma rota, e todo caminho até ela mostra a mesma tela.** A partida é a mesma tela vinda do feed, da agenda, da notificação ou do perfil. O que muda é **quem vê**, não a tela: o jogador da partida vê as ações; os outros veem só a leitura pública. **A aba marcada é a de origem:** uma partida aberta pelo Feed mantém o Feed marcado, e "Voltar" leva de volta a ele, como no Strava e no Instagram. O custo de rotas que isso traz (cada aba com a própria pilha de telas) é aceito. [DEC-NAV-L L2]
- **N28. Quem chega sem aba de origem** (notificação, link externo, URL digitada) cai na aba dona do tipo da entidade: partida → Jogos; classificação e competição em que o jogador está inscrito → Competições; competição em que ele não está inscrito e arena → Explorar; jogador e H2H → Feed. [LEIT, L10]

| Entidade | Rota proposta | O jogador da partida (ou da competição) vê | Os outros veem |
| --- | --- | --- | --- |
| **Partida** (confronto, resultado, amistoso) | `/jogos/[partida]` | Marcação (SCHED §6), lançar, confirmar ou contestar, prazo, histórico da marcação | Lados, competição, data e arena acordadas (M18), placar confirmado, comentários |
| **Jogador** | `/jogadores/[username]` (o próprio: `/perfil`) | — | Perfil público (`PROFILE.md`) |
| **H2H** | Da spec de H2H | — | — |
| **Classificação de uma categoria** | `/ranking/[categoria]` | A linha da própria dupla fixada (RK9) | A tabela |
| **Competição** | `/competicoes/[competicao]` | A posição em cada categoria (RK17); para o admin, a área "Administrar" (N29) | Categorias, temporada, regras; no Explorar, "Como se inscrever" e "Tenho interesse" (N33) |
| **Arena** | `/arenas/[arena]` | — | Nome, cidade e as competições da arena (N34) |

A rota não carrega a aba: a mesma URL abre marcando a aba de origem quando vem de dentro do app, e a aba da N28 quando vem de fora.

### Destino de cada toque nos cards do feed

Completa o que o `FEED_CARDS.md` já previa (H2H, perfil e "Comentar" levam ao detalhe).

| Card | Toque no corpo | Cabeçalho (organização e competição) | Avatar ou nome | Outros |
| --- | --- | --- | --- | --- |
| **Resultado** | Partida | Classificação da categoria (ranking) ou competição (torneio); amistoso não tem cabeçalho de competição | Perfil do jogador | H2H → H2H. Comentar → partida, na seção de comentários |
| **Confronto definido** | Partida (com as ações, se o jogador for da partida) | Classificação da categoria ou competição | Perfil do jogador | H2H → H2H |
| **Inscrição** | Competição | Competição | Perfil do jogador | — |
| **Nova amizade** | — | — | Perfil do jogador (mini-card) | — |
| **Movimentação e marco** | Classificação da categoria, rolada até a linha da dupla | Classificação da categoria | Perfil do jogador | — |

- **N11. Card do feed não tem botão de ação da partida.** "Lançar resultado" e "Confirmar" moram na partida e aparecem no bloco "Sua vez" (N20). O card de confronto do próprio jogador leva à partida, onde as ações estão. [DEC-JOGOS, DEC-NAV]

---

## 5. Aba Jogos: a agenda

A agenda responde a quatro perguntas, nesta ordem: **o que eu preciso fazer, quando é meu próximo jogo, o que está com o outro lado e o que já joguei.** Cada pergunta é uma seção. **A agenda é só de jogador:** as pendências de admin moram na aba Competições (seção 6).

- **N12. A agenda tem 4 seções, nesta ordem: Sua vez · Próximos jogos · Aguardando · Histórico.** As 5 coisas que o `PRODUCT.md` lista cabem nelas: confrontos sorteados e pendências se distribuem pelo estado (tabela da 5.2), próximos jogos e histórico são seções, e o amistoso é um botão (N19), não uma seção. [`PRODUCT.md`, DOMAIN §4, DEC-NAV-Q Q2]
- **N13. Cada partida aparece em uma seção só.** Quando dois critérios valem, vence o primeiro da ordem: Sua vez > Próximos jogos > Aguardando > Histórico. Exemplo: um jogo marcado para sábado com uma remarcação do outro lado pendente está em "Sua vez", e não também em "Próximos jogos". [DEC-NAV-L L3]

  **Por quê:** a mesma partida em dois lugares da mesma tela obriga o jogador a descobrir se são dois jogos.
- **N14. A seção sem itens some**, e a tela só mostra o estado vazio quando todas somem (seção 9). A exceção é "Sua vez": sem itens, ela vira uma linha "Nada pendente", porque dizer "você está em dia" também é informação. [DEC-NAV-L L4]
- **N15. As seções não agrupam por competição.** O volume é de 2 a 8 jogos por mês (DEC-JOGOS), então a lista é curta, e cada item já diz competição, categoria e rodada. Agrupar por competição separaria duas pendências urgentes só por serem de rankings diferentes. [DEC-JOGOS, DEC-NAV-Q Q2]

### 5.1 As seções

| Seção | Pergunta | O que entra | Ordem |
| --- | --- | --- | --- |
| **Sua vez** | O que eu preciso fazer? | Partidas em que **o jogador** precisa agir (tabela 5.2) | Prazo mais próximo primeiro: o prazo de confirmação (R14), depois o prazo da rodada (R40). Amistoso sem prazo por último |
| **Próximos jogos** | Quando é meu próximo jogo? | Confrontos com data acordada ou informada no futuro, e confrontos de torneio | Cronológica. O jogo de hoje ganha o selo "Hoje". Torneio sem horário vai para o fim, como "Horário pelo organizador" |
| **Aguardando** | O que está com o outro lado? | Partidas em que a vez é do adversário, do admin ou do organizador | Prazo mais próximo primeiro |
| **Histórico** | O que eu já joguei? | Partidas confirmadas: ranking, torneio e amistoso | Mais recente primeiro, agrupado por mês, com carregamento sob demanda. Sem filtro no MVP |

### 5.2 Onde cada estado da partida aparece

Do ponto de vista de um jogador da partida, cruzando a máquina de estados (DOMAIN §3) com os estados da marcação (SCHED §6):

| Tipo | Estado da partida | Situação | Seção | Texto de referência do item |
| --- | --- | --- | --- | --- |
| Ranking | Confronto definido | Sem data e sem proposta pendente | Sua vez | "Marcar jogo · rodada fecha em 5 dias" |
| Ranking | Confronto definido | Proposta do outro lado pendente | Sua vez | "Responder proposta · 3 horários" |
| Ranking | Confronto definido | Proposta do próprio lado pendente | Aguardando | "Proposta enviada · aguardando Lucas e Rafael" |
| Ranking | Confronto definido | Data acordada no futuro | Próximos jogos | "Sáb, 14h · Arena Sunset" |
| Ranking | Confronto definido | Data acordada já passou | Sua vez | "Lançar resultado" |
| Ranking | Aguardando confirmação | Lançado pelo outro lado | Sua vez | "Confirmar resultado · confirma sozinho em 31h" |
| Ranking | Aguardando confirmação | Lançado pelo próprio lado | Aguardando | "Aguardando confirmação · confirma sozinho em 31h" |
| Ranking | Em arbitragem ou Não realizada | — | Aguardando | "Com o admin" |
| Torneio | Confronto definido | Com ou sem horário | Próximos jogos | "Sáb, 9h · Quadra 3" ou "Horário pelo organizador" |
| Torneio | Confronto definido | Horário já passou | Aguardando | "Resultado com o organizador" |
| Amistoso | Aguardando confirmação | Lançado pelo outro lado | Sua vez | "Confirmar amistoso" |
| Amistoso | Aguardando confirmação | Lançado pelo próprio lado | Aguardando | "Aguardando confirmação" |
| Todos | Confirmada | — | Histórico | Placar e, no ranking, os pontos |
| Todos | Cancelada ou Descartada | — | Não aparece | A notificação avisa. A anulada some também do histórico, como o card some do feed (R41) |

O texto de referência é do item da lista; a redação final é da spec de registro de partidas e do DS. O prazo aparece sempre em tempo restante ("em 31h", "em 5 dias"), porque é o que o jogador decide. [DEC-NAV-L L7]

### 5.3 O item da agenda

Um mesmo item serve às quatro seções e ao bloco "Sua vez" do feed:

- **Lados:** avatares e nomes; em duplas, os dois jogadores de cada lado.
- **Contexto:** competição · categoria · rodada (ranking), competição · categoria (torneio) ou "Amistoso".
- **Situação:** o texto da tabela 5.2, com o prazo quando existe.
- **Ação:** só nos itens de "Sua vez", um botão com a ação ("Propor horários", "Responder", "Lançar resultado", "Confirmar").
- **Toque no item:** abre a partida (N10).

- **N16. O botão "Lançar resultado" do item abre direto o fluxo de lançar**, sem passar pela partida: é um toque a menos na ação mais frequente depois do jogo. Todos os outros botões e o toque no item abrem a partida, porque neles o jogador precisa ver algo antes de decidir: as opções de horário ou o placar lançado pelo outro lado. [DEC-JOGOS, DEC-NAV-L L5]

  **Por quê "Confirmar" não confirma no próprio item:** confirmar muda a classificação de outra pessoa. Um toque sem ver o placar é o caminho do erro que o prazo de 48h (R14) já deixa passar.

### 5.4 Registro de resultado e amistoso

- **N17. A partida é a casa do resultado.** Lançar, confirmar, contestar, acompanhar o prazo e ver o impacto no ranking acontecem na tela da partida ou em fluxos que partem dela e voltam para ela. [DEC-JOGOS, DEC-NAV]
- **N18. Lançar o resultado é um fluxo modal sobre a partida** (rota proposta `/jogos/[partida]/resultado`). Concluir ou fechar volta para a partida, já no estado novo. Chega-se a ele por quatro caminhos: o botão da partida, o botão do item em "Sua vez" (na aba ou no feed, N16) e a notificação pós-jogo. O conteúdo do fluxo é da spec de registro de partidas. [DEC-JOGOS]
- **N19. "Registrar amistoso" é um botão fixo no topo da aba Jogos** e o CTA dos estados vazios dela (rota proposta `/jogos/amistoso`). Depois de lançado, o amistoso é uma partida como as outras: aparece em "Aguardando" até a confirmação e tem a mesma tela, onde quem lançou pode cancelar (R43). [DEC-JOGOS, R42–R44, DEC-NAV-Q Q2]

---

## 6. Aba Competições

A aba responde "onde eu estou nas competições que jogo?". Ela não é a classificação: é a porta para as classificações e torneios do jogador, com a posição de cada um já visível. [DEC-NAV-Q Q1, Q4]

- **N29. A aba abre na lista "Minhas competições"**, não numa classificação. Um item por inscrição ativa: [DEC-NAV-Q Q1, Q4]
  - **Ranking:** o StandingSummaryItem (`src/components/ui/`), com a posição, o delta, competição · categoria e o parceiro. Toque → a classificação da categoria (`/ranking/[categoria]`, RK1).
  - **Torneio:** nome, categoria e a data do evento ou, quando já há confronto, o próximo jogo ("Sáb, 9h · Quadra 3"). Toque → a página do torneio (`/competicoes/[competicao]`).

  Ordem: rankings primeiro, na ordem das inscrições mais recentes; depois torneios, do mais próximo ao mais distante. O seletor de categoria continua **dentro** da classificação (RK6), para trocar de categoria sem voltar à lista. [LEIT, L11]

  **Por quê a lista e não a última categoria vista:** a lista mostra todas as posições do jogador de uma vez, e cada item já responde "onde estou" sem abrir a tabela. O toque a mais só existe para quem quer ver quem está em volta.
- **N30. Para quem é admin de alguma competição, a aba tem um bloco "Pendências de admin" no topo**, acima da lista, com a contagem no badge da aba (N3). O bloco lista as decisões que esperam o admin (contestação em arbitragem e partida não realizada, R40), cada uma com a competição, e o toque abre a decisão na área "Administrar" da competição (N31). Sem pendência, o bloco some. Quem não é admin nunca vê o bloco. [DEC-NAV-Q Q3]
- **N31. A área "Administrar" fica na página da competição** (rota proposta `/competicoes/[competicao]/administrar`), visível só para o admin daquela competição. Ela reúne tudo o que o admin decide: **lançar o sorteio da rodada** (R7), **arbitrar contestação**, **decidir a partida não realizada** (com o resumo da marcação, M17), **corrigir ou anular placar** (R41) e, no torneio, **lançar resultados** (R38). O conteúdo de cada decisão é da spec de registro de partidas; esta regra diz só onde elas moram. [R15, DEC-NAV-Q Q3]

  **Por quê fora da agenda:** o admin decide partidas de outros, e o Gabriel quer admin e jogador separados. A área "Administrar" é o embrião do **modo organizador** (troca de modo ou painel web), que fica fora do MVP (`PRODUCT.md`): quando ele vier, a área muda de casa sem mexer na agenda.

---

## 7. Aba Explorar

A aba responde "o que existe para eu jogar?" (JTBD 1). No MVP ela é **enxuta**: a evidência da oportunidade 1.2 é fraca (DSC), e o beta tem os organizadores do Rankin e do Vila. O uso da aba entra nas métricas (seção 13) para decidir se ela cresce. [DEC-NAV-Q Q1, DSC]

- **N32. A busca do app mora no topo do Explorar**, com três escopos: **Jogadores · Competições · Arenas** (controle segmentado). Jogadores busca por nome e @username e leva ao perfil; Competições, por nome da competição ou da organização, e leva à página da competição; Arenas, por nome e cidade, e leva à página da arena. O escopo inicial é Jogadores, porque é a busca que a amizade e o amistoso pedem. [DEC-NAV-Q Q5; LEIT, L12]
- **N33. Sem busca digitada, o Explorar mostra as competições e as arenas dos organizadores do beta**, em duas seções: "Competições" (as com temporada aberta ou evento futuro primeiro) e "Arenas". Na página de uma competição em que o jogador **não** está inscrito, entram dois blocos no lugar da posição: [DEC-NAV-Q Q1; R32]
  - **"Como se inscrever":** o contato do organizador (texto e link que ele informou), porque no beta a inscrição entra por carga (R32) e é feita com o organizador.
  - **"Tenho interesse":** um botão que registra o interesse do jogador naquela competição e vira "Interesse registrado" (tocar de novo desfaz). No MVP, serve para **medir a demanda**: o organizador não é notificado e ninguém mais vê quem marcou. [LEIT, L13]
- **N34. A arena é uma página com nome, cidade e as competições dela** (rota proposta `/arenas/[arena]`). No MVP, as arenas do Explorar são as **organizações do tipo arena ou clube** (`DOMAIN.md`, glossário: a organização já inclui "arena, clube"); a arena da partida continua sendo texto livre (R34). [LEIT, L14]
- **Fora do MVP:** filtros por nível e região, recomendação ("para você"), mapa e inscrição pelo app (`PRODUCT.md`; REF `06-descoberta-competicoes.md`, caminhos A a C).

---

## 8. Feed e aba Jogos

- **N20. O bloco no topo do feed é a seção "Sua vez", e não uma lista paralela.** Mesma fonte, mesmos itens, mesma ordem e o mesmo item (5.3). Ele aparece **só quando há pelo menos uma pendência** (DEC-NAV) e mostra **até 3 itens**, com "Ver todas em Jogos (N)" quando há mais. [DEC-NAV, DEC-JOGOS, R24, DEC-NAV-L L6]
- **N21. O resto da agenda não vai para o feed.** Próximos jogos, Aguardando e Histórico ficam só na aba Jogos. O jogo de hoje chega pela notificação do dia (SCHED §5), não por um item no feed: sem ação, o bloco não aparece (DEC-NAV). [DEC-NAV, R24, DEC-NAV-L L6]

| O que | Feed | Aba Jogos | Aba Competições |
| --- | --- | --- | --- |
| Pendências do jogador ("Sua vez") | Até 3 itens, só quando existem | Todas, sempre no topo | Não |
| Próximos jogos, Aguardando, Histórico | Não | Sim | Não |
| Pendências de admin | Não | Não | Bloco no topo, só para admins (N30) |
| Confronto definido, resultado confirmado | Card público do evento (`FEED_CARDS.md`) | Item da agenda, com as ações | Não |
| Registrar amistoso | Não | Botão no topo | Não |

**Por que não há duplicação:** o card do feed é o **evento** ("isto aconteceu", para os amigos); o item da agenda é a **tarefa** ("isto é seu", com ação). Um confronto do jogador aparece nos dois, com papéis diferentes, e os dois levam à mesma partida (N10). Duplicação seria a mesma tarefa com duas listas que podem divergir, e a N20 evita isso por construção.

---

## 9. Estados

### 9.1 Ritmo de uso

O uso é alto durante a rodada e cai entre competições (`CLAUDE.md`, "Insights estratégicos"). A navegação acompanha esse ritmo sem inventar engajamento:

- **Durante a rodada:** o badge da aba Jogos, o bloco "Sua vez" do feed e as notificações trazem o jogador de volta à ação. A agenda abre com "Sua vez" no topo.
- **Entre rodadas e entre temporadas:** o badge some e o bloco do feed some. A aba Jogos mostra o histórico e o que vem a seguir, a aba Competições mostra a posição final, e o Explorar é o caminho para a próxima competição (JTBD 1).

### 9.2 Vazio

- **N22. Nenhuma aba some nem fica desabilitada quando vazia.** Ela explica por que está vazia e oferece o próximo passo. [HIG, REF]

**Aba Jogos:**

| Situação | O que a aba mostra | CTA |
| --- | --- | --- |
| **Sem nenhuma inscrição ativa e sem histórico** (jogador novo) | "Você ainda não está em nenhum ranking." e uma linha dizendo que a inscrição é feita pelo organizador (R32) | "Registrar amistoso" |
| **Inscrito, entre rodadas** (nenhum confronto aberto) | "Nenhum jogo agora. A próxima rodada de [Ranking] começa quando o organizador sortear." Abaixo, o Histórico | "Registrar amistoso" |
| **Entre temporadas** (temporada encerrada) | "Temporada encerrada." com a posição final da dupla, que leva à classificação. Abaixo, o Histórico | "Registrar amistoso" |
| **Sem inscrição, com histórico** (amistosos ou temporadas passadas) | Só o Histórico, com "Sua vez: nada pendente" no topo | "Registrar amistoso" |

**Aba Competições:**

| Situação | O que a aba mostra | CTA |
| --- | --- | --- |
| **Sem nenhuma inscrição, nunca** (jogador novo) | "Você ainda não está em nenhuma competição." e a linha de que a inscrição é feita com o organizador (R32) | "Explorar competições" (leva ao Explorar) |
| **Sem inscrição ativa, com temporada passada** | O item da última temporada, com "Encerrada" e a posição final; toque → a classificação daquela temporada (RK21) | "Explorar competições" |

**Aba Explorar:** a busca sem resultado diz "Nada encontrado para '[termo]' em [escopo]." e oferece os outros dois escopos. A lista inicial nunca fica vazia no beta, porque os organizadores do beta já estão cadastrados.

A classificação sem temporada em andamento e a tabela sem jogo confirmado são da `RANKING.md` (RK19, RK20).

### 9.3 Carregando e erro

- **N23. Carregando:** o cabeçalho e a tab bar aparecem na hora; o conteúdo mostra um esqueleto (skeleton) com o formato das seções. Nada de spinner em tela cheia. [DEC-NAV-L]
- **N24. Erro:** o erro fica no lugar do conteúdo que falhou, com "Tentar de novo", e o resto da tela continua funcionando. Se já havia dados carregados antes, eles continuam na tela, com um aviso de que podem estar desatualizados. A tab bar nunca depende de dado do servidor para aparecer; os badges, sim, e sem dado eles simplesmente não aparecem. [DEC-NAV-L]

---

## 10. Layout

### 10.1 Mobile (base)

- **N25. A largura de referência é de 393 a 430px.** Com 5 abas, cada uma tem de 78 a 86px de largura. "Competições" (11 letras) é o rótulo mais longo e precisa caber em `label-md` **sem truncar e sem quebrar linha**; a issue da TabBar testa isso a 393px com a fonte real. [`PRODUCT.md`]
- **N26. Todo alvo de toque tem no mínimo 48px** (`--dimension-tap-target-minimum`): aba, item da agenda, botão do item, item da lista de competições, escopo da busca, sino e engrenagem. A tab bar respeita a área segura inferior do iOS (o app precisa de `viewport-fit=cover`). [`TOKENS.md`, REF]

### 10.2 Desktop e tablet

- **N27. Abaixo de 600px, tab bar inferior. A partir de 600px (`--breakpoint-md`), as mesmas 5 abas viram um trilho lateral (navigation rail) à esquerda**, com ícone e rótulo. O conteúdo fica numa coluna central com largura máxima, porque o feed, a agenda, a lista de competições e a classificação são listas de uma coluna. Nenhum destino novo aparece no desktop. [M3, DEC-NAV-L L9]

  **Por quê:** o M3 diz que janelas compactas "devem sempre usar a navigation bar" e reserva o rail para as maiores. O limite de 600dp do M3 coincide com o `--breakpoint-md` que já existe no DS.

### 10.3 Acessibilidade

- A navegação principal é `<nav aria-label="Principal">` com links, e a aba atual tem `aria-current="page"`. **Não é** `role="tablist"`: a barra troca de rota, não de painel (ARIA). Os escopos da busca, que trocam o conteúdo na mesma tela, são outra coisa: controle segmentado ou Tabs do DS.
- O rótulo visível é o nome acessível. A aba Perfil, que mostra o avatar, mantém o rótulo "Perfil".
- O badge entra no nome acessível: "Jogos, 2 pendências", "Competições, 1 pendência de admin". O ponto do sino também: "Notificações, há novas".
- Cada seção da agenda é um `<section>` com título (`h2`), e cada lista é uma lista (`<ul>`). O selo "Hoje" e o prazo são texto, não só cor.
- O resultado da busca anuncia a contagem ("12 jogadores encontrados") numa região `aria-live="polite"` (WCAG 4.1.3).

---

## 11. Componentes

Lista para a auditoria do design system. **Esta spec não desenha os componentes**: nome, papel e onde aparecem, para a auditoria decidir o que já existe, o que vira variante e o que é novo. Os tiers seguem a estratégia do Storybook (`CLAUDE.md`). "No `master`" quer dizer que o componente já existe em `src/components/`.

| Componente | Tier | Papel nesta spec | Situação |
| --- | --- | --- | --- |
| **TabBar** | 1 | Navegação principal no mobile, 5 abas (N1, N4) | Novo. Com CountBadge e área segura |
| **NavigationRail** | 1 | Navegação principal a partir de 600px (N27) | Novo. Pode ser variante da TabBar |
| **AppHeader** | 1 | Cabeçalho das abas e das telas de detalhe (seção 3) | Novo. Título, "Voltar" e ações |
| **IconButton** | 1 | Sino, engrenagem, fechar dos fluxos modais | Novo. `aria-label` obrigatório |
| **CountBadge** | 1 | Número nas abas Jogos e Competições, ponto no sino (N3, N7) | Novo. Contagem no nome acessível |
| **SearchField** | 1 | Campo de busca do Explorar (N32) | Novo, ou variante do FormInput |
| **Badge** | 1 | Selo "Hoje", "Com o admin", "Encerrada", "Interesse registrado" | No `master` |
| **SegmentedControl** | 1 | Escopos da busca (N32) | No `master` |
| **Skeleton**, **EmptyState**, **Alert**, **Dialog**, **ListItem** | 1–2 | Carregando, vazios, erro, fluxos modais, base dos itens | No `master` |
| **StandingSummaryItem** | 3 | Item de ranking em "Minhas competições" (N29) | No `master` |
| **AgendaItem** | 2 | Item da agenda e do bloco "Sua vez" (5.3) | Novo. Estados da tabela 5.2; com e sem botão de ação |
| **AgendaSection** | 3 | Seção com título, lista e regra de sumir quando vazia (N14) | Novo. Inclui a linha "Nada pendente" |
| **PendingBlock** | 3 | Bloco "Sua vez" do feed (N20) | Novo. Compõe o AgendaItem; até 3 itens e "Ver todas" |
| **TournamentSummaryItem** | 3 | Item de torneio em "Minhas competições": data ou próximo jogo (N29) | Novo. Parte do ListItem |
| **AdminPendingBlock** | 3 | Bloco "Pendências de admin" da aba Competições (N30) | Novo. Pode compor o mesmo padrão do PendingBlock |
| **CompetitionListItem** e **ArenaListItem** | 3 | Itens do Explorar e do resultado da busca (N32, N33) | Novos, ou o `CompetitionBlock` do feed como base. Parte do ListItem |
| **SettingsList** | 3 | Tela de configurações, com "Sair" (N8) | Novo. Linha com rótulo, valor e navegação |

---

## 12. Decisões, leituras e perguntas

### Respondidas

- **Primeira rodada** (DEC-NAV-L, 26/09): L1 → N4; **L2 rejeitada** → N10 (a aba de origem continua marcada); L3 → N13; L4 → N14; L5 → N16; L6 → N20, N21; L7 → tabela 5.2; L8 → N8; L9 → N27.
- **Segunda rodada** (DEC-NAV-Q, 29/09): Q1 → N1 (5 abas, Competições do jogador, Explorar); Q2 → N12; Q3 → N30, N31 (admin dentro da competição, agenda só de jogador); Q4 → N29 (a aba Competições abre na lista); Q5 → N6, N32 (uma busca, no Explorar, com três escopos).

### Leituras do agente (a confirmar)

Saíram da revisão com as decisões de 29/09:

- **L10.** Quem chega de fora do app cai na aba dona do tipo da entidade (N28).
- **L11.** "Minhas competições": só inscrições ativas; rankings primeiro, depois torneios por data (N29). Temporadas encerradas saem da lista e ficam no perfil (`PROFILE.md`, PF19), com a exceção do vazio da 9.2.
- **L12.** O escopo inicial da busca é Jogadores (N32).
- **L13.** "Tenho interesse" é privado no MVP: registra, desfaz, e não avisa o organizador (N33).
- **L14.** As arenas do Explorar são as organizações do tipo arena ou clube; a arena da partida continua texto (N34). Se o Gabriel preferir a arena como entidade própria, isso vira pergunta de domínio no `DOMAIN.md`.

Cada leitura confirmada vira regra aqui, e a lista encolhe.

---

## 13. Métricas de sucesso

Medidas no beta com Rankin e Vila. Sem meta fixa: a primeira rodada define a linha de base.

| Métrica | Definição | Por que importa |
| --- | --- | --- |
| **Porta de entrada das ações** | Das pendências resolvidas (marcar, responder, lançar, confirmar), % que começaram no bloco do feed, na aba Jogos, na notificação ou na partida aberta de outro jeito | Mostra se o bloco do feed e o badge cumprem o papel de atalho, ou se um dos dois sobra |
| **Toques até lançar** | Mediana de toques entre abrir o app e concluir o lançamento de um resultado | O alvo do desenho é 2 (item do bloco → fluxo). Se passar de 4, o atalho não está sendo achado |
| **Tempo até a primeira ação** | Mediana entre o sorteio e a primeira ação do jogador no confronto | Mede se a agenda e o badge trazem o jogador de volta durante a rodada |
| **Uso das abas** | % das sessões que visitam cada aba; aba de entrada depois do Feed | Testa a hipótese H4 do discovery (ranking é o motivo de abrir o app) pela aba Competições |
| **Uso do Explorar** | % dos jogadores que abrem o Explorar por mês, separado entre rodada e entre temporadas | A evidência do JTBD 1.2 é fraca (DSC): decide se a descoberta cresce (filtros, recomendação) |
| **Tenho interesse** | Interesses por competição e % dos jogadores que marcaram algum | Mede a demanda por competições novas, o argumento para a inscrição pelo app |
| **Busca por escopo** | Buscas por escopo e % que terminam numa página aberta | Mostra qual dos três escopos tem uso real |
| **Fila do admin** | Tempo entre uma pendência de admin surgir e a decisão | Mede se o bloco na aba Competições e o badge bastam como sinal (N30) |

---

## 14. Riscos para acompanhar no beta

- **"Competições" não cabe na aba.** Com 5 abas a 393px, o rótulo mais longo tem cerca de 78px (N25). Se não couber em `label-md`, o rótulo precisa mudar, e isso volta ao Gabriel: truncar rótulo de aba não é opção.
- **Explorar raso no beta.** Com dois organizadores, a vitrine tem poucas competições e arenas. A aba pode parecer vazia; a métrica "Uso do Explorar" diz se vale investir nela ou se ela espera mais organizadores.
- **Badge em excesso vira ruído.** Um jogador em 2 categorias pode ter até 4 pendências por mês. Se o badge de Jogos ficar aceso quase sempre, perde o peso que a HIG pede ("reserve badges para informação crítica"). Acompanhar quanto tempo o badge fica aceso por jogador.
- **O admin não vê a fila.** Com as pendências de admin fora da agenda, o sinal depende do badge da aba Competições e da notificação. Se a fila crescer sem decisão (DOMAIN §7), a métrica "Fila do admin" aponta.
- **O mesmo confronto no feed e na agenda.** O card do evento e o item da tarefa têm papéis diferentes (seção 8), mas o jogador pode ler como repetição. Ouvir os jogadores do beta sobre isso.
- **Histórico no perfil e na agenda.** O próprio perfil tem partidas recentes e a agenda tem o histórico. A `PROFILE.md` (PF18) resolve apontando o "Ver todas" do próprio perfil para o Histórico da aba Jogos, para não existirem duas listas que possam divergir.
- **A aba de origem e a URL.** Manter a aba de origem marcada (N10) com uma rota por entidade pede que a navegação lembre a origem sem mudar a URL. A issue da casca do app precisa testar voltar, recarregar e abrir o link compartilhado.
