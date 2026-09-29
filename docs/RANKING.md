# RANKING.md — LetzPlay

Spec da tela de ranking: a classificação de uma categoria, como o jogador troca de categoria, como vê a própria posição e o quanto ela mudou, a linha de corte da final, a página da competição e os estados da classificação. Dá também os critérios de aceite do RankingRow e do ZoneDivider.

> Este doc decide **o que o jogador vê na classificação e como a lê**. As regras que produzem a classificação (pontuação, desempate, fotos por rodada, final, inscrição encerrada) estão em `docs/DOMAIN.md` e **não são reabertas aqui**. O cálculo já existe: `computeStandings` (`src/lib/domain/standings.ts`) e `cutoffLine`/`closeRound` (`src/lib/domain/roundClose.ts`). Onde a classificação mora na navegação é do `docs/NAVIGATION.md` (N…). As regras deste doc são numeradas **RK1, RK2…**, para não colidir com as R do domínio, as M da marcação, as N da navegação e as RG do registro de resultado. Rotas são propostas; nomes de componente são para a auditoria do DS.

---

## Fontes

As siglas de decisão são as do `docs/DOMAIN.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DEC-FINAL** | Linha de corte só na tela de ranking, sem badge de "zona" (R23); vaga por posição na data de corte (R28) |
| **DEC-RESP** | Tabela ao vivo e evento "subiu N" por fim de rodada (R46); desempate fixo (R37); inscrição encerrada congelada (R45) |
| **DEC-RANK** | Decisões do Gabriel na issue desta spec (27/09/2026): aprovação com as recomendações de RQ1 a RQ7 e as leituras RL1 a RL9, e confirmação da RL10 e da RL11 em 28/09/2026; a queda aparece na tabela, e a R22 passa a valer só para o feed e as notificações |
| **DEC-NAV** | Decisão do Gabriel (26/09), registrada no `docs/NAVIGATION.md`: **ranking como lista completa, com a linha da própria dupla fixada** |
| **NAV** | `docs/NAVIGATION.md`: aba Competições com a lista "Minhas competições" (N1, N29), rota da classificação e da competição (N9, N10), área "Administrar" da competição (N31), toque do card de movimentação rolando até a linha da dupla, vazio, carregando e erro (N22–N24). As perguntas Q1–Q5 de lá foram respondidas pelo Gabriel em 29/09/2026 |
| **RES** | `docs/RESULTS.md` (em revisão), §8.1: impacto no ranking logo depois da confirmação (RG18) |
| **CARDS** | `docs/FEED_CARDS.md` §8: card de movimentação, gramática posição + delta + pontos, queda sem fundo de cor |
| **REF** | `docs/discovery/referencias/01-ranking.md` (50 telas de 30 apps, Mobbin) e `inventario-componentes.md` |
| **DSC** | `docs/DISCOVERY.md`: oportunidades 2.2 (explicar a pontuação) e 2.3 (corrida à final com linha de corte) |
| **WCAG** | WCAG 2.2: 1.4.1 (uso de cor), 1.4.11 (contraste de não texto), 2.5.8 (tamanho do alvo); WAI-ARIA APG (não tem padrão de leaderboard) |
| **LEIT** | Leitura do agente desta spec. RL1–RL11 confirmadas pelo Gabriel (DEC-RANK; RL10 e RL11 em 28/09/2026). A lista está na seção 11 |

---

## 1. Princípio

**Onde eu estou, em um olhar; quem está em volta, em um gesto.** O JTBD 2 é "quando um resultado é registrado, quero ver imediatamente como minha posição foi afetada, para decidir como agir". Decidir como agir pede duas coisas: a própria posição (e o quanto mudou) e o contexto de quem está perto, acima e abaixo, e da linha da final. A tela entrega as duas sem trocar de modo: a lista completa é o contexto, e a linha da própria dupla nunca sai da vista (DEC-NAV).

O ranking é o coração emocional do produto: subir motiva, descer frustra (`PRODUCT.md`). A tela **sustenta** essa carga sem inflá-la:

| Momento | O que a tela faz | O que ela evita |
| --- | --- | --- |
| Subiu | Delta verde com seta e número na linha da dupla | Celebrar posição que não mudou (REF, CARDS §8.6) |
| Caiu | Delta com seta e número, cor só no indicador. A queda aparece na tabela para todos, mas nunca vira publicação nem notificação para outros (R22) | Fundo vermelho, alerta, linha inteira em cor de atenção (CARDS §8.3, RES §8.1) |
| Perto da linha da final | A linha de corte com texto diz o que ela significa | "Garantia matemática" ou projeção, que o domínio não usa (R28) |

---

## 2. Onde a tela mora

- **RK1. A classificação é uma tela por categoria e temporada** (rota proposta `/ranking/[categoria]`, com a temporada atual; temporada encerrada em `/ranking/[categoria]?temporada=[id]`). É a mesma tela vinda da aba Competições, do card do feed, da notificação, do perfil e da página da competição (N10). [NAV N10]
- **RK2. A classificação abre pelo item da lista "Minhas competições" da aba Competições** (NAV N29): cada ranking do jogador aparece lá com a posição e o delta (StandingSummaryItem), e o toque abre a classificação daquela categoria. A aba não abre direto numa classificação. Os vazios da aba são da navegação (NAV 9.2); os da classificação estão na seção 8. [NAV N29; DEC-NAV-Q Q1, Q4, que substitui a RL1]

  **Por quê:** a lista já responde "onde estou" em todas as categorias de uma vez, sem abrir a tabela. O toque a mais só existe para quem quer ver quem está em volta.
- **RK3. O card de movimentação e o de marco abrem a classificação rolada até a linha da dupla** (NAV, "Destino de cada toque"). O card de resultado e o de confronto abrem pelo cabeçalho de competição. [NAV]

---

## 3. Anatomia da classificação

```
┌──────────────────────────────────────────────┐
│ ‹ Voltar                                     │  ← cabeçalho de tela de detalhe (NAV seção 3)
│ ┌──────────────────────────────────────────┐ │
│ │ Ranking BH · Masculino B            ⌄    │ │  ← seletor de categoria (RK6)
│ └──────────────────────────────────────────┘ │
│ 1º semestre 2026 · Rodada 3 de 4             │  ← contexto da temporada (RK4)
│ Rodada fecha em 5 dias · Corte em 30/11      │
│ Como funciona a pontuação ›                  │  ← link para as regras (RK5)
├──────────────────────────────────────────────┤
│  1  [av][av] Lucas Silva e Rafael Costa  610 │
│              6 jogos · 5 vitórias      ▲ 1   │
│  2  [av][av] Ana Souza e Bia Lima        598 │
│              6 jogos · 5 vitórias      ▼ 1   │
│  …                                           │
│  8  [av][av] Caio Reis e Davi Melo       402 │
│ ── Classificam para a Saideira · 8 vagas ──  │  ← ZoneDivider (RK13)
│  9  [av][av] Você e Pedro Alves          390 │  ← linha da própria dupla (RK9)
│              5 jogos · 3 vitórias      ▲ 2   │
│              Faltam 12 pts para o 8º         │  ← distância da vaga (RK11)
│ 10  …                                        │
└──────────────────────────────────────────────┘
```

### 3.1 Cabeçalho da classificação

- **RK4. O cabeçalho diz em que momento da temporada a tabela está:** nome da temporada, rodada atual ("Rodada 3 de 4", ou "Rodada 3" quando o ranking não fixa o total), o prazo da rodada em tempo restante ("fecha em 5 dias") e, quando a temporada tem final, a data de corte ("Corte em 30/11"). Depois da data de corte: "Classificação final da Saideira definida". Temporada encerrada: "Temporada encerrada em 15/12". [R7, R27, R28; REF, padrão "temporada e contagem regressiva"]
- **RK5. "Como funciona a pontuação" leva às regras da competição** (seção 7), na seção de pontuação. É a resposta à oportunidade 2.2 do discovery (explicar por que subi ou desci): cada ranking tem a própria tabela (R9), e ela precisa estar a um toque da classificação. [DSC 2.2, R9, R37]

### 3.2 Trocar de categoria

- **RK6. O seletor de categoria é um botão com o nome da competição e da categoria**, que abre uma folha (o `Dialog` do DS, BottomSheet no celular). A folha tem duas partes: [DEC-RANK RQ2]
  1. **"Suas categorias":** um item por inscrição ativa do jogador (StandingSummaryItem, seção 9), com a posição atual e o delta de cada uma. O jogador vê todas as suas posições de uma vez, sem abrir uma por uma.
  2. **"Outras categorias":** as categorias da mesma competição em que ele não está inscrito, com o número de inscritos ("16 duplas", `formatEnrollmentCount`). Serve para acompanhar um amigo em outra categoria ou olhar a categoria de cima.

  Com uma inscrição só e sem outras categorias na competição, o seletor vira texto (sem ⌄ e sem toque).

  O seletor fica **dentro** da classificação, não no cabeçalho da aba (NAV seção 3): troca de categoria sem voltar à lista "Minhas competições". Aparece também com uma inscrição só, quando a competição tem outras categorias, para o jogador poder olhar a categoria de um amigo.
- **RK7. Não há filtro de região nem de nível no MVP.** A classificação já é de uma categoria, e a categoria já é gênero + nível + idade (R4): filtrar por nível dentro dela não tem o que filtrar. Região e nível são filtros de **descoberta** de competição (JTBD 1), que no MVP é o Explorar sem filtros (NAV N33); os filtros ficam fora do MVP. Nem filtro dentro da tabela: com 6 a 40 duplas por categoria (DOMAIN §7, `FEED_CARDS.md` §11.4), a lista rola em poucos gestos, e a própria linha está sempre à vista (RK9). [R4, NAV N33; DEC-RANK RQ1]

---

## 4. A linha da classificação

- **RK8. Cada linha mostra, nesta ordem:** posição, a unidade competidora (avatar e nome; em duplas, os dois avatares sobrepostos e "Nome1 e Nome2"), os pontos e o delta. A linha de apoio mostra jogos e vitórias ("6 jogos · 5 vitórias"). [R1, R8, R18; DEC-RANK RQ3]

  **Como se contam** (da inscrição, na temporada):
  - **Jogos:** partidas confirmadas em que houve jogo, com resultado normal ou desistência. **W.O., W.O. duplo e partidas canceladas ficam fora**, como no `total_matches` (R18) e no cartel do perfil (`PROFILE.md`, PF6).
  - **Vitórias:** os jogos vencidos, pela mesma conta. Vitória por W.O. não entra.

  Assim, "jogos" e "vitórias" têm uma só definição no app inteiro, e vitórias nunca passam de jogos. **A diferença para o desempate é explícita:** o critério "vitórias" da R37 conta o W.O. vencido; a linha, não. A página de regras diz isso na ordem de desempate (RK17), e a linha de uma dupla com W.O. vencido explica os pontos pelas regras, não pela contagem.

  **Por que jogos e vitórias:** no meio da rodada, duas duplas com pontos diferentes podem ter jogado números diferentes de partidas. Os dois explicam a ordem na maioria dos casos sem abrir outra tela. Saldo de games fica fora da linha: é o último critério antes do admin e aparece nas regras (RK5).
- **Nome em duplas:** o jogador logado aparece como "Você" ("Você e Pedro Alves"), como na tela do confronto (RES, RG3). Nomes longos truncam o sobrenome antes do primeiro nome; o nome completo fica no nome acessível.
- **Pontos** em `label-lg` bold, alinhados à direita com algarismos tabulares (`font-variant-numeric: tabular-nums`), para a coluna não dançar entre 98 e 610.
- **Posição** em `title-sm` bold, largura fixa para 2 dígitos. Sem medalha, troféu ou pódio no top 3 (seção 4.3).

### 4.1 A própria linha

- **RK9. A linha da própria dupla tem destaque e nunca sai da vista.** Quando ela está na área visível, aparece no lugar dela, destacada. Quando sai por baixo, uma cópia fixa aparece no rodapé da lista, acima da tab bar; quando sai por cima, a cópia fixa aparece no topo, abaixo do cabeçalho. Tocar na cópia rola a lista até a linha. [DEC-NAV; REF, caminho A; DEC-RANK RL2]
- **RK10. Destaque da própria linha:** fundo sutil (`--color-background-secondary`) e o nome "Você e …". Sem fundo de marca cheio: o coral fica perto do vermelho de queda e competiria com o delta na mesma linha (REF, "o que evitar"), e a regra do DS reserva o coral para ação e o grafite para seleção (`TOKENS.md`), e a própria linha não é nenhum dos dois. [TOKENS; REF; DEC-RANK RQ5]
- **Acessibilidade da cópia fixa:** a cópia é `aria-hidden` e não recebe foco; o leitor de tela lê a linha só no lugar dela. Para quem navega por teclado ou leitor, um link "Ir para a minha posição" no cabeçalho (visível só no foco) faz o mesmo que tocar na cópia. [REF, "Acessibilidade"; WCAG]
- **Mais de uma dupla do jogador na mesma categoria** acontece só com a inscrição encerrada de uma troca de parceiro (R45). A linha fixada é a da inscrição ativa; a encerrada aparece na tabela como as outras encerradas (4.4).
- **Categoria em que o jogador não está inscrito** (vinda de "Outras categorias" ou do card de um amigo): nenhuma linha destacada nem fixada.

### 4.2 Distância até a vaga

- **RK11. Quando a dupla está abaixo da linha de corte, a própria linha mostra quantos pontos faltam para a última vaga:** "Faltam 12 pts para o 8º". Dentro da zona, nada: o ZoneDivider já diz que ela está dentro. Some depois da data de corte. [DSC 2.3, R28; DEC-RANK RQ4]

  **Por quê:** é a informação que decide como agir ("preciso ganhar os dois jogos da rodada") e cabe na regra do domínio: é distância em pontos para a posição, não garantia matemática de vaga (R28). Mostrar "12 pts acima do 9º" para quem está dentro transformaria a folga em ameaça a cada rodada.

### 4.3 Delta

- **RK12. O delta de cada linha compara a posição ao vivo com uma foto de fim de rodada** (a foto da classificação, R46), e aparece em todas as linhas, nos dois sentidos: a queda não é escondida na tabela (R22). A base muda assim: [R22, R46, CARDS §8; DEC-RANK RL10]
  - **Do fechamento da rodada N até o primeiro resultado confirmado da rodada N+1:** a base é a foto do fim da rodada N−1. Nesse intervalo a posição ao vivo é a própria foto de N, então a tabela mostra exatamente o delta do card "subiu N" que acabou de sair no feed, e o card que leva à tabela (RK3) encontra o mesmo ▲ 2 na linha.
  - **Do primeiro resultado confirmado da rodada N+1 em diante:** a base passa a ser a foto do fim da rodada N, e o delta mostra quanto a dupla andou na rodada em curso.
  - **Posição igual:** a linha não mostra delta. O traço de "manteve" do DeltaIndicator fica para contextos em que a ausência confundiria (o StandingSummaryItem, seção 9); na tabela, uma coluna de traços é ruído.
  - **Primeira rodada da temporada:** não há foto anterior, e nenhuma linha mostra delta até o primeiro resultado confirmado da 2ª rodada (como o marco na 1ª rodada, CARDS §8.6).
  - **Dupla que entrou depois da última foto** (inscrição nova, troca de parceiro): sem delta.
  - O delta usa o DeltaIndicator do DS: seta, número e cor, e o sentido no nome acessível ("Subiu 2 posições"). Nunca só cor (WCAG 1.4.1).

  **Por que o primeiro resultado, e não o sorteio:** entre o fechamento e o primeiro resultado a tabela não muda, e o delta de fechamento continua sendo a notícia. O sorteio não mexe em posição nenhuma; trocar a base nele zeraria os deltas de todas as linhas sem que nada tivesse acontecido.

  **Diferente do RG18 do `RESULTS.md`:** a tela do confronto compara com a posição **antes daquela partida**, para mostrar a causa direta de um resultado. A tabela compara com o **fim da rodada**, porque ela é lida por várias duplas ao mesmo tempo e precisa de uma base comum.

- **Top 3 sem tratamento especial.** Sem pódio, medalha nem coroa. No ranking de arena, o topo são pessoas que o jogador conhece e enfrenta na rodada, não um topo inalcançável; e a zona que importa é a da final (4.5). O Líder já tem o marco no feed (R47). [REF, padrão 5; DEC-RANK RL4]

### 4.4 Linhas com situação especial

| Situação | Como a linha aparece | Origem |
| --- | --- | --- |
| **Inscrição encerrada** (troca de parceiro) | Continua na posição dela, com o texto em `--color-foreground-secondary` e um Badge neutro "Encerrada". Não conta para a linha de corte: a vaga passa para a próxima ativa (4.5) | R45, `cutoffLine` |
| **Empate em todos os critérios** (`awaiting_admin`) | Badge neutro "Empate" nas linhas empatadas, e uma nota abaixo da tabela: "Ordem provisória até a decisão do admin (critério final de desempate)" | R37, `computeStandings` |
| **Nenhum jogo confirmado na temporada** | Seção 8.2: sem posição, em ordem alfabética | DEC-RANK RL6 |

### 4.5 Linha de corte da final

- **RK13. Com final na temporada, um ZoneDivider separa a última vaga da primeira fora dela**, com texto: "Classificam para a [nome da final] · N vagas" antes da data de corte e "Classificados para a [nome da final]" depois dela. É a única marca de zona da tela: nenhuma linha ganha badge de "zona" (R23). [R23, R27, R28, DEC-FINAL; REF, divisor com texto]
- **A linha fica depois da N-ésima inscrição ativa**, não depois da posição N: uma encerrada dentro da zona não ocupa vaga (R45). Com 8 vagas e uma encerrada em 5º, o divisor fica depois do 9º.
- **Empate atravessando a linha** (`cutoffLine` devolve `awaiting_admin`): o divisor ganha uma segunda linha, "Empate na última vaga: decisão do admin".
- **Temporada sem final:** sem divisor. O Top N dos marcos (N = 10, R47) é evento do feed, não zona da tabela.
- **Categoria com menos inscrições ativas que vagas:** sem divisor, e o cabeçalho diz "Todas as duplas se classificam para a [nome da final]".

---

## 5. Toque na linha

- **RK14. Em simples, tocar na linha abre o perfil do jogador. Em duplas, abre uma folha com os dois jogadores**, cada um um item que leva ao perfil dele. A linha inteira é um alvo só (48px de altura mínima, `TOKENS.md`). [NAV N10; DEC-RANK RQ6]

  **Por que não dois links, um em cada nome:** cada nome na linha tem 20px de altura, abaixo da área tocável de 48px do DS, e dois alvos colados numa linha estreita no celular são o caminho do toque errado (WCAG 2.5.8). Não existe página de dupla no MVP, e a folha resolve a escolha em um toque.
- O conteúdo do perfil (leitura social e competitiva) é da spec de perfil. A tela de H2H é da spec de H2H; se ela entrar na folha, é decisão de lá.

---

## 6. Temporada e tempo

- **RK15. A classificação mostra a temporada atual.** Depois do fim, a temporada encerrada continua na tela até a próxima começar, com o cabeçalho "Temporada encerrada" e a tabela final; a linha da própria dupla continua fixada. Quando a próxima começa, a encerrada mais recente fica acessível por um link no cabeçalho ("Temporada anterior") até o fim da nova. [R8, R27; NAV 9.2; DEC-RANK RL7]
- **RK21. Toda temporada encerrada tem a própria classificação, na mesma tela** (`/ranking/[categoria]?temporada=[id]`), no estado "Temporada encerrada" da RK15. É o destino do toque numa temporada da seção "Temporadas" do perfil (`PROFILE.md`, PF19): a tela abre rolada até a linha da dupla daquela temporada, destacada como a própria linha quando o jogador está nela. A classificação só oferece a temporada anterior (RK15); as mais antigas chegam pelo perfil, que é onde mora a evolução. [NAV N10; DEC-RANK RL11]
- **Temporadas mais antigas e a evolução de posição ao longo do tempo** (JTBD 5) ficam com a spec de perfil, combinado com ela no Linear.
- **RK16. A tabela atualiza ao vivo** (R46): uma confirmação muda a tabela na próxima visita ou ao puxar para atualizar. Não há atualização em tempo real com a tela aberta no MVP. Uma confirmação que muda a posição da própria dupla enquanto a tela está aberta aparece na próxima carga, sem animação. [R46; DEC-RANK RL8]
- **Sem tela de celebração ao subir.** O momento de subir já tem dois lugares: a tela do confronto logo depois da confirmação (RES, RG18) e o card do feed no fim da rodada (CARDS §8). Uma terceira, interrompendo a abertura do app, repetiria o mesmo momento. [RES, CARDS; DEC-RANK RQ7]

---

## 7. Página da competição (ranking)

A página da competição existe e não é aba (NAV N9); o conteúdo, no ranking, é desta spec. Rota proposta `/competicoes/[competicao]`.

- **RK17. A página tem quatro blocos, nesta ordem:** cabeçalho, categorias, temporada e regras. Dois blocos entram logo abaixo do cabeçalho conforme quem vê: para quem ainda pode se inscrever, "Como se inscrever" e "Tenho interesse" (NAV N33; quando cada um aparece está em `EXPLORE.md`, EX26 e EX27); para o admin da competição, a entrada da área "Administrar" (NAV N31). [NAV N9, N31, N33; DEC-RANK RL9]

| Bloco | Conteúdo |
| --- | --- |
| **Cabeçalho** | Organização (avatar e nome, que levam à página da organização, NAV N34) e nome da competição |
| **Categorias** | Uma linha por categoria (ListItem): nome da categoria, "16 duplas", e, quando o jogador está inscrito, a posição dele (StandingSummaryItem). Toque → classificação |
| **Temporada** | Nome e datas, rodada atual com o prazo, número de jogos por rodada; final: nome, vagas e data de corte |
| **Regras** | Formato da partida (R29, texto do formato); a tabela de pontos do ranking (R9–R11, R36) em linguagem de jogador ("Vitória: 100 pontos, mais 2 por game vencido e menos 2 por game perdido"), com o exemplo do 6/4 6/3 calculado pela regra do próprio ranking; a ordem de desempate (R37), com a nota de que ali a vitória por W.O. conta, diferente da linha da tabela (RK8); o prazo para confirmar (R14); o que acontece sem jogo no prazo da rodada (R40) |

- **RK18. As regras mostram os valores do ranking, não os padrões do app.** Cada ranking guarda a própria tabela (R9); a página lê a `ScoringRule` da competição. O exemplo usa `matchPoints` com a regra dela.
- **Ações do admin na página:** ficam na área "Administrar" da competição (NAV N31), visível só para o admin dela. Entre elas, "Lançar sorteio da rodada N", disponível só quando a rodada anterior fechou (R7, R15). **O fluxo do sorteio não é desta spec:** o botão existe, e o fluxo vira issue própria (seção 12).

---

## 8. Estados

### 8.1 Vazio da classificação

- **RK19. Nenhum estado vazio deixa a tela sem próximo passo** (NAV N22). Os vazios de quem não tem inscrição (jogador novo, ou só temporadas passadas) são da aba Competições, que é por onde a classificação abre (RK2, NAV 9.2). A classificação em si é sempre de uma categoria: quem a abre sem estar inscrito vê a tabela sem linha destacada (8.4). O vazio que sobra para ela é o da competição sem temporada:

| Situação | Título | Apoio | Ação |
| --- | --- | --- | --- |
| **Ranking sem temporada em andamento** (competição sem temporada aberta) | "Nenhuma temporada em andamento" | "A próxima temporada do [Ranking] ainda não começou." Abaixo, a tabela final da última, se houver | "Ver regras do ranking" |

Usa o `EmptyState` do DS (ícone opcional, título, apoio e uma ação).

### 8.2 Vazio da tabela

- **RK20. Temporada aberta sem nenhuma partida confirmada:** a tabela lista as inscrições em ordem alfabética, **sem posição e sem pontos**, com a nota "A classificação começa com o primeiro resultado confirmado." Sem ZoneDivider. [DEC-RANK RL6]

  **Por quê:** o `computeStandings` devolve todas as linhas empatadas com `awaiting_admin`, porque 0 a 0 é empate em todos os critérios. Mostrar "1º a 16º" com 0 ponto sugeriria uma ordem que não existe, e o Badge "Empate" em todas as linhas seria ruído.
- **Categoria com uma inscrição só:** a tabela mostra a linha, sem divisor.

### 8.3 Carregando e erro

- **Carregando:** cabeçalho e seletor na hora; a tabela como 8 linhas de Skeleton no formato do RankingRow (círculo do avatar, duas linhas de texto e o bloco dos pontos). Nada de spinner em tela cheia (NAV N23).
- **Erro:** no lugar da tabela, um Alert com "Tentar de novo"; se já havia tabela carregada, ela fica, com o aviso "Pode estar desatualizada" (NAV N24).
- **Tabela e cópia fixa carregam juntas:** a linha fixada nunca aparece antes da tabela, para não mostrar uma posição sem contexto.

### 8.4 Mapa de estados

| Temporada | Jogador | O que a tela mostra |
| --- | --- | --- |
| Aberta, sem jogos confirmados | Inscrito ou não | RK20 |
| Aberta, com jogos, 1ª rodada | Inscrito | Tabela sem delta (RK12), própria linha fixada |
| Aberta, rodada ≥ 2 | Inscrito | Tabela com delta, própria linha fixada, distância da vaga se fora da zona |
| Aberta | Não inscrito na categoria | Tabela sem linha destacada |
| Depois da data de corte, antes do fim | Qualquer | Divisor "Classificados para…", sem distância da vaga |
| Encerrada | Qualquer | RK15 |
| Sem temporada | Qualquer | RK19 |

---

## 9. Componentes

**Esta spec não desenha os componentes além do necessário para os critérios de aceite.** Nome, papel e onde aparecem, para a auditoria do DS.

| Componente | Tier | Papel | Situação |
| --- | --- | --- | --- |
| **RankingRow** | 3 | Linha da classificação (seção 4) | Novo, issue de ENG já aberta. Parte do ListItem |
| **ZoneDivider** | 3 | Linha de corte da final (4.5) | Novo, mesma issue |
| **StandingSummaryItem** | 3 | "Sua posição em uma categoria": posição, delta, competição · categoria, parceiro. Na lista "Minhas competições" da aba Competições (NAV N29), na folha do seletor (RK6), na página da competição (RK17) e no perfil | Novo. Parte do ListItem |
| **PinnedStandingRow** | 3 | A cópia fixa da própria linha (RK9) | Novo. Compõe o RankingRow; o comportamento de fixar é da tela |
| **DeltaIndicator** | 1 | Delta da linha e do item | Em PR aberto |
| **ListItem**, **Badge**, **EmptyState**, **Skeleton**, **Dialog**, **Alert** | 1–2 | Base da linha, "Encerrada"/"Empate", vazios, carregando, folhas, erro | No `master` |
| **AvatarStack** | 1 | Dois avatares sobrepostos da dupla | No `master` (`ui/Avatar`) |

### 9.1 Critérios de aceite: RankingRow

Para a issue de ENG do RankingRow e do ZoneDivider.

- [ ] Recebe posição, unidade competidora (simples: 1 jogador; duplas: 2), pontos, jogos, vitórias, delta opcional e flags `isOwn`, `status` (`active` / `closed`) e `awaitingAdmin`.
- [ ] Mostra, da esquerda para a direita: posição (`title-sm` bold, largura para 2 dígitos), avatar (simples) ou dois avatares sobrepostos (duplas), nome ("Nome1 e Nome2" em duplas; "Você" no lugar do nome do jogador logado), pontos à direita (`label-lg` bold, `tabular-nums`) e, abaixo dos pontos, o DeltaIndicator quando há delta diferente de zero.
- [ ] Linha de apoio: "N jogos · N vitórias", com singular ("1 jogo", "1 vitória").
- [ ] `isOwn`: fundo `--color-background-secondary`. Nenhuma outra variação de cor na linha.
- [ ] `status = closed`: texto em `--color-foreground-secondary` e Badge neutro "Encerrada". Os pontos continuam visíveis.
- [ ] `awaitingAdmin`: Badge neutro "Empate".
- [ ] Slot opcional abaixo da linha de apoio para a distância da vaga ("Faltam 12 pts para o 8º"), em `label-md`, `--color-foreground-secondary`. A tela decide quando preencher (RK11).
- [ ] Nome longo: trunca com reticências numa linha; o nome completo fica no nome acessível.
- [ ] Altura mínima de 48px; a linha inteira é o alvo de toque (RK14). Sem toque, é estática (o ListItem já tem as três formas).
- [ ] Nome acessível: "9º, Você e Pedro Alves, 390 pontos, subiu 2 posições, 5 jogos, 3 vitórias". Os avatares são decorativos.
- [ ] Semântica: a classificação é uma lista ordenada (`<ol>`); cada linha, um item. Não é `<table>`: são poucas colunas e a linha é um card (REF, "Acessibilidade").
- [ ] Funciona de 320 a 430px sem rolagem horizontal.
- [ ] Stories: simples, duplas, própria linha, subiu, caiu, sem delta, encerrada, empate, com distância da vaga, nome longo, posição de 2 dígitos. Story-galeria com uma tabela de 10 linhas e o ZoneDivider.

### 9.2 Critérios de aceite: ZoneDivider

- [ ] Recebe o texto principal e um texto secundário opcional (o aviso de empate da 4.5).
- [ ] Uma linha horizontal com o texto centralizado sobre ela, em `label-md` bold, `--color-foreground-secondary`; a linha em `--color-border-subtle`. Sem cor de marca nem de estado.
- [ ] O texto não depende de cor para ser entendido: diz o que a linha significa.
- [ ] Semântica: é um separador **dentro** da lista ordenada, sem quebrar a numeração lida pelo leitor de tela: `<li role="separator" aria-label="…">` ou equivalente, conferido com axe no addon de a11y.
- [ ] Não é focável.
- [ ] Stories: antes do corte, depois do corte, com empate na linha, texto longo (nome de final comprido).

### 9.3 Critérios de aceite da tela (para a issue da tela, depois)

Ficam aqui para a issue da tela de ranking, que nasce da aprovação desta spec: RK1–RK21, com os casos da tabela 8.4 como stories ou testes, a linha de corte calculada por `cutoffLine`, o delta pelas fotos de fim de rodada (`closeRound`) com a troca de base da RK12 e a cópia fixa sem duplicar a leitura de tela.

---

## 10. Layout

- **Mobile (base, 393 a 430px):** uma coluna. A cópia fixa da própria linha fica acima da tab bar e respeita a área segura.
- **A partir de 600px** (trilho lateral da NAV N27): a mesma coluna, com largura máxima de conteúdo. Nenhuma coluna nova aparece no desktop: jogos e vitórias continuam na linha de apoio.

---

## 11. Decisões e leituras

### Perguntas respondidas

As perguntas desta spec foram respondidas pelo Gabriel em 27/09/2026 (DEC-RANK), todas com a recomendação, e viraram regras. Os números são RQ, para não colidir com as Q da navegação.

- **RQ1. Filtros:** só a troca de categoria, sem filtro de região ou nível → RK7.
- **RQ2. Troca de categoria:** botão que abre uma folha com "Suas categorias" e "Outras categorias" → RK6.
- **RQ3. Conteúdo da linha:** posição, dupla, pontos e delta, com jogos e vitórias na linha de apoio → RK8.
- **RQ4. Distância da vaga:** só para quem está fora da zona → RK11.
- **RQ5. Destaque da própria linha:** fundo cinza sutil, sem coral → RK10.
- **RQ6. Toque na linha de dupla:** folha com os dois jogadores → RK14.
- **RQ7. Subir no ranking:** sem tela de celebração → RK16.

Decisão à parte, na mesma rodada: **a queda aparece na tabela**, e a R22 do `DOMAIN.md` passou a valer só para o feed e as notificações → RK12.

### Leituras do agente

Confirmadas pelo Gabriel (DEC-RANK):

- **RL1.** ~~A aba abre na categoria vista por último.~~ Substituída pela Q1 e pela Q4 da navegação (29/09/2026): a aba Competições abre na lista, e a classificação abre pelo item (RK2).
- **RL2.** A cópia fixa aparece embaixo ou em cima, conforme o lado por onde a linha saiu, e tocar nela rola até a linha (RK9).
- **RL3.** A posição igual não mostra traço na tabela (RK12).
- **RL4.** Sem pódio, medalha ou coroa no top 3 (4.3).
- **RL5.** Inscrição encerrada fica na posição dela, apagada, com "Encerrada", e a linha de corte pula ela (4.4, 4.5).
- **RL6.** Temporada sem jogo confirmado mostra a lista alfabética sem posição (RK20).
- **RL7.** A temporada encerrada fica na tela até a próxima começar; depois, a classificação oferece só a anterior, por link (RK15).
- **RL8.** Sem atualização em tempo real nem tela de celebração ao subir (RK16).
- **RL9.** A página da competição tem cabeçalho, categorias, temporada e regras com os valores do próprio ranking (RK17, RK18).

Confirmadas pelo Gabriel em 28/09/2026 (saíram das correções de consistência depois da aprovação):

- **RL10.** A base do delta só avança para a foto da rodada que acabou de fechar no primeiro resultado confirmado da rodada seguinte; até lá, a tabela mostra o mesmo delta do card de fechamento (RK12).
- **RL11.** Temporadas mais antigas que a anterior chegam pelo perfil, e o toque abre a classificação daquela temporada, rolada até a linha da dupla (RK21).

---

## 12. Fora desta spec

| Item | Para onde vai |
| --- | --- |
| Fluxo do sorteio da rodada (o que o admin vê, confirmação, erro) | Issue própria, a criar depois da aprovação. O botão está na RK18 |
| Decisão do admin no empate total (R37, último critério) | O domínio não guarda essa decisão hoje (`computeStandings` só marca `awaiting_admin`). Issue própria de domínio e tela |
| Descoberta de competições com filtros de nível e região | JTBD 1. No MVP, o Explorar tem a busca e a vitrine dos organizadores do beta, sem filtros (NAV N32, N33; `PRODUCT.md`) |
| Recorte social ("só amigos" na tabela) | Futuro. Com 6 a 40 duplas por categoria, o ganho é pequeno no MVP (REF, padrão 4) |
| Histórico de temporadas e evolução da posição | Spec de perfil (JTBD 5) |
| Classificação em tempo real com a tela aberta | Futuro (RK16) |
| Torneio | Não tem classificação no MVP (R31). A página da competição de torneio é da spec que vier |

---

## 13. Métricas de sucesso

Medidas no beta com Rankin e Vila. Sem meta fixa: a primeira rodada define a linha de base.

| Métrica | Definição | Por que importa |
| --- | --- | --- |
| **Visitas à classificação depois de uma confirmação** | % das confirmações seguidas de uma visita à classificação da categoria em até 24h, por algum dos lados | Mede o JTBD 2: o jogador quer ver o efeito do resultado |
| **Uso da cópia fixa** | Toques na cópia fixa por sessão na classificação | Se ninguém toca, a cópia informa sem precisar levar; se todos tocam, talvez a tela devesse abrir já rolada |
| **Troca de categoria** | % das sessões na classificação que abrem o seletor; % que abrem "Outras categorias" | Valida o seletor em folha (RK6) e se olhar outras categorias tem uso |
| **Regras abertas** | Visitas a "Como funciona a pontuação" por jogador na temporada | Testa a oportunidade 2.2 (explicar a pontuação) |
| **Aba de entrada** | % das sessões que visitam a aba Competições; comparação com Feed e Jogos | Testa a hipótese H4 do discovery (ranking é o motivo de abrir o app) |

---

## 14. Riscos para acompanhar no beta

- **A distância da vaga vira pressão.** "Faltam 12 pts" pode motivar ou frustrar. Ouvir os jogadores do beta; se frustrar, a RK11 some sem mexer no resto.
- **Delta de meio de rodada confunde.** No meio da rodada, a tabela diz ▲ 2 e o feed ainda não disse nada (o evento sai no fecho). Se aparecer como "o app errou", avaliar o delta desde a última partida da dupla.
- **Empate total sem ferramenta do admin.** Com poucas partidas no início da temporada, empates em todos os critérios são comuns, e a nota "ordem provisória" pode ficar na tela por semanas enquanto a decisão do admin não tiver tela (seção 12).
- **Categoria grande.** Com 40+ duplas, a lista fica longa e a cópia fixa passa a ser o único jeito de achar a própria linha. Acompanhar o uso da cópia nas categorias maiores.
