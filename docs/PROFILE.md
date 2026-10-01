# PROFILE.md — LetzPlay

Spec do perfil do jogador: o que o perfil mostra, em que ordem, o que muda entre o próprio perfil e o de outro jogador, os estados e os critérios de aceite dos blocos do perfil no design system.

> Este doc decide **o conteúdo e a hierarquia do perfil**. Onde o perfil mora e como se chega a ele é da spec de navegação (`docs/NAVIGATION.md`, N…). A tela de classificação, a linha de corte e o formato da posição são da spec de ranking. A página de H2H é da spec de H2H. As regras de domínio estão em `docs/DOMAIN.md` (R…). As regras daqui são numeradas **PF1, PF2…** para não colidir com elas.

---

## Fontes

As siglas de decisão são as mesmas do `docs/DOMAIN.md` > "Fontes". As que esta spec usa, mais as próprias:

| Sigla | Conteúdo usado aqui |
| --- | --- |
| **DEC-FEED** | Feed público mostra conquistas e crescimento; "caiu" não vira publicação (R20, R22) |
| **DEC-FINAL** | Marcos permanentes; "dentro ou fora da final" só na tela de ranking (R23, R25) |
| **DEC-CARDS** | H2H jogador × jogador na página, dupla exata no card (R19); textos neutros (R26) |
| **NAV** | `docs/NAVIGATION.md` (perguntas Q1–Q5 respondidas em 29/09/2026): rota do perfil (N10), tab bar visível no perfil de outro jogador (N4), engrenagem com configurações e "Sair" (N8), edição de perfil como fluxo modal (N4), histórico do próprio jogador na aba Jogos (seção 5) |
| **REF** | `docs/discovery/referencias/03-perfil.md` (30 telas de 24 apps) e `inventario-componentes.md` |
| **DSC** | `docs/DISCOVERY.md` (oportunidades 3.1, 3.2, 3.3, 5.1, 5.2) e `docs/discovery/` (SINTESE, VOZ_DO_USUARIO, MATRIZ_FEATURES) |
| **DEC-PERFIL** | Issue desta spec, comentário "Decisões do Gabriel" (27/09/2026): aprovação das recomendações das perguntas PQ1–PQ5 e das leituras PL1–PL8; a variação de posição aparece em todas as linhas da tabela, nos dois sentidos, e a R22 passa a valer só para o feed e as notificações |
| **RANK** | `docs/RANKING.md`: linha da classificação e suas contagens (RK8), base do delta (RK12), temporada encerrada na tela (RK15), classificação de temporada antiga (RK21) e o item de posição StandingSummaryItem (seção 9) |
| **LEIT** | Leitura do agente desta spec, confirmada na DEC-PERFIL. A lista está na seção 10 |

---

## 1. Princípio

**Uma tela, duas leituras, e a competitiva primeiro.** O perfil de outro jogador é aberto por dois motivos: acompanhar um amigo (JTBD 4) ou avaliar um adversário (JTBD 3). O próprio perfil tem um terceiro: ver a própria evolução (JTBD 5).

A leitura competitiva vem primeiro por três razões:

- **É a dor com mais evidência.** "Nível do adversário e perfil em que dá para confiar" é a oportunidade 2 da síntese do discovery, com evidência forte (13 menções em 4 apps e 18 threads). O JTBD 4 é "o mais coberto pela oferta e o menos citado pela demanda" (`MATRIZ_FEATURES.md`). [DSC]
- **A leitura social cabe em pouco espaço.** Ela precisa de identidade (foto, nome), do vínculo (amigos ou não) e do que o amigo tem feito. As duas primeiras cabem no cabeçalho, e a terceira é o próprio conteúdo competitivo: posição, resultados e conquistas. [REF]
- **O problema 2 do audit é o perfil sobrecarregado** (`CLAUDE.md`). Configurações e conta já saíram do perfil (N8). Esta spec corta o resto: o perfil só mostra o que responde a uma das três perguntas abaixo. [NAV]

| Leitura | Pergunta | O que responde |
| --- | --- | --- |
| **Competitiva** (outro jogador) | "Quão forte é esse jogador, e como foi contra mim?" | Cartel, rankings atuais, partidas recentes, bloco "Vocês" |
| **Social** (outro jogador) | "Quem é, somos amigos, o que tem feito?" | Cabeçalho, ação de amizade, partidas recentes, conquistas |
| **Evolução** (próprio perfil) | "Estou melhorando?" | Rankings com variação, melhor posição, temporadas anteriores e marcos |

---

## 2. Estrutura

- **PF1. O perfil é uma rolagem única, sem abas.** As seções aparecem nesta ordem: **Cabeçalho · Vocês · Rankings · Partidas recentes · Temporadas**. [REF; DEC-PERFIL PQ1]

  **Por quê:** o volume é pequeno. Um jogador tem de 2 a 8 jogos por mês e 1 ou 2 inscrições (DOMAIN §4), e o beta começa do zero (DISCOVERY §7, pergunta 2). Com abas, cada aba nasceria com 2 ou 3 linhas, e quem veio avaliar o adversário teria de adivinhar qual abrir (`03-perfil.md`, caminho A, "Contra"). As abas voltam a fazer sentido quando o perfil tiver estatística por período ou conquistas em volume.
- **PF2. A seção sem conteúdo some**, exceto "Partidas recentes", que vira o estado vazio da seção 6. O perfil de um jogador novo tem cabeçalho e a linha "Nenhuma partida ainda". [LEIT]
- **PF3. O perfil de outro jogador e o próprio perfil são a mesma tela.** O que muda é quem vê (N10): a ação do cabeçalho, o bloco "Vocês" (só no de outro), a ordem das linhas de "Rankings" e a melhor posição (só no próprio). **A variação de posição aparece para qualquer jogador**, como na tabela de classificação (PF13). [NAV, DEC-PERFIL]

| Seção | Perfil de outro jogador | Próprio perfil |
| --- | --- | --- |
| Cabeçalho | Ação de amizade | "Editar perfil" |
| Vocês | Quando há H2H ou confronto entre os dois | Não existe |
| Rankings | Inscrições ativas com posição e variação, a categoria em comum primeiro | Inscrições ativas com posição, variação e melhor posição |
| Partidas recentes | As 5 últimas, com "Ver todas" | As 5 últimas, com "Ver todas" na aba Jogos |
| Temporadas | Temporadas encerradas com posição final e marcos | Igual |

---

## 3. Cabeçalho

O cabeçalho responde "quem é" e "que tipo de jogador é" em um olhar, antes de qualquer rolagem.

```
┌─────────────────────────────────────────────┐
│  ←  @lucas                              ⋯   │  AppHeader (N4, N8)
├─────────────────────────────────────────────┤
│              [ avatar 96px ]                │
│               Lucas Silva                   │  title-md, bold
│                 @lucas                      │  label-md, secondary
│                                             │
│      ┌──────────┐    ┌──────────┐           │
│      │   274    │    │    38    │           │  StatTile × 2
│      │  jogos   │    │  amigos  │           │
│      └──────────┘    └──────────┘           │
│                                             │
│        182 vitórias · 92 derrotas           │  RecordLine
│                                             │
│   [        + Adicionar Lucas           ]    │  Button (ação de amizade)
└─────────────────────────────────────────────┘
```

- **PF4. O cabeçalho tem: avatar de 96px, nome completo, @username, dois números (jogos e amigos), o cartel e uma ação.** Não tem foto de capa, bio, idade, telefone nem cidade. [REF; LEIT]
  - **Sem foto de capa:** o hero de foto grande "funciona com atleta profissional fotografado; com avatar de celular ou sem foto, vira um bloco vazio" (`03-perfil.md`).
  - **Sem idade nem telefone:** a data de nascimento é opcional e serve só para validar a categoria (R33), e o telefone nunca aparece no perfil público (M23). O perfil é visível para quem não é amigo (PF20), então nenhum dos dois entra nele.
- **PF5. Jogos é o `total_matches` (R18); amigos é o número de amizades aceitas (R24).** Os dois são StatTile. Tocar em "amigos" abre a lista de amigos do jogador (`/jogadores/[username]/amigos`); "jogos" não é tocável, porque a lista de partidas já está logo abaixo. [`FEED_CARDS.md` §11.1; LEIT]
- **PF6. O cartel é "N vitórias · N derrotas", de todas as partidas confirmadas do jogador**: ranking, torneio e amistoso, em simples e duplas, desde que ele entrou no app. **W.O. e W.O. duplo ficam fora**, como no `total_matches` (R18) e no H2H (R19); a desistência entra, porque houve jogo. Assim, vitórias + derrotas = jogos, e os dois números nunca se contradizem. **O W.O. em que o lado do jogador não compareceu também não aparece no perfil** no MVP: é decidido pelo admin (R40), e um número público de ausências expõe mais do que ajuda num beta pequeno. [R18, R19, DSC 3.3; DEC-PERFIL PQ4]

  **Mesma definição da linha da classificação:** a linha da tabela mostra "N jogos · N vitórias" com a mesma conta do cartel: jogos são as partidas confirmadas em que houve jogo (normal ou desistência), vitórias são os jogos vencidos, e W.O., W.O. duplo e canceladas ficam fora (RANK RK8). **A diferença é só o recorte:** a linha conta a inscrição da dupla na temporada; o cartel conta a carreira do jogador, em qualquer competição e no amistoso. Por isso a soma das linhas do jogador pode ser menor que o cartel, nunca maior.

  **Por que carreira e não "temporada atual":** o jogador está em vários rankings (R2), cada um com a sua temporada, então "a temporada" do jogador não existe. O recorte por período fica para quando houver volume (seção 9).
- **PF7. Ação do cabeçalho, pelo estado da amizade (R24):**

| Quem vê | Estado | Ação | Variante |
| --- | --- | --- | --- |
| O próprio jogador | — | "Editar perfil" | Secondary |
| Outro jogador | Sem amizade | "+ Adicionar [PrimeiroNome]" | Primary (como no card de amizade, `FEED_CARDS.md` §7.2) |
| Outro jogador | Pedido enviado por quem vê | "Pedido enviado", que cancela o pedido com confirmação | Secondary |
| Outro jogador | Pedido recebido de quem é visto | "Aceitar" (primary) e "Recusar" (secondary), lado a lado | — |
| Outro jogador | Amigos | "Amigos ✓", que abre a opção "Desfazer amizade" com confirmação | Secondary |

  Desfazer amizade e cancelar pedido pedem confirmação porque a outra pessoa não é avisada e refazer depende dela. [LEIT]
- **PF8. O menu "⋯" do cabeçalho de outro jogador tem "Compartilhar perfil"**, que abre o sheet nativo com o link público `/jogadores/[username]`. Denunciar e bloquear ficam fora do MVP (seção 9). No próprio perfil, o lugar do "⋯" é a engrenagem (N8). [REF (Strava, Garmin, adidas); LEIT]

### Editar perfil

- **PF9. "Editar perfil" é um fluxo modal de tela cheia** (N4) com: foto (AvatarUpload), nome, @username com a mesma validação de unicidade em tempo real do cadastro (`PRODUCT.md`) e data de nascimento opcional, com o aviso "Não aparece no perfil. Serve para as categorias com idade." Telefone, e-mail e senha ficam nas configurações (N8). [NAV, R33; LEIT]

---

## 4. Rankings

A seção responde "onde esse jogador está agora". É o elo entre o perfil e a aba Competições.

- **PF10. Uma linha por inscrição ativa do jogador** (R8, R45), com o **StandingSummaryItem** da spec de ranking (RANK seção 9): posição da unidade competidora, variação, competição · categoria e parceiro (em simples, nada). O conteúdo e o formato do item são de lá; o perfil decide só se ele aparece, em que ordem (PF12) e o complemento do próprio perfil (PF14). Tocar na linha abre a classificação da categoria, rolada até a linha da dupla, o mesmo destino do card de movimentação (N10). [R1, NAV, RANK]

```
Rankings
┌──────────────────────────────────────────────┐
│ 5º   Ranking Arena Mangaba — Masculino B ▲ 2 │
│      [avt] com Rafael · Melhor: 3º           │
├──────────────────────────────────────────────┤
│ 12º  Liga Pitanga — Mista C              ▼ 1 │
│      [avt] com Ana                           │
└──────────────────────────────────────────────┘
```

- **PF11. A posição é da dupla, nunca do jogador** (R1). A linha diz "com Rafael" para deixar isso explícito: um jogador pode ser 5º numa categoria e 12º em outra, com parceiros diferentes. **A categoria é atributo da inscrição, não do jogador**, por isso o cabeçalho não tem selo de categoria. [R1, R2, R4; responde a pergunta 3 de `03-perfil.md`]
- **PF12. Ordem das linhas:**
  - No perfil de outro jogador, **as categorias em que quem vê também está inscrito vêm primeiro**: é onde os dois competem, e onde a leitura competitiva importa. Depois, as demais.
  - Dentro de cada grupo, e no próprio perfil, a melhor posição primeiro.

  [LEIT]
- **PF13. O perfil mostra o mesmo dado de ranking que a tabela de classificação, nem mais nem menos.** A tabela mostra a variação em todas as linhas, nos dois sentidos, contra o fim da última rodada fechada (RK12); o perfil mostra a mesma variação, no próprio perfil e no de qualquer outro jogador, **inclusive a queda**. A R22 vale só para o feed e as notificações: a queda não vira publicação nem aviso para outros jogadores, mas a posição e a variação são públicas na tabela, e o perfil não esconde o que a tabela já mostra. [R22, R46, RANK RK12, DEC-PERFIL]
- **PF14. No próprio perfil, cada linha ganha "Melhor: 3º"** quando a melhor posição da temporada é melhor que a atual. **A melhor posição é a menor entre as fotos de fim de rodada (R46) e a posição ao vivo.** Assim o "Melhor" nunca fica pior que a posição mostrada ao lado: quem está em 2º ao vivo, com 3º como melhor foto, tem melhor posição 2º, igual à atual, e a linha não mostra o complemento. É a forma mínima de evolução no MVP (seção 9). O complemento entra na linha de apoio do StandingSummaryItem. [R46, DSC 5.1; DEC-PERFIL PQ3]
- **PF15. Inscrição encerrada por troca de parceiro (R45) não aparece em "Rankings".** Ela aparece em "Temporadas" quando a temporada termina, com a posição congelada. [R45; LEIT]

---

## 5. Vocês, partidas recentes e temporadas

### 5.1 Vocês (só no perfil de outro jogador)

O bloco responde "como foi contra mim" e é a ponte para o H2H (`03-perfil.md`, caminho C; DEC-PERFIL PQ2). Aparece quando existe pelo menos uma destas coisas entre quem vê e o jogador:

- **PF16. Confronto definido entre os dois** (R7): "Próximo confronto: Rodada 3 · Sáb, 14h", que abre a partida (N10). É o momento mais forte do JTBD 3: quem abre o perfil do adversário na semana do jogo. Vem primeiro no bloco. [R7, NAV]
- **PF17. H2H jogador × jogador** (R19): "Vocês se enfrentaram 3 vezes · você venceu 2", que abre a página de H2H. Conta como a página de H2H: partidas confirmadas, amistoso incluído, W.O. fora. A página e o que ela mostra são da spec de H2H. [R19, DEC-CARDS]

Sem confronto e sem H2H, o bloco some (PF2). Adversários em comum (DSC 3.3) são da spec de H2H.

### 5.2 Partidas recentes

- **PF18. As 5 partidas confirmadas mais recentes** do jogador, de qualquer tipo, com: resultado (Badge "Vitória" ou "Derrota"; "W.O." e "Desistência" como no card, `FEED_CARDS.md` §3.3), os adversários, a competição · categoria (ou "Amistoso"), o placar em linha e a data relativa. Cada linha abre a partida (N10). [R16, NAV; LEIT]

  **"Ver todas":** no próprio perfil, leva ao Histórico da aba Jogos (NAV seção 5), que já é essa lista; no de outro jogador, abre `/jogadores/[username]/partidas`, a mesma lista sem ações. Assim não existem duas listas do próprio histórico que possam divergir, como pede o risco "Histórico no perfil e na agenda" da spec de navegação. [NAV; LEIT]

  A aba Jogos e a seção Histórico foram confirmadas pelo Gabriel em 29/09/2026 (Q1 e Q2 da spec de navegação, NAV N1 e N12).

### 5.3 Temporadas

- **PF19. Uma linha por temporada encerrada** em que o jogador teve inscrição: temporada, competição · categoria, parceiro, **posição final** e, quando houver, os marcos (★ Líder, ★ Top N) e a classificação para a final ("★ Saideira"). Mais recente primeiro. [R25, R27, R28, R47]

  **Toque na linha:** abre a classificação final daquela categoria naquela temporada, rolada até a linha da dupla. A tela e a rota são as da RK21 da spec de ranking: a mesma classificação, no estado "Temporada encerrada" (RK15), aberta na temporada escolhida. [RANK RK15, RK21]

  **Por quê:** é a evolução que pode ser pública. Marcos e classificação já são eventos públicos do feed (R20, R24), e a posição final é a mesma que a tabela da temporada mostra. É também o que o jogador vê entre temporadas, quando não há jogo (NAV 9.2).

---

## 6. Estados

### 6.1 Visibilidade

- **PF20. O perfil é visível para qualquer jogador com conta**, amigo ou não. A leitura competitiva precisa disso: o adversário sorteado quase nunca é amigo. Sem login, `/jogadores/[username]` leva ao login e volta ao perfil depois dele. Todo jogador tem @username, gerado a partir do nome no cadastro e editável (`PRODUCT.md`), então toda conta tem essa rota. [R7; DEC-PERFIL PQ5; decisão do Gabriel na spec de navegação, 29/09/2026]

### 6.2 Vazio e borda

| Situação | O que o perfil mostra |
| --- | --- |
| **Jogador novo** (sem partida e sem inscrição) | Cabeçalho com "0 jogos", cartel "Nenhuma partida ainda" no lugar da linha, e a seção "Partidas recentes" com EmptyState. Próprio perfil: "Suas partidas confirmadas aparecem aqui." e CTA "Registrar amistoso" (N19, ver a nota abaixo da tabela). Outro jogador: "As partidas de Lucas aparecem aqui.", sem CTA |
| **Com partidas, sem inscrição ativa** | Sem "Rankings" (PF2). O resto normal |
| **Inscrito, sem partida confirmada** | "Rankings" com a posição que a tabela mostrar para quem ainda não jogou (spec de ranking); "Partidas recentes" vazia |
| **Só amistosos** | Cartel e partidas normais; sem "Rankings" nem "Temporadas" |
| **Nome longo** | Nome em até 2 linhas, depois reticências. @username em 1 linha |
| **Sem foto** | Avatar com iniciais (Avatar do DS) |
| **@username inexistente** | Tela "Jogador não encontrado" com "Voltar ao feed". Nada revela se a conta existiu |

O CTA "Registrar amistoso" leva ao fluxo da N19: o amistoso é um botão da aba Jogos, confirmado pelo Gabriel em 29/09/2026 (Q2 da spec de navegação).

### 6.3 Carregando e erro

- **PF21. Carregando:** o cabeçalho da tela e a tab bar aparecem na hora (N23); o conteúdo mostra Skeleton com o formato do cabeçalho (círculo 96, duas linhas de texto, dois tiles) e de 3 linhas de lista. [NAV]
- **PF22. Erro:** segue a N24. O cabeçalho vem numa consulta e as seções em outras; se uma seção falha, só ela mostra "Não foi possível carregar. Tentar de novo", e o resto do perfil continua. [NAV]

---

## 7. Layout e acessibilidade

- **PF23. Mobile-first, de 393 a 430px.** A partir de 600px, o perfil fica na coluna central com largura máxima (N27). Nenhuma seção muda de lugar no desktop. [NAV, `PRODUCT.md`]
- **Cabeçalho:** o nome é o `h1` da tela. Cada seção é um `<section>` com `h2`, e cada lista é uma lista (List do DS).
- **Números com rótulo:** o StatTile é lido "274 jogos", nunca "jogos" e "274" soltos (`03-perfil.md` > "Acessibilidade"). O cartel é lido como uma frase.
- **Resultado não é só cor:** o Badge de "Vitória" ou "Derrota" é texto, e a variação de posição tem texto acessível ("subiu 2 posições"), como o DeltaIndicator.
- **Ação de amizade:** o estado entra no nome acessível ("Amigos de Lucas, abrir opções"). Aceitar e Recusar dizem de quem: "Aceitar pedido de Lucas".
- **Alvos de toque de 48px** em toda linha e botão (`TOKENS.md`).

---

## 8. Componentes e critérios de aceite

Lista para o design system. Os três primeiros são a issue de ENG dos blocos do perfil. O resto reusa o que já existe ou está em PR.

| Componente | Tier | Situação | Uso nesta spec |
| --- | --- | --- | --- |
| **ProfileHeader** | 3 | Novo | Cabeçalho (seção 3) |
| **StatTile** | 2 | Novo | Jogos e amigos (PF5) |
| **RecordLine** | 2 | Novo | Cartel (PF6) |
| Avatar (96) | 1 | No master | Cabeçalho |
| Badge | 1 | No master | Resultado nas partidas recentes; marcos nas temporadas (tom `accent`) |
| ListItem / List | 1 | No master | Vocês, Partidas recentes, Temporadas, lista de amigos |
| EmptyState | 2 | No master | Partidas recentes vazia |
| Skeleton | 1 | No master | Carregando |
| Button | 1 | No master | Ação de amizade, Editar perfil |
| StandingSummaryItem | 3 | Novo, da spec de ranking (RANK seção 9) | Linhas de Rankings (PF10), com a linha de apoio que recebe "Melhor: 3º" (PF14) |
| DeltaIndicator | 1 | Em PR | Variação nas linhas de Rankings, dentro do StandingSummaryItem (PF13) |
| ScoreBlock compacto | 3 | A definir | Placar em linha nas partidas recentes; o inventário do DS prevê a variante |

**Não usados:** Tabs/SegmentedControl (PF1) e Chip. Voltam quando o perfil ganhar abas ou filtro por período.

### 8.1 StatTile

Um número com rótulo, para contagens.

- [ ] Props: `value` (número), `label` (texto no plural, ex.: "jogos"), `href` opcional.
- [ ] Valor em `--text-title-md` bold; rótulo em `--text-label-md`, `--color-foreground-secondary`, abaixo do valor.
- [ ] Números com separador de milhar do pt-BR ("1.204").
- [ ] Com `href`, vira link com state layer, `:focus-visible` e área de 48px; sem `href`, é texto.
- [ ] Nome acessível na ordem "274 jogos" (valor e rótulo lidos juntos).
- [ ] Rótulo no singular quando o valor é 1 ("1 jogo", "1 amigo"): o componente recebe as duas formas ou um formatador.
- [ ] Story com: valor 0, 1, 4 dígitos, com e sem link.

### 8.2 RecordLine

O cartel em uma linha.

- [ ] Props: `wins`, `losses`.
- [ ] Texto "182 vitórias · 92 derrotas" em `--text-body-md`, com o número em bold; singular quando 1.
- [ ] Com `wins + losses === 0`, mostra "Nenhuma partida ainda" em `--color-foreground-secondary`.
- [ ] Cor neutra: vitória não é verde nem derrota vermelha. O cartel é fato, não julgamento, e o verde e o vermelho do DS já significam sucesso e erro.
- [ ] Lido como uma frase pelo leitor de tela.
- [ ] Sem W.O.: só vitórias e derrotas (PF6). As ausências ficam fora do perfil no MVP.
- [ ] Story com: zerado, só vitórias, números grandes, singular.

### 8.3 ProfileHeader

Compõe Avatar 96, nome, @username, dois StatTile, RecordLine e um slot de ação.

- [ ] Props: o jogador (`name`, `username`, `avatar_url`, `total_matches`), `friendsCount`, `wins`, `losses` e `action` (um `ReactNode`: o consumidor passa o botão do estado da amizade ou "Editar perfil", PF7).
- [ ] Layout centralizado, na ordem de PF4. Espaçamentos em `--spacing-*`.
- [ ] Nome como `h1`, em `--text-title-md` bold, até 2 linhas com reticências; @username em `--text-label-md` secondary, 1 linha.
- [ ] Sem foto: iniciais do Avatar.
- [ ] O StatTile de amigos recebe o `href` da lista de amigos.
- [ ] Variante de carregamento (Skeleton com o mesmo formato), para não deslocar o layout quando os dados chegam.
- [ ] Sem dado de ranking, idade, telefone ou categoria (PF4, PF11).
- [ ] Story-galeria: próprio perfil, outro sem amizade, pedido enviado, pedido recebido, amigos, jogador novo, nome longo, sem foto, carregando.

**Fora da issue de ENG:** a página do perfil, as seções Vocês, Rankings, Partidas recentes e Temporadas, o fluxo de editar e as ações de amizade com dados reais. Viram issues de ENG próprias quando a spec for aprovada.

---

## 9. Fora do MVP

| Item | Por quê |
| --- | --- |
| **Gráfico de evolução de posição** | Com o beta começando do zero, a temporada tem 1 a 4 rodadas de foto: poucos pontos para um gráfico dizer algo. "Melhor posição" e "Temporadas" cobrem o JTBD 5 enquanto isso (PF14) |
| **Estatística por período** (1M, 3M, semestre) e aproveitamento em % | "Estatística sem referência" não responde nada (`03-perfil.md`), e o volume do beta é baixo. É a camada que o mercado cobra no plano pago (DISCOVERY §4.2) |
| **Selo de categoria do jogador e trilha de promoção** | A categoria é da inscrição (PF11), e subir de categoria está fora do MVP (DOMAIN §5) |
| **Feed de atividade no perfil** | As partidas recentes e as temporadas já mostram o que o jogador fez. Uma aba de atividade repetiria o feed |
| **Denunciar e bloquear** | Sem chat nem conteúdo livre no MVP, o risco de abuso é baixo. Entra junto com comentários, que são o primeiro conteúdo livre |
| **Perfil verificado e confiabilidade do nível** | Oportunidade de encantamento (Kano), sem app de BT que faça (`07-kano.md`). Depende da relação com o LetzPlay atual (DISCOVERY §7, pergunta 2) |
| **Seguir sem amizade** | O modelo tem só amizade bilateral (R24) |

---

## 10. Decisões e dependências

### Perguntas respondidas

Não há pergunta aberta. As perguntas levantadas pela spec foram respondidas pelo Gabriel (DEC-PERFIL), todas com a recomendação do agente, e viraram regras:

- **PQ1** (estrutura: rolagem única, sem abas) → PF1.
- **PQ2** (bloco "Vocês" no perfil de outro jogador) → PF16, PF17.
- **PQ3** (evolução sem gráfico no MVP) → PF14, PF19 e seção 9.
- **PQ4** (W.O. fora do perfil) → PF6.
- **PQ5** (perfil visível para qualquer jogador com conta) → PF20.

Na mesma decisão: a tabela de classificação mostra a variação em todas as linhas, nos dois sentidos, e a R22 passa a valer só para o feed e as notificações. A emenda da R22 no `DOMAIN.md` é da spec de ranking; aqui ela aparece na PF13.

### Leituras confirmadas

As leituras do agente foram confirmadas na DEC-PERFIL e já estão nas regras: PL1 → PF2; PL2 → PF4; PL3 → PF6; PL4 → PF7; PL5 → PF12; PL6 → PF13; PL7 → PF15; PL8 → PF18.

### Dependências da spec de navegação

As perguntas da spec de navegação (Q1 a Q5) e as leituras de lá foram respondidas pelo Gabriel (26/09 e 29/09/2026). Os pontos daqui que dependiam delas ficaram confirmados:

- **PF18,** "Ver todas" do próprio perfil → Histórico da aba Jogos (NAV N1, N12).
- **Seção 6.2,** CTA "Registrar amistoso" (NAV N19).
- **PF8 e PF9,** engrenagem com configurações e "Editar perfil" como fluxo modal (NAV N4, N8).

Pergunta nova entra aqui com opções, trade-offs e recomendação, e sai quando vira regra.

---

## 11. Métricas de sucesso

Medidas no beta com Rankin e Vila. Sem meta fixa: a primeira rodada define a linha de base.

| Métrica | Definição | Por que importa |
| --- | --- | --- |
| **Perfil do adversário antes do jogo** | % dos confrontos definidos em que um dos lados abriu o perfil do outro antes da data acordada | Mede se o perfil serve ao JTBD 3. Se for baixo, a leitura competitiva não está sendo achada |
| **Porta de entrada do perfil** | De onde vêm as visitas a perfis de outros: feed, partida, classificação, busca, lista de amigos | Mostra qual leitura domina. Muitas vindas da partida e da classificação indicam a competitiva |
| **Saída para o H2H** | % das visitas com o bloco "Vocês" que tocam no H2H | Testa o bloco "Vocês" (PF16, PF17) |
| **Pedido de amizade pelo perfil** | Pedidos enviados a partir do perfil × a partir do card de amizade | Mede a leitura social |
| **Visitas ao próprio perfil entre rodadas** | Sessões com o próprio perfil aberto em semanas sem confronto | Testa se "Temporadas" e "Melhor posição" sustentam o JTBD 5 sem o gráfico (PF14, PF19) |

---

## 12. Riscos para acompanhar no beta

- **Cartel sem contexto.** "182 vitórias · 92 derrotas" não diz contra quem. Um jogador que só joga amistoso contra iniciantes tem cartel melhor que um da categoria A. Se os jogadores lerem o cartel como nível, a próxima versão separa por categoria ou tira o amistoso.
- **Posição exposta a quem não é amigo.** A tabela já é pública, mas ver a própria posição no perfil, aberto por um adversário, pode incomodar quem está no fim. Ouvir os jogadores do beta.
- **Pouco dado no começo.** Com o beta do zero, todo perfil nasce com "0 jogos". Os estados vazios (6.2) carregam o perfil nas primeiras semanas, e a carga das inscrições (R32) pelo menos preenche "Rankings".
- **Perfil duplicado.** A integridade do cadastro (DSC 3.1) não é resolvida por esta spec: um jogador com duas contas tem dois perfis com cartéis parciais. É do cadastro e da relação com o LetzPlay atual.
