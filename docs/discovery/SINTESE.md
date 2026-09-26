# SINTESE.md — LetzPlay

As 10 oportunidades com mais evidência no discovery de mercado, concorrentes, público e negócio, e as perguntas que só o Gabriel responde.

Pesquisa feita em 25/09/2026. Consolida os outros arquivos desta pasta e o mapa anterior (`docs/DISCOVERY.md`).

> **Sem decisões de produto.** O ranking abaixo é por **força de evidência**: quantos tipos de fonte independentes sustentam cada oportunidade, e com que recorrência. Não é uma ordem de prioridade nem uma recomendação. Uma oportunidade com evidência forte pode ficar fora do MVP por boas razões, e uma com evidência fraca pode ser a aposta certa. Essa escolha é do Gabriel.

---

## Como o ranking foi feito

Cada oportunidade foi pontuada pelos **tipos de fonte** que a sustentam. Tipos diferentes contam mais que várias fontes do mesmo tipo, porque erram por motivos diferentes.

| Sigla | Tipo de fonte | Onde está |
| --- | --- | --- |
| **R** | Regra: regulamento lido na íntegra ou regra pública de competição | `DISCOVERY.md`, `MERCADO.md`, `PUBLICO.md`, pesquisa de domínio no Linear |
| **O** | Oferta: o que os concorrentes fazem ou deixam de fazer | `CONCORRENTES.md`, `MATRIZ_FEATURES.md` |
| **V** | Voz: reviews de loja e Reclame Aqui, recorrentes em mais de um app | `VOZ_DO_USUARIO.md` |
| **C** | Comunidade: threads do Reddit sobre o mesmo tema | `VOZ_DO_USUARIO.md`, Apêndice B |
| **N** | Negócio ou mercado: modelo de receita, dado de mercado ou de público | `NEGOCIO.md`, `MERCADO.md`, `PUBLICO.md` |

**Critério de ordem:** primeiro o número de tipos de fonte; no empate, o número de menções na voz do usuário; no empate, se há fonte do BT brasileiro (e não só de padel, tênis ou pickleball).

**O que não entra na conta:** entrevista com jogador (não houve) e dado de uso do LetzPlay atual (não há acesso). São as duas fontes que mais mudariam este ranking.

---

## Top 10 oportunidades

### Visão geral

| # | Oportunidade | JTBD | Tipos | Menções (voz) | Força |
| --- | --- | --- | --- | --- | --- |
| 1 | Resultado que entra rápido e em que dá para confiar | 2, 5 | R O V C N | 4 em 2 apps + 4 threads | Forte |
| 2 | Nível do adversário e perfil em que dá para confiar | 3 | R O V C N | 13 em 4 apps + 18 threads | Forte |
| 3 | Horário e notificação confiáveis no dia do torneio | 1 | R O V | 6 em 3 apps | Forte |
| 4 | Explicar por que a posição mudou | 2, 5 | R O V C | 2 em 1 app + 5 threads | Forte |
| 5 | Regra do organizador visível e previsível para o jogador | 2, 1 | R O V N | 13 em 6 apps | Forte |
| 6 | Navegação direta para a tarefa do dia | Fundação | O V | 15 em 5 apps | Forte |
| 7 | Conta, sessão e desempenho que não atrapalham | Fundação | O V | 30 em 5 apps | Forte |
| 8 | Descobrir competição por nível e região num lugar só | 1 | O V C | 9 em 5 apps + 2 threads | Média |
| 9 | Progressão de categoria e evolução visíveis | 5 | R O V C | 3 em 2 apps + 3 threads | Média |
| 10 | Um nível de BT que atravesse arenas e federações | 2, 3 | O N | 1 pedido explícito | Média |

As oportunidades 6 e 7 têm muitas menções, mas vêm de um tipo de fonte só (reviews), e por isso ficam abaixo das que cruzam regra, oferta e voz. A 7 soma lentidão (13), conta e login (8) e suporte (9).

### 1. Resultado que entra rápido e em que dá para confiar

Lançamento pelo jogador, confirmação do adversário, prazo e auto-aprovação. Sem resultado, os JTBDs 2, 3 e 5 ficam vazios.

| Tipo | Evidência |
| --- | --- |
| R | Rankings de arena no LetzPlay já usam "lança → adversário aprova → auto-aprovação em 24h" (pesquisa de domínio) |
| O | Ranketes, DUPR, Playtomic (24h) e LetzPlay (24h, só em rankings configurados) validam pelo adversário, e nenhum arbitra a recusa. Em torneio, quem lança é o organizador (correção do `aprofundamento/`) |
| V | "2 meses e os jogos ainda estão pendentes!" (LetzPlay) · "Não lançaram meu 3º lugar no torneio" (Reclame Aqui) · "Scores take forever to update" (DUPR) |
| C | 4 threads sobre rating que demora meses (DUPR, UTR) |
| N | Hipótese H1 do `DISCOVERY.md` (cold start de dados); o valor de toda estatística paga dos concorrentes depende disso |

**O que a evidência não diz:** se o jogador de BT aceita registrar no app o jogo que combinou no WhatsApp (H2 do `DISCOVERY.md`).

### 2. Nível do adversário e perfil em que dá para confiar

Perfil único, categoria verdadeira, e um sinal de quanto o nível é confiável. Soma sandbagging, perfis duplicados e rating que "mente".

| Tipo | Evidência |
| --- | --- |
| R | CBT 2026: promoção obrigatória do top 8 nacional ou por avaliação técnica discricionária; descer só a pedido depois da virada do ano, a critério da CBT; homologação obrigatória de todo torneio de BT, com veto a material de "organizações paralelas", o que atinge a CBBT (correção do `aprofundamento/`) |
| O | Só UTR (Verified) e DUPR (Reliability Score, peso menor para autodeclarado) separam resultado confiável de autodeclarado. Nenhum app de BT faz isso |
| V | Perfil duplicado e sandbagging: 6 menções em 4 apps. Rating que não reflete o nível: 7 em 3 apps. "possui histórico dos jogadores, mas não usa essas informações para sugerir ou limitar categorias" (LetzPlay) |
| C | 15 threads sobre rating que "mente" e 3 sobre sandbagging. É o tema mais discutido fora das lojas |
| N | Integridade é argumento de venda para o organizador: sandbagging custa a credibilidade do torneio (`DISCOVERY.md` 4.2) |

### 3. Horário e notificação confiáveis no dia do torneio

Chave publicada, horário do próximo jogo e mudança de programação, com aviso que chega.

| Tipo | Evidência |
| --- | --- |
| R | CBT 2026 e FCTBT jogam no atleta a responsabilidade de acompanhar chave e horário. A programação muda por clima e atraso |
| O | O WhatsApp é quem cumpre esse papel hoje (grupo por torneio). O Meu Ranking passou a exibir o link do grupo depois da inscrição. O LiveBT existe desde 2019 só para isso |
| V | "perdemos torneios" (LetzPlay) · W.O. numa quartas de final de Brasileiro porque o app não mostrou o horário (Tênis Integrado) · "O app não notifica por push, somente por e-mail" (LetzPlay) |

**Por que está em 3º apesar de menos menções:** é a dor com a consequência competitiva mais cara da amostra (perder o jogo por W.O.).

### 4. Explicar por que a posição mudou

Mostrar a conta: quanto valeu cada resultado, fase ou W.O., e o que falta para a próxima posição ou para a linha de corte das Finals.

| Tipo | Evidência |
| --- | --- |
| R | Cada organizador tem sua tabela. W.O. dado vale −100, −30 ou +70 dependendo do ranking. Federações têm tabela por grau de torneio (pesquisa de domínio, `DISCOVERY.md` 2.2) |
| O | Nenhum app mostra a conta na tela. A regra está no regulamento ou no FAQ (Ranketes publica a sua) |
| V | "penalizing players for winning against lower-rated teams" (DUPR) |
| C | 5 threads sobre rating que cai depois de vitória, sem explicação (DUPR, UTR) |

**Ressalva:** a voz vem de apps de **rating algorítmico**. No BT, o ranking é por **pontos**, e a regra é mais simples de explicar. A dor de "não entendi a conta" no ranking por pontos é inferida, não observada.

### 5. Regra do organizador visível e previsível para o jogador

O jogador reclama com o app de coisas que o organizador decide: formato de chave, divisão de nível, prazo de lançamento, política de cancelamento. E muitas vezes não escolheu o app.

| Tipo | Evidência |
| --- | --- |
| R | Regulamentos diferentes por federação e por arena, que mudam todo ano (`DISCOVERY.md` R1) |
| O | Respostas públicas dos desenvolvedores devolvem a questão ao organizador: "Basta pedir para o organizador mudar o formato" (Meu Ranking), "Cancellation policies are set by each club" (Playtomic) |
| V | 13 menções em 6 apps. 4 dizem que usam o app porque a federação, o clube ou o circuito exige |
| N | Todo modelo de receita comprovado no BT passa pelo organizador: SaaS, taxa de inscrição, filiação (`NEGOCIO.md`) |

### 6. Navegação direta para a tarefa do dia

Ver o próximo jogo, a posição no ranking e o resultado a confirmar sem procurar. É o problema 2 do audit do `CLAUDE.md` (arquitetura de informação), agora com voz de usuário.

| Tipo | Evidência |
| --- | --- |
| O | Ninguém se diferencia por isso. O Meu Ranking, com a melhor nota do BT (4,5★ na App Store), tem reviews curtas elogiando que "as barragens fluem" |
| V | 15 menções em 5 apps, a dor mais citada da amostra. "Mais que 3 cliques pra ver informação simples" · "Sempre que entro no app é necessário ficar procurando a informação" (LetzPlay) |

### 7. Conta, sessão e desempenho que não atrapalham

Login que persiste, cadastro que funciona, conta que se exclui, app rápido e suporte que responde.

| Tipo | Evidência |
| --- | --- |
| O | O próprio LetzPlay lançou em 24/08/2026 uma versão para "preservar a sessão após atualizações". O Tênis Integrado prende o CPF numa conta cancelada |
| V | Lentidão e bugs: 13 menções em 5 apps. Conta e login: 8 em 3 apps. Suporte: 9 em 5 apps. "começou a deslogar os usuários depois de poucos minutos" (LetzPlay) · "não reconhece meu login … no meio do torneio" (Tênis Integrado) |

**Leitura descritiva:** o LetzPlay atual declara quase todas as features dos JTBDs 1 a 4. As queixas são de confiabilidade e de navegação, não de feature ausente (`MATRIZ_FEATURES.md`, seção 4).

### 8. Descobrir competição por nível e região num lugar só

| Tipo | Evidência |
| --- | --- |
| O | Pelo menos 8 plataformas de inscrição no Brasil, mais Sympla e Instagram. Nenhum agregador nacional encontrado |
| V | Filtros ruins de nível, local e horário: 9 menções em 5 apps. Elogio mais recorrente da amostra: "achar jogo, torneio e gente do mesmo nível" (6 em 3 apps) |
| C | 2 threads |

**Por que é Média:** a demanda vem quase toda de apps fora do BT (Playtomic, UTR). No BT brasileiro, a única voz é "fácil de encontrar os torneios" (elogio ao Meu Ranking).

### 9. Progressão de categoria e evolução visíveis

Subir de D para C como evento, evolução ao longo da temporada, marcos.

| Tipo | Evidência |
| --- | --- |
| R | Promoção de categoria é regra formal: CBT (top 8 sobe), FMT (top 10 D→C), FPT (campeão da D sobe). FCTBT conta as 7 melhores pontuações da temporada |
| O | Gráfico de evolução só no plano pago (Playtomic, UTR, DUPR). No BT, só o Ranketes declara selo (top 10) |
| V | "Rating preso" que não acompanha a evolução: 2 menções. Estatística paga que não entrega: 1 |
| C | 3 threads ("Stuck at 2.5 DUPR … Now Playing at 4.0") |

**Ressalva:** a progressão D → C → B → A como eixo da carreira amadora é hipótese (HP7 do `PUBLICO.md`). A regra existe; o valor emocional não foi medido.

### 10. Um nível de BT que atravesse arenas e federações

Hoje cada arena, circuito, CBT e CBBT tem seu ranking, e o jogador tem um número diferente em cada um.

| Tipo | Evidência |
| --- | --- |
| O | UTR, DUPR, ITF WTN e Playtomic não cobrem BT. É a ausência mais confirmada da pesquisa. No pickleball, o DUPR virou padrão da federação e sincroniza com as plataformas de torneio |
| N | Rating é o que o mercado cobra do jogador fora do BT (UTR US$ 10/mês, DUPR+ US$ 29,99/ano). No BT brasileiro não há assinatura de jogador |

**Por que é Média:** a oferta é forte (ninguém faz), mas a demanda no BT é quase nula. Há um pedido explícito, e é num app de padel. Um elogio do UTR contrasta rating com ranking por pontos ("some people just play tournaments to get points"), o que toca a mesma questão.

---

## Abaixo do corte

Oportunidades com evidência, mas menos que as 10 acima.

| Oportunidade | JTBD | Por que ficou fora | Força |
| --- | --- | --- | --- |
| Rating de dupla com parceiro variável | 3, 5 | Problema aberto até fora do BT (UTR, DUPR, Playtomic). Depende da pergunta D2 do feed (ranking individual ou por dupla) | Média |
| H2H com os dois recortes (dupla e jogador) | 3 | Já é table stakes no BT (LetzPlay, Meu Ranking, Ranketes). O diferencial seria o recorte, com evidência só do padel profissional | Média |
| Marcação do jogo de ranking dentro do app | 2 | Só o Ranketes oferece. Nenhuma review pede. O Meu Ranking foi na direção oposta (link para o WhatsApp) | Média (oferta); sem demanda |
| Feed de atividade e camada social | 4 | Oferta abundante (LetzPlay, Ranketes, Playtomic), demanda quase nula na amostra: 1 elogio e 1 queixa. Ausência em review não prova ausência de valor | Fraca |
| Retrospectiva do ano | 5 | Nenhum app de raquete de ranking faz; só Rivals e Strava (pago) | Fraca |

---

## O que mudou em relação ao `DISCOVERY.md`

Achados que corrigem ou atualizam o mapa anterior.

| Tema | No `DISCOVERY.md` | Agora | Fonte |
| --- | --- | --- | --- |
| Nota do LetzPlay | 2,8★ nas duas lojas, 250 mil+ downloads | App Store 2,8★ (217); **Google Play 3,9★ (238), 100 mil+** | Lojas lidas em 25/09/2026 |
| LetzPlay atual | Incumbente parado | **Em transição:** v10 (19/08/2026) com "nova identidade visual" e "infraestrutura para uma nova fase"; v11 (24/08/2026) corrige sessão | Histórico de versões da App Store |
| Taxa do LetzPlay | Não encontrada | **Pix 1,5% (mín. R$ 3), boleto R$ 3, cartão R$ 1,70 + 2,51%**, cobrada do organizador | Help center do LetzPlay (lido) |
| Taxa do Tênis Integrado | Não encontrada | **R$ 9 por inscrição** (regulamento FET 2025/26) | Regulamento lido |
| Playtomic Manager | €59–119/mês | **US$ 119–349/mês**, 6.700 clubes | Página de preços (lida) |
| Concorrente novo | — | **Ranketes** (2026): confirmação pelo adversário, desafio com data, H2H da temporada, Finals, selos, preço público. Uso quase nulo (1 avaliação iOS, 50+ downloads Android): desde 26/09 é referência pontual, não concorrente a monitorar | Site (lido); lojas lidas no aprofundamento |
| Melhor avaliado do BT | — | **Meu Ranking**: 4,5★ (123) na App Store | Loja (lida) |
| Base competitiva formal | 1,1 mi praticantes | **~65 mil cadastros** somando 8 páginas de federações e circuitos no LetzPlay. Duas ordens de grandeza abaixo | Contadores públicos (resumo de busca) |
| Brasil no ITF | "Brasil tem 60% dos jogadores" | **180 torneios ITF em 2025**, líder mundial, mas no máximo ~1/3 do calendário. O "60%" não tem denominador | FPT sobre calendário ITF (resumo) |
| Perfil | Contradição 54% homens × maioria feminina | **4 estudos locais independentes dão maioria feminina**, adultos de 25–45, classe A/B. Só o número da CBT (sem método) diz o contrário | `PUBLICO.md` |

---

## Riscos que a evidência levanta

Descritivos. Não são recomendações.

| # | Risco | Evidência | Força |
| --- | --- | --- | --- |
| RS1 | **O incumbente está se redesenhando ao mesmo tempo.** O LetzPlay atual anunciou nova identidade e "nova fase" em agosto de 2026 | Histórico de versões lido | Forte |
| RS2 | **Um entrante já ocupa o discurso das lacunas** do jogador competitivo (confirmação, desafio, H2H da temporada, Finals) | Site do Ranketes lido. Uso quase nulo nas lojas (aprofundamento) | Forte (discurso); **rebaixado**: uso quase nulo |
| RS3 | **O público competitivo formal pode ser pequeno.** ~65 mil cadastros em circuitos no LetzPlay × 1,1 mi praticantes estimados | `MERCADO.md` D2 | Fraca (contadores parciais) |
| RS4 | **O jogador muitas vezes não escolhe o app.** A federação, a arena ou o circuito escolhe, e o jogador segue | 4 reviews em 3 apps; white-label por arena | Forte |
| RS5 | **O WhatsApp resolve o dia do torneio e a marcação**, e quem tentou substituí-lo (Meu Ranking) passou a apontar para ele | `CONCORRENTES.md` 1.3 e 5 | Média |
| RS6 | **Nenhum número de mercado do BT tem metodologia pública** | `MERCADO.md` seção 8 | Forte (a ausência) |

---

## Perguntas abertas

Só o Gabriel responde. Cada uma muda a leitura das oportunidades acima. As decisões de 26/09 estão registradas abaixo da pergunta correspondente.

1. **Qual é a relação do redesign com o LetzPlay atual, agora que ele lançou nova identidade e "nova fase" em agosto de 2026?** Portfolio independente, proposta para a própria empresa, ou produto que compete com ela? Muda o peso da oportunidade 5 (organizadores já estão no LetzPlay) e do risco RS1. Refina a pergunta 2 do `DISCOVERY.md`.
   - **Adiado (26/09)** para a issue de decisões estratégicas do time Product no Linear.
2. **O público do beta é o competidor federado (CBT, CBBT, circuitos) ou o jogador de ranking de arena?** As regras, as dores e o tamanho são diferentes (RS3). Ligada à pergunta aberta de formato de ranking da pesquisa de domínio, que continua em aberto.
3. **A visão do organizador continua fora do MVP?** As oportunidades 1, 3 e 5 dependem de quem lança resultado e publica a programação, e em torneio esse alguém é o organizador. O `docs/PRODUCT.md` tira a visão do organizador do MVP.
4. **O coração do produto é ranking por pontos (padrão do BT) ou algo como um nível de jogo (oportunidade 10)?** São coisas diferentes, com dores diferentes: pendência e regra no ranking, "o número mente" no rating.
5. **Qual é a postura diante do WhatsApp:** substituir, integrar (como o Meu Ranking) ou ignorar? Muda a leitura das oportunidades 3 e 1 e do "abaixo do corte" de marcação.
6. **O Ranketes é referência, concorrente, ou irrelevante para o objetivo de portfolio?** Ele já declara boa parte das lacunas (RS2).
   - **Decidido (26/09):** referência pontual, não concorrente a monitorar. Uso quase nulo, segundo o `aprofundamento/TEARDOWN.md`.
7. **Dá para fazer 5 a 8 entrevistas com jogadores competitivos e 2 a 3 com organizadores antes do beta?** É a lacuna de evidência mais cara: a voz do BT brasileiro na amostra é pequena, e as dores de organizador e arena vêm quase só de marketing de fornecedor. Dado de uso do LetzPlay atual (se houver acesso) seria a fonte mais forte de todas.
   - **Suspensa (26/09):** não há pesquisa com usuários por agora. Entrevistas ficam para um momento posterior.
8. **O perfil majoritariamente feminino dos estudos locais muda algo no tom e nos textos?** Conecta com a pergunta D7 do feed (gênero gramatical).
   - **Decidido (26/09):** coberto, por ora, pelos textos neutros e pela concordância com a categoria.

---

## Nota de método: uso de ferramentas

- **Firecrawl:** 50 chamadas das 60 permitidas (1 na coordenação, 12 em concorrentes, 22 em voz do usuário, 7 em mercado e público, 8 em negócio). Umas 10 foram recusadas por limite de requisição por minuto ou voltaram vazias, e entraram na conta mesmo assim. Nenhuma chamada usou o modo Alexandria nem `firecrawl_find_tools`.
- **Busca nativa:** o limite de buscas da sessão (200) se esgotou perto do fim. Alguns pontos ficaram com fonte única e estão marcados assim nos arquivos.
- **Lido × resumo:** cada arquivo marca o que foi lido na íntegra e o que foi visto só pelo resumo do mecanismo de busca. Antes de citar um número isolado, abra a fonte.
