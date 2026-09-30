# HEAD_TO_HEAD.md — LetzPlay

Spec do head-to-head (H2H): o que a página compara, como ela trata simples e duplas, de onde se chega a ela, os estados e os critérios de aceite dos blocos novos do design system.

> Este doc decide **o conteúdo e a hierarquia da página de H2H** e os pontos de entrada. As regras do que conta como confronto estão em `docs/DOMAIN.md` (R19, R18, R12) e **não são reabertas aqui**, exceto onde a pergunta HQ1 propõe uma emenda à R19. A contagem já existe no código: `playerHeadToHead` e `unitHeadToHead`, em `src/lib/domain/match-count/headToHead.ts`. Onde a página mora segue a spec de navegação (`docs/NAVIGATION.md`, N10 e N28). As regras daqui são numeradas **HH1, HH2…**, para não colidir com as R do domínio nem com as H das hipóteses do discovery. Rotas são propostas: o nome final é decisão de implementação.

---

## Fontes

As siglas de decisão são as do `docs/DOMAIN.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DOMAIN** | R19 (H2H: dupla exata no card, jogador × jogador na página; amistoso conta; W.O. e W.O. duplo não), R18 e R12 (o que é partida jogada), R1 (posição é da unidade competidora), R2 (a mesma dupla é a mesma unidade em qualquer competição) |
| **DEC-CARDS** | Resposta D1 do Gabriel: o card responde "esses dois lados já se enfrentaram?", a página serve para avaliar o adversário (JTBD 3) |
| **CARDS** | `docs/FEED_CARDS.md`: botão "Já jogaram N vezes, veja o H2H" nos cards de resultado e de confronto, só com histórico e nunca no W.O. (§4.2, §5); placar compacto lido do lado de quem lê, com `perspective` (§3.4) |
| **PERFIL** | `docs/PROFILE.md`: bloco "Vocês" com "Vocês se enfrentaram 3 vezes · você venceu 2" (PF17), que abre a página; W.O. fora do perfil (PF6); perfil visível a qualquer jogador com conta (PF20) |
| **NAV** | `docs/NAVIGATION.md`: uma rota por entidade e a aba de origem marcada (N10); H2H aberto de fora do app cai no Feed (N28); tab bar visível no detalhe (N4); carregando e erro (N23, N24) |
| **RANK** | `docs/RANKING.md`: toque na linha de duplas abre uma folha com os dois jogadores, e o H2H na folha é decisão desta spec (RK14) |
| **REF-H2H** | `docs/discovery/referencias/04-head-to-head.md`: 18 telas de 13 apps. Placar-resumo com barra (Premier League), lista de confrontos (FotMob, DAZN), forma recente em V/D com letra e cor (Fixtured), barra espelhada com números nas pontas (8 de 13 apps) |
| **PESQ-BT** | Entrega da issue de pesquisa de rankings e circuitos de BT (Linear, 25/09/2026), seção 6: StudyPadel e Sofascore tratam a dupla como entidade; a imprensa de padel mostra os dois recortes lado a lado, com números muito diferentes (dupla 26–13 × jogador 23–29); ATP e UTR tiram o W.O. do H2H; Match! Tennis mostra adversários em comum |
| **DSC** | `docs/DISCOVERY.md`: oportunidades 3.2 (H2H com os dois recortes, evidência média) e 3.3 (contexto: adversários em comum, ranking na época, W.O. separado, evidência média); H2H é table stakes no BT (`MATRIZ_FEATURES.md`, `07-kano.md`) |
| **LEIT** | Leitura do agente desta spec, derivada das fontes acima. Precisa da confirmação do Gabriel; a lista está na seção 11 |

---

## 1. Princípio

**O H2H responde uma pergunta só: "como foi quando esses dois lados se enfrentaram?".** O JTBD 3 ("quando descubro quem vou enfrentar, quero avaliar o nível e o histórico desse jogador") tem duas metades, e o produto já divide o trabalho entre elas:

| Pergunta | Onde mora |
| --- | --- |
| "Quão forte é esse jogador?" | O perfil: cartel, rankings, partidas recentes (PERFIL) |
| "Como foi contra mim (ou contra aquela dupla)?" | O H2H |

Por isso a página **não repete o perfil**. Ela não tem cartel geral, nem lista de títulos, nem estatística por jogador. Três razões:

- **O MVP não tem estatística que sustente um duelo de números.** O caminho B da pesquisa (barras espelhadas de "% de sets", "tiebreaks vencidos") "exige estatísticas por jogador que ainda não existem" e arrisca "mostrar número sem significado" com 5 partidas (REF-H2H). O beta começa do zero (DSC, H1).
- **O confronto direto é o dado que só o LetzPlay tem.** O cartel o jogador pode contar; o "3 × 1 contra o Pedro" ele não lembra direito. É a parte que resolve o JTBD 3 e que o perfil só resume numa linha (PF17).
- **A tela pequena é honesta.** Com um confronto, a página mostra um confronto. Nada de "0 · 0 · 0" nem seção vazia para parecer cheia (REF-H2H, "O que funciona e o que evitar").

---

## 2. Os dois recortes

Em duplas, "quem enfrentou quem" tem duas respostas, e elas divergem muito: no padel, a mesma rivalidade é 26–13 entre as duplas e 23–29 entre dois dos jogadores (PESQ-BT). O domínio já escolheu um recorte para cada lugar (R19):

- **Dupla × dupla (a dupla exata):** o card do feed. "Lucas e Rafael contra Pedro e Thiago." É o confronto de hoje.
- **Jogador × jogador (com qualquer parceiro):** a página. "Lucas contra Pedro", somando todas as duplas dos dois, em simples e duplas, ranking, torneio e amistoso. Quando os dois jogaram **juntos**, do mesmo lado, a partida não é confronto (o código já faz isso).

**O problema que a R19, lida ao pé da letra, cria:** o botão do card de duplas diz "Já jogaram 2 vezes" contando a dupla exata, e leva a uma página jogador × jogador. Mas o card tem **quatro** jogadores, então existem quatro pares possíveis (Lucas × Pedro, Lucas × Thiago, Rafael × Pedro, Rafael × Thiago), e nenhum deles precisa dar 2. O jogador toca em "2 vezes" e cai num número diferente, ou numa escolha que o botão não anunciou.

A pergunta **HQ1** (seção 11) propõe resolver isso com **uma página para cada recorte, e a de duplas com os pares individuais embaixo**. As regras HH1 a HH4 estão escritas com a recomendação; se o Gabriel escolher outra opção, elas mudam antes da aprovação.

- **HH1. Existem dois tipos de página de H2H, com a mesma estrutura:** jogador × jogador e dupla × dupla. O **tipo é dado pelos lados**, não por um controle na tela: dois jogadores abrem a de jogadores; duas duplas abrem a de duplas. [R19, DEC-CARDS; **HQ1**]

  **Por que não um SegmentedControl "Duplas · Jogadores"** (caminho 1 da REF-H2H): com quatro jogadores, o segmento "Jogadores" ainda precisaria de uma segunda escolha (qual dos quatro pares?). O controle esconderia o problema em vez de resolver.
- **HH2. A página de duplas mostra, abaixo dos confrontos, a seção "Jogador contra jogador"**, com uma linha por par cruzado que já se enfrentou ("Lucas × Pedro · 3 × 1"), de 0 a 4 linhas. Cada linha abre a página jogador × jogador daquele par. Par sem confronto não aparece; sem nenhum par, a seção some. [PESQ-BT (os dois recortes lado a lado); REF-H2H, recorte 2; **HQ1**]
- **HH3. A página de jogadores não tem seção de duplas.** Ela já soma todas as duplas; uma lista "com quem cada um jogou" seria estatística do perfil, não do confronto. [LEIT]
- **HH4. Em simples, os dois recortes são o mesmo.** A unidade competidora tem um membro só (DOMAIN, "Como ler o diagrama"), então o card de simples e o bloco "Vocês" abrem a página de jogadores. [R3, R19]

---

## 3. Rota e perspectiva

- **HH5. Rota proposta: `/h2h/[ladoA]/[ladoB]`.** O lado é o `@username` do jogador, ou os dois `@username` da dupla unidos por `+`, em ordem alfabética: `/h2h/lucas/pedro` e `/h2h/lucas+rafael/pedro+thiago`. [NAV N10; LEIT]
  - **Uma rota por entidade (N10):** o H2H de dois lados é o mesmo, venha do card, do perfil ou de um link. A ordem alfabética dentro da dupla garante uma URL só por dupla.
  - **A ordem dos lados na URL é a perspectiva** (HH6), não a identidade: `/h2h/lucas/pedro` e `/h2h/pedro/lucas` mostram os mesmos confrontos, espelhados.
  - **Muda a rota que o perfil já usa.** Hoje o bloco "Vocês" leva a `/jogadores/[username]/h2h` (`src/lib/domain/profile-page/routes.ts`, que já avisa que "a rota final é da spec de H2H"). A rota antiga esconde quem vê, então o link compartilhado mostraria outra coisa para quem o abre. Passa a ser `/h2h/[quem-vê]/[username]`.
  - **Aba marcada:** a de origem (N10). De fora do app, o Feed (N28): `h2h` não está no mapa de segmentos de `src/lib/navigation/mainTabs.ts`, e o Feed é o padrão, como a N28 pede.
- **HH6. O lado de quem vê fica à esquerda, e o texto fala com ele.** Quando quem vê está num dos lados, esse lado vai para a esquerda, mesmo que a URL venha na ordem inversa, e os textos usam "você" ("Você venceu 3"). Quando quem vê não está na partida (o H2H de dois amigos, aberto pelo feed), a ordem é a da URL, e os textos usam os nomes ("Lucas venceu 3"). O placar compacto de cada linha se lê do lado esquerdo, com a `perspective` do ScoreBlock (CARDS §3.4). [CARDS §3.4; NAV N10 ("o que muda é quem vê"); LEIT]
- **HH7. A página é visível para qualquer jogador com conta**, como o perfil (PF20): os confrontos são partidas confirmadas, cujos cards já são públicos no feed (R24). Sem login, a rota leva ao login e volta à página depois. [PF20, R24; LEIT]

---

## 4. Anatomia

```
┌─────────────────────────────────────────────┐
│  ←  H2H                                     │  DetailHeader (N4, tab bar visível)
├─────────────────────────────────────────────┤
│   [avt] [avt]              [avt] [avt]      │
│   Lucas · Rafael    ×     Pedro · Thiago    │  H2HSides (h1: "Lucas e Rafael × Pedro e Thiago")
│                                             │
│        3            4 jogos           1     │  H2HSummary
│   ███████████████████████████░░░░░░░░░      │  barra proporcional (decorativa)
│   Vocês venceram 3 · Último: 12/09/2026     │
│                                             │
│  Forma recente                    (HQ2)     │
│   V V D V D                  D V V V V      │  FormGuide × 2
│                                             │
│  No ranking                                 │
│   5º  Ranking Rankin — Masculino B     ▲ 2  │  StandingSummaryItem × 2 (HH13)
│   8º  Ranking Rankin — Masculino B     ▼ 1  │
│                                             │
│  Confrontos                                 │
│   [Vitória]  6/4 3/6 10/7        12/09/2026 │
│   Ranking Rankin — Masculino B · Rodada 3   │  H2HMatchItem × N
│   [Derrota]  4/6 3/6             20/08/2026 │
│   Amistoso                                  │
│                                             │
│  Jogador contra jogador            (duplas) │
│   Lucas × Pedro                     3 × 1 › │  ListItem × 0 a 4 (HH2)
│   Rafael × Thiago                   1 × 1 › │
└─────────────────────────────────────────────┘
```

- **HH8. A página é uma rolagem única, nesta ordem:** Lados · Resumo · Forma recente · No ranking · Confrontos · Jogador contra jogador (só em duplas). Seção sem conteúdo some, como no perfil (PF2). [PF1, PF2; LEIT]

### 4.1 Lados

- **HH9. Os lados mostram avatar e nome de cada jogador**, com o primeiro nome em duplas ("Lucas · Rafael"), como o `MatchVsBlock` do feed. Tocar num jogador abre o perfil dele. O título da tela (`h1`) é o confronto por extenso: "Lucas e Rafael × Pedro e Thiago". [CARDS §4.2; PF20]

  O `MatchVsBlock` mora em `src/components/feed/` e mostra `total_matches` embaixo do nome. Reusar exige subir o bloco para `ui/` (a regra de grupos do `CLAUDE.md`) e tirar a contagem, que aqui não responde à pergunta da página. A issue de ENG decide entre subir o bloco com uma variante ou compor o `H2HSides` com o `Avatar` e o `AvatarStack`, que já estão em `ui/`.

### 4.2 Resumo

- **HH10. O resumo mostra as vitórias de cada lado nas pontas, o total no meio e uma barra proporcional entre elas**, seguidos de uma linha com quem lidera e a data do último confronto: "Você venceu 3 · Último: 12/09/2026". No empate, "Empate em 2 a 2". [REF-H2H (Premier League; números nas pontas em 8 de 13 apps); LEIT]
  - **Os números são o conteúdo, a barra é decoração.** Nenhum app da amostra usa só a barra (REF-H2H).
  - **Sem verde nem vermelho.** O lado esquerdo usa o grafite (`--color-background-inverse`) e o direito o cinza (`--color-background-tertiary`). Vitória não é sucesso nem derrota é erro: é o mesmo raciocínio do cartel (PROFILE §8.2). Os lados se distinguem pela posição e pelo nome, não pela cor (REF-H2H, "Acessibilidade").
  - **Tom neutro, sem superlativo.** "Você venceu 3", não "Você domina o Pedro". Sem diferença percentual (o "↓ 83%" do Hevy, que a REF-H2H marca como risco entre amigos). Os textos são neutros em gênero (R26).
- **HH11. O resumo conta só partidas jogadas: confirmadas, com resultado normal ou desistência.** W.O. e W.O. duplo **não aparecem em nenhum lugar da página**, nem como contagem separada, nem na lista. A desistência entra, porque houve jogo (R19). [R19, R12; PF6; LEIT]

  **Por que não mostrar o W.O. à parte** (oportunidade 3.3, "W.O. separado"): o perfil já decidiu não expor ausências no MVP (PF6), e o H2H é mais pessoal que o perfil. Uma linha "e 1 W.O." diria publicamente quem faltou contra quem. A regra de separar W.O. de jogo real já está cumprida pela exclusão.

### 4.3 Forma recente (depende da HQ2)

- **HH12. Cada lado mostra os resultados das 5 últimas partidas jogadas dele, contra qualquer adversário**, como círculos com a letra e a cor: V ou D, o mais recente à direita. Na página de duplas, é a forma **da dupla** (a unidade); na de jogadores, a do jogador, com qualquer parceiro. Com menos de 5 partidas, mostra as que houver; sem nenhuma, a linha daquele lado diz "Sem partidas". [REF-H2H (Fixtured); WCAG 1.4.1; **HQ2**]

  **Por quê:** é o único dado da página que ajuda quando os dois lados se enfrentaram uma vez só, e é o complemento mais usado quando o confronto direto é curto (REF-H2H, "Resumo"). A issue pede "sequência recente", e esta é a leitura que serve ao JTBD 3: como cada um chega ao jogo.

  A cor aqui é a exceção ao "sem verde nem vermelho" do resumo: a forma é um padrão de mercado com letra **e** cor, e a letra carrega o significado (WCAG 1.4.1). A HQ2 pergunta também isso.

### 4.4 No ranking

- **HH13. Na página de duplas, quando as duas duplas têm inscrição ativa na mesma categoria, a seção "No ranking" mostra a posição atual de cada uma**, com o StandingSummaryItem (RANK seção 9): posição, delta, competição · categoria. Tocar abre a classificação rolada até a linha da dupla, como no perfil (PF10). Se as duas dividem mais de uma categoria, uma linha por dupla em cada categoria em comum. Sem categoria em comum, a seção some. [R1, PF10; REF-H2H (DAZN e Fixtured: "League positions"); LEIT]

  **Na página de jogadores, a seção não existe:** a posição é da dupla, nunca do jogador (R1), e dois jogadores com parceiros diferentes não têm uma linha de ranking comparável. O perfil de cada um já mostra os rankings dele.

  **Ranking na época do confronto** (oportunidade 3.3, Tennis Explorer) fica fora do MVP (seção 9).

### 4.5 Confrontos

- **HH14. Uma linha por confronto, do mais recente ao mais antigo**, todos na página, sem paginação no MVP. Cada linha tem: [CARDS §3.4; PF18; REF-H2H (FotMob, DAZN); LEIT]
  - o Badge "Vitória" ou "Derrota" do lado esquerdo; "Desistência" quando a partida terminou assim, como no card (CARDS §4.4);
  - o placar compacto do ScoreBlock, com a `perspective` do lado esquerdo (`6/4 3/6 10/7`, `4/6 3/2 desist.`);
  - a data da partida (dd/mm/aaaa, porque o H2H cobre anos, e "há 2 meses" perde a ordem);
  - o contexto: competição · categoria · rodada (ranking), competição · categoria (torneio) ou "Amistoso";
  - **na página de jogadores, em duplas, os parceiros:** "com Rafael, contra Pedro e Thiago". Sem isso, "Lucas × Pedro 3 × 1" esconde que cada vitória foi com um parceiro diferente.

  Tocar na linha abre a partida (N10).

  **Por que sem paginação:** o volume de referência é de 2 a 8 jogos por mês no total (DOMAIN §4), e um confronto entre os mesmos dois lados é uma fração pequena disso. Um par que jogou 30 vezes é o caso de revisão, não do MVP.
- **HH15. Todas as competições e o amistoso entram juntos, sem filtro no MVP.** A R19 já decidiu que o amistoso conta; separar por tipo ou por temporada (o "Season / Career" do Box Box Club) pede volume que o beta não terá (seção 9). O contexto de cada linha já diz de onde a partida veio. [R19; REF-H2H, recorte; LEIT]

### 4.6 Jogador contra jogador (só em duplas)

Ver HH2. Cada linha: os dois nomes ("Lucas × Pedro"), o resumo ("3 × 1", do lado de quem está à esquerda na página) e a seta. A ordem segue a HH6: os pares com o jogador que vê primeiro, depois os demais.

---

## 5. Pontos de entrada

- **HH16. A página tem quatro portas:** [CARDS; PF17; RK14; LEIT]

| Porta | Recorte aberto | Aparece quando |
| --- | --- | --- |
| **Botão H2H no card de confronto definido** (CARDS §5) | Dupla × dupla (em simples, jogador × jogador) | Os dois lados têm pelo menos 1 confronto jogado |
| **Botão H2H no card de resultado** (CARDS §4.2) | Idem | Os dois lados têm **pelo menos 2** confrontos jogados, contando o do card (HH17). Nunca no W.O. |
| **Bloco "Vocês" do perfil** (PF17) | Jogador × jogador, quem vê × o jogador | Pelo menos 1 confronto entre os dois |
| **Tela da partida em confronto definido**, para os jogadores da partida | Dupla × dupla | Pelo menos 1 confronto jogado entre os lados (**HQ3**) |

- **HH17. O número do botão é o total de confrontos jogados entre os lados, e é o mesmo que o resumo da página mostra.** No card de resultado, esse total inclui a partida do card; por isso o botão só aparece a partir de 2: com 1, a página mostraria só a partida que o jogador acabou de ver. No card de confronto, a partida ainda não foi jogada, e 1 basta. O número é derivado na hora (não é uma foto do momento do card), para nunca divergir da página. [CARDS §4.2 ("quando é o primeiro confronto, o botão não existe"); **HQ1**; LEIT]

  **Muda o código:** hoje o `ResultCard` mostra o botão com `h2h_count >= 1` (`src/components/feed/ResultCard/ResultCard.tsx`). A `FEED_CARDS.md` §4.2 diz "Quando é o primeiro confronto, o botão não existe", o que só fica verdade se o card de resultado exigir 2.
- **HH18. O `H2HButton` vira link.** Hoje ele é um `<button>` sem `onClick`, stub registrado no `CLAUDE.md` > "Componentes com stubs sem comportamento". Passa a ser um `<a>` (via `next/link`) com o `href` da HH5: navegação é link, não botão (WCAG 4.1.2; o leitor de tela anuncia "link" e o jogador pode abrir em outra aba). [CLAUDE.md; LEIT]
- **HH19. A folha da linha de duplas da classificação (RK14) não ganha H2H no MVP.** A folha resolve "qual dos dois perfis abrir" e tem duas linhas. Uma terceira, "H2H com a sua dupla", só faria sentido para quem está na categoria e já enfrentou aquela dupla, e o perfil de cada jogador já tem o bloco "Vocês". Rever se a métrica "Porta de entrada do H2H" mostrar procura pela classificação. [RANK RK14; LEIT]
- **HH20. Não existe H2H livre** ("escolha dois jogadores"), como o slot "+ Click to add player" do Premier League. O H2H sempre nasce de dois lados que o app já conhece: um card, uma partida ou um perfil. [REF-H2H; LEIT]

---

## 6. Estados

### 6.1 Vazio e borda

| Situação | O que a página mostra |
| --- | --- |
| **Os lados nunca se enfrentaram** (URL digitada ou link antigo; nenhuma porta leva aqui com zero) | Lados, e o EmptyState "Vocês ainda não se enfrentaram." (ou "Lucas e Pedro ainda não se enfrentaram."). Com a HQ2 aprovada, a forma recente continua aparecendo, porque é o que ajuda a preparar o jogo. Sem CTA (**HQ4**, adversários em comum) |
| **Um confronto só** | Resumo "1 jogo", linha "Você venceu 1 · Último: 12/09/2026" e a lista com uma linha. Sem barra: com um confronto, a barra é 100% de um lado e só repete o número |
| **Empate** | "Empate em 2 a 2"; a barra fica dividida ao meio |
| **Só amistosos** | Normal. O contexto de cada linha diz "Amistoso"; "No ranking" some se não houver categoria em comum |
| **A dupla da URL nunca existiu** (os dois jogadores nunca formaram uma unidade) | Tela "H2H não encontrado" com "Voltar ao feed", como o perfil inexistente (PROFILE §6.2) |
| **@username inexistente ou os dois lados iguais** | Mesma tela "H2H não encontrado". O código já recusa lados iguais (`assertDistinct`) |
| **Partida anulada depois de confirmada** (R41) | Sai do resumo e da lista, como o card sai do feed. A contagem é derivada, então isso acontece sozinho |
| **Nome longo** | O nome dos lados quebra em até 2 linhas, depois reticências; o placar nunca quebra (CARDS §3.4) |
| **Sem foto** | Iniciais do Avatar |

### 6.2 Carregando e erro

- **HH21. Carregando:** o cabeçalho da tela e a tab bar aparecem na hora (N23); o conteúdo mostra Skeleton com o formato dos lados, do resumo e de 3 linhas de lista. [NAV N23; PF21]
- **HH22. Erro:** segue a N24. Lados e resumo vêm juntos (sem eles a página não tem sentido, e o erro ocupa a tela com "Tentar de novo"); forma recente e "No ranking" falham sozinhas, e o resto continua. [NAV N24; PF22]

---

## 7. Layout e acessibilidade

- **HH23. Mobile-first, de 393 a 430px.** A partir de 600px, a página fica na coluna central com largura máxima (N27), sem mudar a ordem das seções. [NAV N27; `PRODUCT.md`]
- **Título:** o confronto por extenso é o `h1` ("Lucas × Pedro"). Cada seção é um `<section>` com `h2`, e cada lista é uma lista (List do DS).
- **Resumo como frase:** o leitor de tela ouve "Você venceu 3, Pedro venceu 1, em 4 jogos. Último confronto em 12 de setembro de 2026." A barra tem `aria-hidden`. Uma `<table>` com os lados como colunas é a estrutura recomendada quando há várias métricas (REF-H2H, "Acessibilidade"); com uma métrica só, a frase é mais curta e diz o mesmo.
- **Forma recente:** cada círculo tem a letra visível; o grupo tem nome acessível por extenso ("Últimas 5 de Lucas: vitória, vitória, derrota, vitória, derrota, da mais antiga para a mais recente"). Letra e cor, nunca só cor (WCAG 1.4.1).
- **Linha de confronto:** lida como uma frase ("Vitória, 6/4 3/6 10/7, 12 de setembro de 2026, Ranking Rankin, Masculino B, rodada 3"). O Badge é texto.
- **Alvos de toque de 48px** em toda linha, no botão H2H e em cada jogador dos lados (`TOKENS.md`).

---

## 8. Componentes e critérios de aceite

Os blocos novos moram em `src/components/h2h/` (grupo de área, `CLAUDE.md` > "Onde mora cada componente"). O que outra área também usar sobe para `ui/`.

| Componente | Tier | Situação | Uso nesta spec |
| --- | --- | --- | --- |
| **H2HSummary** | 3 | Novo | Resumo (HH10) |
| **FormGuide** | 2 | Novo, se a HQ2 for aprovada | Forma recente (HH12) |
| **H2HMatchItem** | 3 | Novo, composição do ListItem | Linha de confronto (HH14) |
| **H2HSides** | 3 | Novo, ou `MatchVsBlock` subindo para `ui/` com variante (HH9) | Lados |
| H2HButton | 3 | No `master` (`feed/`), vira link (HH18) | Portas no feed e na partida |
| ScoreBlock compacto | 3 | No `master` (`ui/`) | Placar em cada confronto |
| Badge, ListItem, Avatar, AvatarStack, EmptyState, Skeleton | 1–2 | No `master` | Resultado, listas, lados, vazio, carregando |
| StandingSummaryItem | 3 | No `master` (`ui/`) | No ranking (HH13) |
| DetailHeader | — | No `master` (`shell/`) | Cabeçalho da tela |

**O H2HButton sai de `feed/`** se a HQ3 for aprovada: a tela da partida é da área `agenda/`, e um grupo de área não importa de outro. Nesse caso ele sobe para `ui/`.

### 8.1 H2HSummary

O placar do confronto entre dois lados.

- [ ] Props: `leftWins`, `rightWins`, `lastPlayedAt` (data) e `leftLabel` / `rightLabel` (o nome curto de cada lado, ou "Você" / "Vocês").
- [ ] Vitórias de cada lado nas pontas em `--text-display-sm` bold; o total no meio em `--text-label-md`, `--color-foreground-secondary` ("4 jogos"; "1 jogo" no singular).
- [ ] Barra proporcional entre os números: esquerda em `--color-background-inverse`, direita em `--color-background-tertiary`, altura 4px, `--radius-full`. `aria-hidden`.
- [ ] Sem barra quando o total é 1 (seção 6.1). Com empate, dividida ao meio.
- [ ] Linha de apoio: "Você venceu 3 · Último: 12/09/2026", "Pedro venceu 3 · …" ou "Empate em 2 a 2 · …". Neutra em gênero (R26); em duplas, "Vocês venceram".
- [ ] Nenhuma cor de sucesso ou erro (verde, vermelho) no componente.
- [ ] Nome acessível como uma frase (seção 7).
- [ ] Story com: vantagem da esquerda, da direita, empate, um confronto só, números de dois dígitos, "Você" e nomes.

### 8.2 FormGuide (se a HQ2 for aprovada)

Os últimos resultados de um lado, em sequência.

- [ ] Props: `results` (lista de `"win"` ou `"loss"`, da mais antiga para a mais recente, até 5) e `label` (de quem é a forma, para o nome acessível).
- [ ] Um círculo de 24px por resultado, com a letra "V" ou "D" em `--text-label-md` bold. Vitória em `--color-background-success` com `--color-foreground-on-success`; derrota em `--color-background-attention` com `--color-foreground-on-attention`.
- [ ] O mais recente à direita. Sem resultado: o texto "Sem partidas" em `--color-foreground-secondary`.
- [ ] Nome acessível por extenso (seção 7); as letras não são lidas uma a uma.
- [ ] Não é interativo.
- [ ] Story com: 5 resultados, menos de 5, zero, só vitórias, só derrotas.

### 8.3 H2HMatchItem

Uma linha da lista de confrontos.

- [ ] Compõe o ListItem: Badge de resultado, ScoreBlock compacto com `perspective`, data, contexto e, na página de jogadores em duplas, a linha dos parceiros (HH14).
- [ ] O placar nunca quebra; quem quebra é o contexto (CARDS §3.4).
- [ ] Toda a linha é um link para a partida, com state layer, `:focus-visible` e 48px de altura mínima.
- [ ] Story com: vitória, derrota, desistência, amistoso, torneio sem rodada, duplas com parceiros, contexto longo.

**Fora das issues de componente:** a página, a rota, a troca da rota do perfil (HH5), o `H2HButton` como link (HH18), a regra do botão no card de resultado (HH17) e a porta na tela da partida (HH16). Viram issues de ENG quando a spec for aprovada.

---

## 9. Fora do MVP

| Item | Por quê |
| --- | --- |
| **Estatísticas espelhadas** (% de sets, tiebreaks, games) | Exigem estatística por jogador que o modelo não tem, e com poucas partidas o número não diz nada (REF-H2H, caminho B). A página é o confronto direto (seção 1) |
| **Filtro por temporada, tipo de competição ou formato** | O volume do beta não sustenta recorte (HH15). Volta quando algum par tiver confrontos suficientes para a lista ficar longa |
| **Ranking de cada lado na data de cada confronto** (DSC 3.3) | As fotos de fim de rodada (R46) existem, mas só para rankings e só no fim da rodada; o amistoso e o torneio não têm posição. Pouco ganho para o custo |
| **W.O. à parte** (DSC 3.3) | Fica fora da página inteira (HH11), como fica do perfil (PF6) |
| **H2H livre, escolhendo dois jogadores** | HH20 |
| **"Jogaram juntos N vezes"** | É dado de parceria, não de confronto. Pertence ao perfil, se um dia entrar |
| **Compartilhar o H2H como imagem** | A rota já é compartilhável (HH5); a imagem é crescimento, não JTBD 3 |

A pergunta **HQ4** decide se "adversários em comum" também entra nesta tabela.

---

## 10. Relação com as outras specs

Se a spec for aprovada como está, estas mudanças acompanham o PR de aprovação (ou issues de ENG, no caso do código):

- **`docs/DOMAIN.md`, R19:** "na página de H2H, jogador × jogador" passa a "a página tem dois tipos, jogador × jogador e dupla × dupla (HH1); o card de duplas abre a de duplas". Só com a HQ1 aprovada.
- **`docs/NAVIGATION.md`, tabela de rotas:** a linha "H2H" ganha `/h2h/[ladoA]/[ladoB]` (HH5).
- **`docs/FEED_CARDS.md`, §4.2:** o botão do card de resultado aparece a partir de 2 confrontos, contando o do card (HH17).
- **Código:** `headToHeadPath` do perfil (HH5), `ResultCard` (HH17), `H2HButton` como link (HH18) e a linha do `H2HButton` sai de "Componentes com stubs sem comportamento" no `CLAUDE.md` quando ele ganhar `href`.

---

## 11. Perguntas e leituras

### Perguntas para o Gabriel

**HQ1. O card de duplas abre a página de duplas, com os pares individuais embaixo?**

- **Contexto:** a R19 põe a dupla exata no card e o jogador × jogador na página. O botão do card de duplas diz "Já jogaram 2 vezes" (dupla exata) e leva a uma página que, com quatro jogadores, tem quatro pares possíveis, nenhum obrigado a dar 2 (seção 2).
- **Opções:**
  1. **Dois tipos de página; a de duplas tem "Jogador contra jogador" embaixo** (HH1, HH2). O número do botão é o número da página, e o recorte individual continua a um toque. Custo: emenda a R19 e cria uma segunda rota.
  2. **Só a página de jogadores (R19 literal); o card de duplas abre uma folha com os pares** (como a folha da RK14), cada um com o próprio número. Custo: um toque a mais, e o "2 vezes" do botão não aparece em lugar nenhum depois do toque.
  3. **Só a página de jogadores; o card de duplas abre o par de quem vê** (quando quem vê está na partida) ou o dos primeiros jogadores listados. Custo: escolha arbitrária, e o número diverge do botão sem explicação.
- **Recomendação:** 1. É o que o padel faz quando mostra os dois recortes lado a lado (PESQ-BT), mantém a promessa do botão e não inventa uma escolha que o jogador não pediu. A R19 separava os recortes por lugar; a opção 1 mantém a separação, só que por página.

**HQ2. A forma recente (últimas 5 de cada lado, V/D) entra no MVP?**

- **Contexto:** a issue pede "sequência recente". O confronto direto do beta vai ser curto (1 a 3 jogos por par), e a forma é o dado que ajuda a preparar o jogo mesmo assim (HH12).
- **Opções:**
  1. **Sim, com letra e cor verde/vermelha** (padrão Fixtured). Custo: o componente FormGuide, e verde e vermelho aparecem num lugar em que o cartel do perfil decidiu não usá-los.
  2. **Sim, com letra e cor neutra** (grafite para V, contorno para D). Custo: a leitura rápida pela cor se perde.
  3. **Não:** a sequência recente é a própria lista de confrontos, do mais recente ao mais antigo. Custo: com 1 confronto, a página diz pouco.
- **Recomendação:** 1. A forma é leitura de relance, e o padrão de mercado usa as duas cores; a letra garante o WCAG 1.4.1. O cartel é outra coisa: um número que resume uma carreira não é julgamento, e 5 bolinhas são exatamente um julgamento de fase.

**HQ3. A tela da partida em confronto definido mostra o botão H2H para os jogadores da partida?**

- **Contexto:** o momento mais forte do JTBD 3 é a semana do jogo (PF16). Hoje o H2H aparece no card do feed (público) e no perfil, mas não na tela da partida, que é a casa do confronto (N17) e onde o jogador marca o horário.
- **Opções:**
  1. **Sim, o mesmo botão do card, abaixo dos lados**, quando há confronto anterior. Custo: o `H2HButton` sobe de `feed/` para `ui/`.
  2. **Não:** o jogador chega pelo feed ou pelo perfil do adversário. Custo: dois toques a mais no momento que mais importa.
- **Recomendação:** 1. É uma linha, só aparece com histórico, e coloca o H2H onde o jogador já está (REF-H2H, caminho C: "entrega a informação no momento em que ela importa").

**HQ4. Quando os lados nunca se enfrentaram, a página mostra adversários em comum?**

- **Contexto:** oportunidade 3.3 (Match! Tennis). Nenhuma porta leva à página com zero confrontos (HH16), então o caso só aparece por URL digitada ou link antigo.
- **Opções:**
  1. **Não no MVP:** EmptyState, e a forma recente se a HQ2 for aprovada. Custo: nenhum no uso normal.
  2. **Sim:** "Contra quem os dois já jogaram", com o resultado de cada um. Custo: uma consulta e uma seção nova para um caso que as portas não produzem; e, com duas categorias no beta, a lista seria curta ou vazia.
- **Recomendação:** 1. Rever se o H2H ganhar uma porta com zero confrontos (por exemplo, o confronto definido da primeira rodada).

### Leituras do agente

Derivadas das fontes, sem decisão nova de produto. Precisam só da confirmação do Gabriel:

- **HL1** → HH3: a página de jogadores não tem seção de duplas.
- **HL2** → HH5: rota `/h2h/[ladoA]/[ladoB]`, com `+` na dupla e troca da rota do perfil.
- **HL3** → HH6: o lado de quem vê à esquerda, textos com "você".
- **HL4** → HH7: página visível a qualquer jogador com conta.
- **HL5** → HH8, HH10: estrutura em rolagem única e resumo com barra neutra.
- **HL6** → HH11: W.O. fora da página inteira, nem contado à parte.
- **HL7** → HH13: "No ranking" só na página de duplas, com categoria em comum.
- **HL8** → HH14, HH15: lista completa, sem filtro, com parceiros na página de jogadores.
- **HL9** → HH17: o botão do card de resultado aparece a partir de 2 confrontos, contando o do card.
- **HL10** → HH18, HH19, HH20: `H2HButton` como link; sem H2H na folha da classificação; sem H2H livre.

---

## 12. Métricas de sucesso

Medidas no beta com Rankin e Vila. Sem meta fixa: a primeira rodada define a linha de base.

| Métrica | Definição | Por que importa |
| --- | --- | --- |
| **H2H antes do jogo** | % dos confrontos definidos com histórico em que um dos jogadores abriu o H2H antes da data acordada | Mede se o H2H serve ao JTBD 3, e não só à curiosidade |
| **Porta de entrada do H2H** | Aberturas por porta: card de confronto, card de resultado, perfil ("Vocês"), tela da partida | Mostra qual porta funciona; decide a HH19 e confirma a HQ3 |
| **H2H de terceiros** | % das aberturas em que quem vê não está em nenhum dos lados | Mede o JTBD 4 (rivalidade como conteúdo entre amigos). Alto indica que o H2H é também conteúdo social |
| **Descida para o individual** | Na página de duplas, % das visitas que tocam em "Jogador contra jogador" | Testa a HQ1: se ninguém desce, o recorte individual pode ficar só no perfil |
| **Retorno ao mesmo H2H** | Jogadores que abrem o mesmo H2H em rodadas diferentes | Rivalidade recorrente; o ponto de partida para um "Rivais" no perfil, fora do MVP |

---

## 13. Riscos para acompanhar no beta

- **Pouco dado no começo.** Com o beta do zero, quase todo par terá 0 ou 1 confronto na primeira temporada, e as portas escondem o H2H até lá (HH16). O H2H cresce com o tempo; se a métrica "H2H antes do jogo" for zero no primeiro mês, é esperado.
- **Amistoso misturado com competição.** Um "5 × 0" feito de amistosos pesa igual a um de ranking (R19). O contexto de cada linha diz de onde veio, mas o resumo não. Se os jogadores lerem o H2H como nível, a próxima versão separa por tipo, como o risco do cartel no perfil (PROFILE §12).
- **Rivalidade exposta.** O H2H é visível para qualquer jogador (HH7), e a página de terceiros mostra quem perde para quem. Os cards de resultado já são públicos, mas somados numa tela contam uma história maior. Ouvir os jogadores do beta, principalmente os que estão do lado que perde.
- **Números divergentes entre recortes.** "Vocês 2 × 0" na dupla e "Lucas × Pedro 1 × 3" no individual podem confundir, como no padel (PESQ-BT). A seção "Jogador contra jogador" (HH2) deixa os dois números à vista em vez de escolher um; acompanhar se isso ajuda ou confunde.
- **Perfil duplicado.** Um jogador com duas contas divide o H2H em dois, com números parciais. É do cadastro, como no perfil (PROFILE §12).
