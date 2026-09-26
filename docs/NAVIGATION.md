# NAVIGATION.md — LetzPlay

Spec da navegação do app e da agenda do jogador (aba "Jogos"): quais abas existem, o que fica fora delas, como cada card do feed leva ao detalhe, como a agenda se organiza e como ela divide o trabalho com o bloco de pendências do feed.

> Este doc decide **onde as coisas moram e como se chega a elas**. O conteúdo de cada tela é da spec dela: ranking, perfil, registro de partidas, H2H e feed com dados reais. As regras de domínio estão em `docs/DOMAIN.md` (R…) e as da marcação em `docs/SCHEDULING.md` (M…). As regras daqui são numeradas **N1, N2…** para não colidir com elas. Rotas são propostas: o nome final é decisão de implementação, a estrutura (uma rota por entidade) não.

---

## Fontes

As siglas de decisão são as mesmas do `docs/DOMAIN.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DEC-JOGOS** | Aba "Jogos" como agenda do jogador; registro de resultado contextual, sem aba; volume de 2 a 8 jogos por mês |
| **DEC-NAV** | Decisões do Gabriel na issue das referências visuais (26/09): registrar resultado não vai na tab bar (a HIG reserva a tab bar para navegação); "Jogos" é destino, não ação; o feed abre com um bloco sobre o próprio jogador **só quando há ação**; ranking como lista completa com a linha da própria dupla fixada |
| **SCHED** | `docs/SCHEDULING.md` §6: estados da marcação no confronto e quais entram nas pendências do feed |
| **FEED** | `docs/FEED_CARDS.md`: cards, destinos de toque já previstos (H2H, perfil, "Comentar" leva ao detalhe) e §11.2 (descoberta de organizações fica numa tela de competições, não no feed) |
| **REF** | `docs/discovery/referencias/07-navegacao.md` (28 tab bars de apps de esporte e fitness) e os arquivos de ranking, perfil e descoberta |
| **HIG** | Apple Human Interface Guidelines, "Tab bars" (lido em 26/09/2026): "Use a tab bar to support navigation, not to provide actions"; "Make sure the tab bar is visible when people navigate to different sections of your app… The exception is when a modal view covers the tab bar"; "Reserve badges for critical information" |
| **M3** | Material Design 3, "Navigation bar" e "Navigation rail" (lidos em 25 e 26/09/2026): 3 a 5 destinos na barra; janelas compactas (abaixo de 600dp) "should always use a navigation bar"; o rail serve às janelas médias e maiores |
| **ARIA** | WAI-ARIA 1.2 e MDN `aria-current`: barra de rotas é `<nav>` com links, não o widget Tabs |
| **LEIT** | Leitura do agente desta spec, a confirmar pelo Gabriel. A lista está na seção 10 |

---

## 1. Princípio

**Quatro destinos, um lugar para cada coisa.** O problema 2 do audit do app atual é de arquitetura de informação: menu com 19+ itens, busca duplicada e perfil sobrecarregado (`CLAUDE.md`). A resposta desta spec é uma regra só, aplicada a tudo: **cada entidade tem uma rota, e cada ação tem uma casa**. Os atalhos (bloco de pendências, notificação, badge) levam até a casa; eles não viram uma segunda casa.

| Problema do audit | Como esta spec resolve |
| --- | --- |
| Menu com 19+ itens | 4 abas com rótulo e nenhum menu lateral nem aba "Mais" (N1, N5) |
| Busca duplicada | Uma busca, num lugar só (N6) |
| Perfil sobrecarregado | Configurações e conta saem do perfil público para uma tela própria, atrás de um ícone (N8) |

---

## 2. Abas

- **N1. O app tem 4 abas, nesta ordem: Feed · Jogos · Ranking · Perfil.** Rótulo de uma palavra em todas; o Perfil usa o avatar do jogador no lugar do ícone. [DEC-NAV, REF, M3; LEIT, pergunta Q1]

| Aba | O que é | JTBD | Rota proposta |
| --- | --- | --- | --- |
| **Feed** | Activity stream (`FEED_CARDS.md`), com o bloco "Sua vez" no topo quando há pendência (N20) | 4, 2 | `/feed` |
| **Jogos** | A agenda do jogador: o que fazer, o que vem, o que espera o outro lado e o histórico (seção 5) | 2, 3 | `/jogos` |
| **Ranking** | A classificação das categorias em que o jogador está inscrito (conteúdo da spec de ranking) | 2, 5 | `/ranking` |
| **Perfil** | O próprio perfil (conteúdo da spec de perfil) e a porta para as configurações | 5 | `/perfil` |

**Por que 4 e não 5.** A amostra de 28 apps tem 19 com 5 abas e 5 com 4 (REF), e as duas diretrizes aceitam as duas contagens (M3: 3 a 5; HIG: "menos abas é mais fácil"). O quinto candidato natural seria **Competições** (descoberta, JTBD 1), mas a descoberta de competições não está no escopo do MVP (`PRODUCT.md` > "Must have"), e no primeiro beta as inscrições entram por carga (R32). Uma aba sem conteúdo real contraria a HIG ("não desabilite nem esconda abas", o que vale também para não criar aba vazia). A vaga fica reservada: quando a descoberta entrar, ela vira a quinta aba, entre Ranking e Perfil.

**Por que essa ordem.** Feed primeiro porque o login sempre leva ao feed (`PRODUCT.md`). Jogos ao lado do Feed porque os dois dividem as pendências (seção 6): o badge da aba Jogos fica perto do bloco "Sua vez", no canto de maior alcance do polegar. Perfil por último, como em 8 dos 28 apps (REF). Ranking e Jogos trocarem de lugar custa pouco; é a pergunta Q1.

- **N2. Registrar resultado e registrar amistoso não são abas.** São ações com casa própria (seção 5.4). [DEC-NAV, DEC-JOGOS, HIG]
- **N3. A aba Jogos tem badge com o número de pendências "Sua vez"** (5.1), mais as do admin quando o jogador é admin (Q3). As outras abas não têm badge: curtida, amizade e evento novo no feed não são críticos. [HIG, REF; LEIT]
- **N4. A tab bar fica visível em todas as telas, inclusive nas de detalhe** (confronto, perfil de outro jogador, classificação). Ela some só nos **fluxos modais de tarefa**: lançar resultado, registrar amistoso, propor horários e editar perfil, que abrem em tela cheia com "Fechar". [HIG]

  **Por quê:** a HIG diz que esconder a tab bar faz a pessoa esquecer em que área do app está, com a exceção do modal, que é "temporário e autocontido".

---

## 3. O que fica fora das abas

- **N5. Não existe menu lateral nem aba "Mais".** Nenhum dos 28 apps de esporte da amostra usa menu lateral como navegação principal, e a aba "Mais" com lista longa só muda o "19+ itens" de lugar (REF). [REF, HIG]
- **N6. A busca é uma só, com a lupa no topo do Feed** (rota proposta `/busca`). No MVP, busca **jogadores** pelo nome e pelo @username, o que atende a amizade e o amistoso. Competições entram na busca junto com a descoberta. [REF; LEIT, pergunta Q5]
- **N7. As notificações ficam no sino, no topo do Feed** (rota proposta `/notificacoes`), com um ponto quando há não lidas. Cada notificação leva à tela da entidade (confronto, perfil, classificação). Nenhum app da amostra usa notificação como aba (REF). O conteúdo e o canal são da spec de notificações básicas. [REF; LEIT]
- **N8. Configurações e conta ficam atrás de uma engrenagem no topo do próprio Perfil** (rota proposta `/perfil/configuracoes`). A tela reúne: dados da conta (e-mail, senha), telefone para o WhatsApp com o consentimento e o apagamento (M20–M25), e, por último, **"Sair"**, que resolve a falta de logout do app hoje. Sair não pede confirmação: é reversível com um login. [REF (Strava, Peloton), `SCHEDULING.md` §7; LEIT]
- **N9. A página da competição existe, mas não é aba.** Chega-se a ela pelo cabeçalho dos cards do feed, pela tela do confronto e pela aba Ranking (rota proposta `/competicoes/[competicao]`). O conteúdo é da spec de ranking (e, no torneio, da spec que vier). As ações do admin que valem para a competição inteira, como **lançar o sorteio da rodada** e lançar resultados do torneio, moram nela. [R15; LEIT]

### Cabeçalho de cada aba

| Aba | Cabeçalho |
| --- | --- |
| Feed | Logo · lupa (N6) · sino (N7) |
| Jogos | Título "Jogos" · botão "Registrar amistoso" (N19) |
| Ranking | Título "Ranking" · seletor de categoria quando há mais de uma inscrição (Q4) |
| Perfil | Título com o @username · engrenagem (N8) |

As telas de detalhe têm cabeçalho com "Voltar" e o título da entidade.

---

## 4. Do feed ao detalhe

- **N10. Cada entidade tem uma rota, e todo caminho até ela usa a mesma.** A partida é a mesma tela vinda do feed, da agenda, da notificação ou do perfil. O que muda é **quem vê**, não a tela: o jogador da partida vê as ações; os outros veem só a leitura pública. [LEIT]

| Entidade | Rota proposta | Aba marcada | O jogador da partida vê | Os outros veem |
| --- | --- | --- | --- | --- |
| **Partida** (confronto, resultado, amistoso) | `/jogos/[partida]` | Jogos | Marcação (SCHED §6), lançar, confirmar ou contestar, prazo, histórico da marcação | Lados, competição, data e arena acordadas (M18), placar confirmado, comentários |
| **Jogador** | `/jogadores/[username]` (o próprio: `/perfil`) | Nenhuma (Perfil, no próprio) | — | Perfil público (spec de perfil) |
| **H2H** | Da spec de H2H | Nenhuma | — | — |
| **Classificação de uma categoria** | `/ranking/[categoria]` | Ranking | A linha da própria dupla fixada (DEC-NAV) | A tabela |
| **Competição** | `/competicoes/[competicao]` | Ranking | Ações de admin, se for admin (N9) | Categorias, temporada, rodada, regras |

**A aba marcada vem do tipo da entidade**, não do caminho de origem: uma partida aberta pelo feed marca "Jogos". É o que a URL permite saber sem estado extra, e ensina onde a partida mora.

### Destino de cada toque nos cards do feed

Completa o que o `FEED_CARDS.md` já previa (H2H, perfil e "Comentar" levam ao detalhe).

| Card | Toque no corpo | Cabeçalho (organização e competição) | Avatar ou nome | Outros |
| --- | --- | --- | --- | --- |
| **Resultado** | Partida | Classificação da categoria (ranking) ou competição (torneio); amistoso não tem cabeçalho de competição | Perfil do jogador | H2H → H2H. Comentar → partida, na seção de comentários |
| **Confronto definido** | Partida (com as ações, se o jogador for da partida) | Classificação da categoria ou competição | Perfil do jogador | H2H → H2H |
| **Inscrição** | Competição | Competição | Perfil do jogador | — |
| **Nova amizade** | — | — | Perfil do jogador (mini-card) | — |
| **Movimentação e marco** | Classificação da categoria, rolada até a linha da dupla | Classificação da categoria | Perfil do jogador | — |

- **N11. Card do feed não tem botão de ação da partida.** "Lançar resultado" e "Confirmar" moram na partida e aparecem no bloco "Sua vez" (N20). O card de confronto do próprio jogador leva à partida, onde as ações estão. [DEC-JOGOS, DEC-NAV; LEIT]

---

## 5. Aba Jogos: a agenda

A agenda responde a quatro perguntas, nesta ordem: **o que eu preciso fazer, quando é meu próximo jogo, o que está com o outro lado e o que já joguei.** Cada pergunta é uma seção.

- **N12. A agenda tem 4 seções, nesta ordem: Sua vez · Próximos jogos · Aguardando · Histórico.** As 5 coisas que o `PRODUCT.md` lista cabem nelas: confrontos sorteados e pendências se distribuem pelo estado (tabela da 5.2), próximos jogos e histórico são seções, e o amistoso é um botão (N19), não uma seção. [`PRODUCT.md`, DOMAIN §4; LEIT, pergunta Q2]
- **N13. Cada partida aparece em uma seção só.** Quando dois critérios valem, vence o primeiro da ordem: Sua vez > Próximos jogos > Aguardando > Histórico. Exemplo: um jogo marcado para sábado com uma remarcação do outro lado pendente está em "Sua vez", e não também em "Próximos jogos". [LEIT]

  **Por quê:** a mesma partida em dois lugares da mesma tela obriga o jogador a descobrir se são dois jogos.
- **N14. A seção sem itens some**, e a tela só mostra o estado vazio quando todas somem (seção 7). A exceção é "Sua vez": sem itens, ela vira uma linha "Nada pendente", porque dizer "você está em dia" também é informação. [LEIT]
- **N15. As seções não agrupam por competição.** O volume é de 2 a 8 jogos por mês (DEC-JOGOS), então a lista é curta, e cada item já diz competição, categoria e rodada. Agrupar por competição separaria duas pendências urgentes só por serem de rankings diferentes. [DEC-JOGOS; LEIT]

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

O texto de referência é do item da lista; a redação final é da spec de registro de partidas e do DS. O prazo aparece sempre em tempo restante ("em 31h", "em 5 dias"), porque é o que o jogador decide.

### 5.3 O item da agenda

Um mesmo item serve às quatro seções e ao bloco "Sua vez" do feed:

- **Lados:** avatares e nomes; em duplas, os dois jogadores de cada lado.
- **Contexto:** competição · categoria · rodada (ranking), competição · categoria (torneio) ou "Amistoso".
- **Situação:** o texto da tabela 5.2, com o prazo quando existe.
- **Ação:** só nos itens de "Sua vez", um botão com a ação ("Propor horários", "Responder", "Lançar resultado", "Confirmar").
- **Toque no item:** abre a partida (N10).

- **N16. O botão "Lançar resultado" do item abre direto o fluxo de lançar**, sem passar pela partida: é um toque a menos na ação mais frequente depois do jogo. Todos os outros botões e o toque no item abrem a partida, porque neles o jogador precisa ver algo antes de decidir: as opções de horário ou o placar lançado pelo outro lado. [DEC-JOGOS; LEIT]

  **Por quê "Confirmar" não confirma no próprio item:** confirmar muda a classificação de outra pessoa. Um toque sem ver o placar é o caminho do erro que o prazo de 48h (R14) já deixa passar.

### 5.4 Registro de resultado e amistoso

- **N17. A partida é a casa do resultado.** Lançar, confirmar, contestar, acompanhar o prazo e ver o impacto no ranking acontecem na tela da partida ou em fluxos que partem dela e voltam para ela. [DEC-JOGOS, DEC-NAV]
- **N18. Lançar o resultado é um fluxo modal sobre a partida** (rota proposta `/jogos/[partida]/resultado`). Concluir ou fechar volta para a partida, já no estado novo. Chega-se a ele por quatro caminhos: o botão da partida, o botão do item em "Sua vez" (na aba ou no feed, N16) e a notificação pós-jogo. O conteúdo do fluxo é da spec de registro de partidas. [DEC-JOGOS; LEIT]
- **N19. "Registrar amistoso" é um botão fixo no topo da aba Jogos** e o CTA dos estados vazios dela (rota proposta `/jogos/amistoso`). Depois de lançado, o amistoso é uma partida como as outras: aparece em "Aguardando" até a confirmação e tem a mesma tela, onde quem lançou pode cancelar (R43). [DEC-JOGOS, R42–R44; LEIT]

### 5.5 Pendências do admin

As pendências do admin (contestação em arbitragem, partida não realizada, R40) não são jogos do admin: ele decide partidas de outros. Proposta, sujeita à pergunta Q3:

- Uma seção **"Como admin"** na aba Jogos, só para quem é admin de alguma competição, entre "Sua vez" e "Próximos jogos", com as partidas que esperam decisão e a competição de cada uma. O item abre a tela de decisão da partida (spec de registro de partidas).
- As pendências do admin entram no badge da aba Jogos (N3), mas **não** no bloco "Sua vez" do feed, que é sobre os jogos do próprio jogador.
- Lançar o sorteio e lançar resultados do torneio ficam na página da competição (N9): são ações da competição, não de uma partida pendente.

---

## 6. Feed e aba Jogos

- **N20. O bloco no topo do feed é a seção "Sua vez", e não uma lista paralela.** Mesma fonte, mesmos itens, mesma ordem e o mesmo item (5.3). Ele aparece **só quando há pelo menos uma pendência** (DEC-NAV) e mostra **até 3 itens**, com "Ver todas em Jogos (N)" quando há mais. [DEC-NAV, DEC-JOGOS, R24; LEIT]
- **N21. O resto da agenda não vai para o feed.** Próximos jogos, Aguardando e Histórico ficam só na aba Jogos. O jogo de hoje chega pela notificação do dia (SCHED §5), não por um item no feed: sem ação, o bloco não aparece (DEC-NAV). [DEC-NAV, R24; LEIT]

| O que | Feed | Aba Jogos |
| --- | --- | --- |
| Pendências do jogador ("Sua vez") | Até 3 itens, só quando existem | Todas, sempre no topo |
| Próximos jogos, Aguardando, Histórico | Não | Sim |
| Pendências do admin | Não | Seção "Como admin" (Q3) |
| Confronto definido, resultado confirmado | Card público do evento (`FEED_CARDS.md`) | Item da agenda, com as ações |
| Registrar amistoso | Não | Botão no topo |

**Por que não há duplicação:** o card do feed é o **evento** ("isto aconteceu", para os amigos); o item da agenda é a **tarefa** ("isto é seu", com ação). Um confronto do jogador aparece nos dois, com papéis diferentes, e os dois levam à mesma partida (N10). Duplicação seria a mesma tarefa com duas listas que podem divergir, e a N20 evita isso por construção.

---

## 7. Estados

### 7.1 Ritmo de uso

O uso é alto durante a rodada e cai entre competições (`CLAUDE.md`, "Insights estratégicos"). A navegação acompanha esse ritmo sem inventar engajamento:

- **Durante a rodada:** o badge da aba Jogos, o bloco "Sua vez" do feed e as notificações trazem o jogador de volta à ação. A agenda abre com "Sua vez" no topo.
- **Entre rodadas e entre temporadas:** o badge some e o bloco do feed some. A aba Jogos mostra o histórico e o que vem a seguir (7.2), e o amistoso continua a um toque.

### 7.2 Vazio

- **N22. Nenhuma aba some nem fica desabilitada quando vazia.** Ela explica por que está vazia e oferece o próximo passo. [HIG, REF]

| Situação | O que a aba Jogos mostra | CTA |
| --- | --- | --- |
| **Sem nenhuma inscrição ativa e sem histórico** (jogador novo) | "Você ainda não está em nenhum ranking." e uma linha dizendo que a inscrição é feita pelo organizador do ranking (R32) | "Registrar amistoso" |
| **Inscrito, entre rodadas** (nenhum confronto aberto) | "Nenhum jogo agora. A próxima rodada de [Ranking] começa quando o organizador sortear." Abaixo, o Histórico | "Registrar amistoso" |
| **Entre temporadas** (temporada encerrada) | "Temporada encerrada." com a posição final da dupla, que leva à classificação. Abaixo, o Histórico | "Registrar amistoso" |
| **Sem inscrição, com histórico** (amistosos ou temporadas passadas) | Só o Histórico, com "Sua vez: nada pendente" no topo | "Registrar amistoso" |

A aba Ranking vazia segue a mesma regra ("Você ainda não está em nenhum ranking"); o texto é da spec de ranking. Para a temporada encerrada, a posição final é o elo com o JTBD 5 (sentir que está evoluindo) num momento em que não há jogo.

### 7.3 Carregando e erro

- **N23. Carregando:** o cabeçalho e a tab bar aparecem na hora; o conteúdo mostra um esqueleto (skeleton) com o formato das seções. Nada de spinner em tela cheia. [LEIT]
- **N24. Erro:** o erro fica no lugar do conteúdo que falhou, com "Tentar de novo", e o resto da tela continua funcionando. Se já havia dados carregados antes, eles continuam na tela, com um aviso de que podem estar desatualizados. A tab bar nunca depende de dado do servidor para aparecer; o badge, sim, e sem dado ele simplesmente não aparece. [LEIT]

---

## 8. Layout

### 8.1 Mobile (base)

- **N25. A largura de referência é de 393 a 430px.** Com 4 abas, cada uma tem de 98 a 107px de largura, o que cabe "Ranking" (a palavra mais longa, 7 letras) em `label-md` sem truncar. [`PRODUCT.md`]
- **N26. Todo alvo de toque tem no mínimo 48px** (`--dimension-tap-target-minimum`): aba, item da agenda, botão do item, lupa, sino e engrenagem. A tab bar respeita a área segura inferior do iOS (o app precisa de `viewport-fit=cover`). [`TOKENS.md`, REF]

### 8.2 Desktop e tablet

- **N27. Abaixo de 600px, tab bar inferior. A partir de 600px (`--breakpoint-md`), as mesmas 4 abas viram um trilho lateral (navigation rail) à esquerda**, com ícone e rótulo. O conteúdo fica numa coluna central com largura máxima, porque o feed, a agenda e a classificação são listas de uma coluna. Nenhum destino novo aparece no desktop. [M3; LEIT]

  **Por quê:** o M3 diz que janelas compactas "devem sempre usar a navigation bar" e reserva o rail para as maiores. O limite de 600dp do M3 coincide com o `--breakpoint-md` que já existe no DS.

### 8.3 Acessibilidade

- A navegação principal é `<nav aria-label="Principal">` com links, e a aba atual tem `aria-current="page"`. **Não é** `role="tablist"`: a barra troca de rota, não de painel (ARIA).
- O rótulo visível é o nome acessível. A aba Perfil, que mostra o avatar, mantém o rótulo "Perfil".
- O badge entra no nome acessível: "Jogos, 2 pendências". O ponto do sino também: "Notificações, há novas".
- Cada seção da agenda é um `<section>` com título (`h2`), e cada lista é uma lista (`<ul>`). O selo "Hoje" e o prazo são texto, não só cor.

---

## 9. Componentes novos

Lista para a auditoria do design system. **Esta spec não desenha os componentes**: nome, papel e onde aparecem, para a auditoria decidir o que já existe, o que vira variante e o que é novo. Os tiers seguem a estratégia do Storybook (`CLAUDE.md`).

| Componente | Tier | Papel nesta spec | Observação |
| --- | --- | --- | --- |
| **TabBar** | 1 | Navegação principal no mobile (N1, N4) | Com CountBadge e área segura |
| **NavigationRail** | 1 | Navegação principal a partir de 600px (N27) | Pode ser variante da TabBar |
| **AppHeader** | 1 | Cabeçalho das abas e das telas de detalhe (seção 3) | Título, "Voltar" e ações |
| **IconButton** | 1 | Lupa, sino, engrenagem, fechar dos fluxos modais | `aria-label` obrigatório |
| **CountBadge** | 1 | Número na aba Jogos, ponto no sino (N3, N7) | Contagem no nome acessível |
| **Badge / Tag** | 1 | Selo "Hoje", "Com o admin", "Aguardando confirmação" | Já pedido pelo inventário das referências |
| **Skeleton** | 1 | Carregando (N23) | Tokens `--color-loading-*` já existem |
| **EmptyState** | 2 | Vazios da aba Jogos e da aba Ranking (7.2) | Título, apoio e CTA |
| **AgendaItem** | 2 | Item da agenda e do bloco "Sua vez" (5.3) | Estados da tabela 5.2; com e sem botão de ação |
| **AgendaSection** | 3 | Seção com título, lista e regra de sumir quando vazia (N14) | Inclui a linha "Nada pendente" |
| **PendingBlock** | 3 | Bloco "Sua vez" do feed (N20) | Compõe AgendaItem; até 3 itens e "Ver todas" |
| **SettingsList** | 3 | Tela de configurações, com "Sair" (N8) | Linha com rótulo, valor e navegação |
| **Modal de tela cheia** | 1 | Fluxos de tarefa que cobrem a tab bar (N4) | Foco preso e "Fechar" (padrão Dialog do APG) |

---

## 10. Leituras e perguntas abertas

### Leituras do agente (a confirmar)

- **L1.** A tab bar fica visível nas telas de detalhe e some só nos fluxos modais (N4).
- **L2.** A aba marcada vem do tipo da entidade, não da origem (N10).
- **L3.** Cada partida aparece numa seção só, com a prioridade da N13.
- **L4.** "Sua vez" nunca some; as outras seções somem vazias (N14).
- **L5.** Só o botão "Lançar resultado" pula a partida; os outros abrem a partida (N16).
- **L6.** O bloco do feed mostra até 3 itens de "Sua vez" (N20), e o jogo de hoje não entra nele (N21).
- **L7.** Histórico só com partidas confirmadas; cancelada, descartada e anulada não aparecem (tabela 5.2).
- **L8.** "Sair" sem confirmação, no fim das configurações (N8).
- **L9.** Trilho lateral a partir de 600px, com o conteúdo numa coluna central (N27).

### Perguntas para o Gabriel

- **Q1. Abas:** 4 abas **Feed · Jogos · Ranking · Perfil**, sem Competições no MVP? (N1)
- **Q2. Agenda:** as 4 seções por ação (**Sua vez · Próximos jogos · Aguardando · Histórico**), com o amistoso como botão? (N12)
- **Q3. Admin:** as pendências do admin numa seção "Como admin" da aba Jogos? (5.5)
- **Q4. Ranking com várias inscrições:** a aba abre na última categoria vista, com seletor no topo? (seção 3)
- **Q5. Busca:** uma lupa no topo do Feed, só para jogadores no MVP? (N6)

As opções, os trade-offs e as recomendações estão no comentário de Needs Decision da issue. Cada resposta vira regra aqui, e a pergunta sai da lista.

---

## 11. Métricas de sucesso

Medidas no beta com Rankin e Vila. Sem meta fixa: a primeira rodada define a linha de base.

| Métrica | Definição | Por que importa |
| --- | --- | --- |
| **Porta de entrada das ações** | Das pendências resolvidas (marcar, responder, lançar, confirmar), % que começaram no bloco do feed, na aba Jogos, na notificação ou na partida aberta de outro jeito | Mostra se o bloco do feed e o badge cumprem o papel de atalho, ou se um dos dois sobra |
| **Toques até lançar** | Mediana de toques entre abrir o app e concluir o lançamento de um resultado | O alvo do desenho é 2 (item do bloco → fluxo). Se passar de 4, o atalho não está sendo achado |
| **Tempo até a primeira ação** | Mediana entre o sorteio e a primeira ação do jogador no confronto | Mede se a agenda e o badge trazem o jogador de volta durante a rodada |
| **Uso das abas** | % das sessões que visitam cada aba; aba de entrada depois do Feed | Testa a hipótese H4 do discovery (ranking é o motivo de abrir o app) e informa a ordem das abas (Q1) |
| **Busca** | Buscas por sessão e % que termina num perfil aberto | Decide se a busca merece mais escopo (competições) ou outro lugar |

---

## 12. Riscos para acompanhar no beta

- **Sem aba de competições, o JTBD 1 fica sem casa.** É coerente com o escopo do MVP, mas o jogador que quer achar competição não encontra lugar. A vaga da quinta aba está reservada (seção 2).
- **Badge em excesso vira ruído.** Um jogador em 2 categorias pode ter até 4 pendências por mês, mais as de admin. Se o badge ficar aceso quase sempre, perde o peso que a HIG pede ("reserve badges para informação crítica"). Acompanhar quanto tempo o badge fica aceso por jogador.
- **O admin mistura papéis.** Com a seção "Como admin" na mesma aba, o jogador-admin pode confundir uma pendência dele com uma da competição. O item precisa dizer de quem é a partida.
- **O mesmo confronto no feed e na agenda.** O card do evento e o item da tarefa têm papéis diferentes (seção 6), mas o jogador pode ler como repetição. Ouvir os jogadores do beta sobre isso.
- **Histórico no perfil e na agenda.** A spec de perfil deve ter partidas recentes para a leitura competitiva (avaliar o adversário). A agenda tem o histórico do próprio jogador. Se as duas listas forem iguais para o próprio perfil, uma delas deve apontar para a outra, e a spec de perfil decide qual.
