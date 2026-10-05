# 03 — Perfil do jogador

O perfil tem **duas leituras** (`docs/PRODUCT.md`): a **social**, de quem acompanha um amigo, e a **competitiva**, de quem avalia um adversário. E uma terceira quando o perfil é o **próprio**: evolução.

**JTBDs:** 3 (preparar-me para um confronto) e 4 (acompanhar amigos) no perfil dos outros; 5 (sentir que estou evoluindo) no próprio perfil.
**Oportunidades relacionadas (`DISCOVERY.md`):** 3.1 confiança no nível do adversário (histórico de categoria visível), 5.1 evolução ao longo do tempo, 5.2 marcos de promoção de categoria.

---

## Resumo

- **Apps de esporte profissional e apps de fitness social constroem o perfil de formas opostas.** Os de liga abrem com **cartel e estatística** (DAZN: "Wins 24 · KOs 15 · Losses 0" logo abaixo do nome). Os de fitness abrem com **seguidores e atividade** (Strava, Garmin, Peloton). O produto precisa das duas, e nenhum app observado faz as duas bem na mesma tela.
- **Tabs são a forma dominante de separar as leituras:** 7 de 14 apps (FotMob, theScore, Garmin, Peloton, MLS, adidas Running, Ladder).
- **A posição no ranking aparece no cabeçalho** nos apps de esporte individual: theScore (golfe: "World Rank 176 · FedEx Cup Rank 77 >"), Box Box Club (F1: "01 POS · 204 PTS" em display).
- **Nível como cor e trilha de progresso** (Nike Run Club: nível "Orange", "faltam 43 mi para o próximo marco") é o análogo mais próximo de **categoria de BT** (D, C, B) com promoção.
- **Comparar comigo** dentro do perfil do outro (Duolingo: gráfico "JohnSmith × Você") é a ponte natural entre perfil e head-to-head.

---

## Padrões recorrentes

### 1. Cabeçalho: quem é + o que conta

| Tratamento | Quem usa | O que carrega |
| --- | --- | --- |
| **Hero com foto grande** e nome sobre a foto | DAZN, MLS, Box Box Club | Identidade forte. Depende de foto boa, que jogador amador raramente tem |
| **Avatar + nome + linha de ranking** | theScore (golfe), FotMob | "World Rank 176 · FedEx Cup 77 >", clicável para o ranking |
| **Avatar + contadores sociais** | Strava ("Following 77 · Followers 670 · Activities 1,103 · Weekly streak 76"), Garmin, Peloton, AllTrails | Leitura social. Nenhum número competitivo no topo |
| **Linha de cartel** sob o nome | DAZN ("WINS 24 · KOS 15 · DRAWS 0 · LOSSES 0") | Leitura competitiva em uma linha. É o formato mais compacto observado para V/D |

Ações no cabeçalho: **Seguir** em 5 apps (FotMob, DAZN, MLS, theScore com estrela, Strava). Compartilhar perfil em 3 (Strava, Garmin, adidas).

### 2. Separação por tabs

**Observado em 7 apps.** Os rótulos mais comuns:

- **Visão geral / Overview** (MLS, Peloton)
- **Partidas / Matches / Results / Game log** (FotMob, theScore)
- **Estatísticas / Stats** (FotMob, theScore, Garmin, MLS)
- **Conquistas / Achievements / Badges** (Peloton, Ladder)
- **Atividade / Activity** (Garmin)

Filtros dentro da aba: **temporada** (MLS: dropdown "2025"; Box Box Club: "2026 Season ⌃"), **competição** (MLS: "Regular Season"), **modalidade** (Strava: chips "All ride / Ride / Run / Walk"; adidas: "Cycling / Walking / Running"). No BT, os eixos equivalentes seriam **semestre**, **ranking ou torneio** e **simples × duplas**.

### 3. Estatística em tiles

- **Tiles grandes 2×2** com número em display (Premier League: "Appearances 50 · Goals 50 · Wins 35 · Losses 7"). Leitura em um olhar.
- **Barras horizontais de V/E/D** com contagem (FotMob: "Wins 54 ▬▬ · Draws 9 · Losses 9"). Mostra proporção, não só número.
- **Barra + posição no ranking da métrica** (theScore golfe: "Driving Accuracy 64.6 (28)"). Contextualiza cada número contra os outros.
- **Anéis** (Ladder). Decorativo; pouco informativo para dados de partida.

### 4. Evolução no tempo

**Observado em 8 apps** na busca por gráficos (Bevel, The Outsiders, Oura, Strava, Duolingo, stoic., Bloom, eBay):

- **Seletor de período** "1M · 3M · 6M · 1Y" (Bevel) ou dropdown "Weeks / Months / Years" (stoic.). Padrão consolidado.
- **Faixa de referência** atrás da linha: "Normal range" (Bevel), "Suggested range" (Strava), "Good / Low" (The Outsiders). No BT, a faixa poderia ser a **zona das Finals** ou a **faixa da categoria**.
- **Variação escrita entre períodos** (The Outsiders: segmentos mensais com "+10%", "-7%", "-29%" em verde e laranja). Junta gráfico e delta.
- **Narrativa ao lado do gráfico** (Oura: "Going strong for 3 weeks"; The Outsiders: "You're building a base..."). Transforma dado em frase.
- **Barras por rodada** (Box Box Club: pontos por GP ao longo da temporada). É o formato mais literal para ranking por rodada.

### 5. Nível, marco e conquista

- **Nível com cor e trilha** (Nike Run Club: card laranja "Orange · 49.5 Total miles · 43.04 mi to 1st milestone", barra de progresso). Paralelo direto com categoria e promoção (oportunidade 5.2).
- **Marcos numéricos** (Tonal: círculos "250 / 100 / 50 / 25 Workouts" com check).
- **Badges bloqueados e desbloqueados** (adidas: "0 of 5 Credits", hexágonos com cadeado; Garmin: fila de badges).
- **Calendário de atividade** (Peloton: "30 Day Activity" com dias marcados). No BT, dias com partida.

### 6. Comparar comigo

**Observado no Duolingo** (perfil de outro usuário): gráfico "Weekly progress" com duas linhas, **ele × você**, e legenda com os totais. Logo abaixo: overview (sequência, liga, XP) e conquistas. No fim: Denunciar e Bloquear.

É o único exemplo da amostra que mistura as duas leituras numa tela só: o perfil do outro mostra o outro **em relação a mim**.

---

## Exemplos

| App | O que observar | Link |
| --- | --- | --- |
| DAZN | Hero + linha de cartel "Wins · KOs · Draws · Losses" + Follow | [tela](https://mobbin.com/screens/723d6feb-2a61-4693-9a6d-900dff965c29) |
| theScore | Ranking no cabeçalho ("World Rank 176 · FedEx Cup 77 >"); stats com barra e posição | [tela](https://mobbin.com/screens/15b3c0c9-0264-4cdc-9da8-2db03e6260b2) |
| Box Box Club | "01 POS / 204 PTS" em display, wins/podiums com ícone, barras por rodada | [tela](https://mobbin.com/screens/1ad5195b-03ce-4364-b94b-518ccefa72fd) |
| Premier League | Tiles 2×2 com número em display | [tela](https://mobbin.com/screens/dca78405-22b6-4fb6-b9fc-80ed3538e527) |
| FotMob | Tabs Profile / Stats / Career; barras de V/E/D | [tela](https://mobbin.com/screens/6392888a-4a1f-4f63-adb4-3e0736de6da2) |
| FotMob | Carreira por temporada com nota colorida por linha | [tela](https://mobbin.com/screens/3c10a61c-cb6c-4ec7-ba4b-95a9f3cf5ca9) |
| Strava | Contadores sociais, chips de modalidade, gráfico da semana | [tela](https://mobbin.com/screens/51bce98c-d1b4-40d0-b47e-77a024c21d85) |
| Garmin Connect | Tabs Activity / Stats / About, badges, linha do tempo de atividades, aviso de privacidade | [tela](https://mobbin.com/screens/f61ab14a-19f5-43c8-bb62-5090d42529d4) |
| Peloton | Tabs Overview / Workouts / Achievements; calendário de 30 dias | [tela](https://mobbin.com/screens/196735b3-fea7-487c-8dff-3c63c23e79ca) |
| Nike Run Club | Nível como cor + distância até o próximo marco | [tela](https://mobbin.com/screens/6d298284-0016-475e-b33e-2d67e78515fe) |
| Tonal | Marcos em círculos; posição "15,581 of 79,393" | [tela](https://mobbin.com/screens/c648e34b-15c8-44d1-abb8-1a957d7d5150) |
| Duolingo | Perfil do outro com gráfico "ele × você" | [tela](https://mobbin.com/screens/342771f7-1af2-43ae-a30b-1efc00ff2ffc) |
| The Outsiders | Evolução mensal com % de variação entre segmentos | [tela](https://mobbin.com/screens/1d57226d-0c02-452e-8511-46780a137377) |
| Bevel | Seletor 1M / 3M / 6M / 1Y, média e faixa normal | [tela](https://mobbin.com/screens/953c3a4c-960d-4fdd-98cc-3a0a7bac470b) |
| Oura | Gráfico com narrativa "Going strong for 3 weeks" | [tela](https://mobbin.com/screens/4b3112f0-f782-4d9f-89d6-4c3a5a8823b4) |

Amostra: 36 telas em 4 buscas, 30 usadas, de 24 apps. Descartadas: eBay, Bloom, stoic. (gráficos fora de contexto esportivo, usados só para o padrão de seletor de período). **Nenhum app de raquete** (Playtomic, UTR, Tênis Integrado) tem telas no Mobbin; o `DISCOVERY.md` registra por fonte web que Playtomic e UTR mostram nível, H2H e gráfico de evolução, este último como feature paga.

---

## Caminhos possíveis

### A. Tabs por leitura

"Visão geral · Partidas · Estatísticas". O cabeçalho mantém identidade e ação de seguir; cada aba serve a uma leitura.

- **A favor:** padrão mais comum da amostra. Escala quando entrarem novos dados (conquistas, torneios).
- **Contra:** esconde metade do perfil atrás de um toque. Quem veio avaliar adversário pode não achar a aba certa. Tabs precisam de implementação acessível (APG Tabs).
- **Referências:** FotMob, theScore, Garmin, Peloton.

### B. Rolagem única com cabeçalho competitivo

Cabeçalho com **categoria, posição no ranking e cartel** (V/D em uma linha, estilo DAZN), seguido de forma recente, stats, histórico e, no fim, a parte social.

- **A favor:** a leitura competitiva, que é o diferencial do produto, está no primeiro olhar. Nenhuma interação para chegar ao dado.
- **Contra:** a leitura social vai para o fim. Perfis longos no mobile ficam cansativos.
- **Referências:** DAZN, theScore (cabeçalho), Box Box Club.

### C. Perfil do outro "em relação a mim"

O perfil de outro jogador sempre inclui um bloco de comparação (confrontos diretos, posição relativa no ranking, evolução ele × eu), que leva ao H2H completo.

- **A favor:** serve ao JTBD 3 sem criar tela nova; torna o perfil do adversário útil antes do jogo.
- **Contra:** o perfil muda conforme quem vê. Em perfil de amigo sem confronto, o bloco fica vazio e precisa de estado próprio.
- **Referências:** Duolingo.

### Para a evolução (próprio perfil)

1. **Gráfico de posição no ranking** por rodada ou semana (Box Box Club), com a faixa das Finals ao fundo (Bevel, Strava).
2. **Trilha de categoria** (Nike Run Club): categoria atual como cor ou selo, distância até a promoção.
3. **Resumo por período com variação** (The Outsiders, Strava Weekly snapshot): jogos, vitórias e pontos no mês, com "+2 vitórias vs. mês passado".

---

## O que funciona e o que evitar

- ✅ **Cartel em uma linha** (V · D, com W.O. separado, oportunidade 3.3) logo abaixo do nome.
- ✅ **Ranking clicável no cabeçalho** (theScore): o perfil vira porta de entrada para o ranking.
- ✅ **Seletor de período** com poucas opções fixas (1M · 3M · 6M · semestre).
- ❌ **Hero de foto grande** como padrão. Funciona com atleta profissional fotografado; com avatar de celular ou sem foto, vira um bloco vazio (**inferência**).
- ❌ **Anéis e gráficos decorativos** (Ladder). Parecem dado, mas não respondem pergunta nenhuma.
- ❌ **Estatística sem referência.** "64% de vitórias" sozinho não diz se é bom. theScore resolve com a posição entre parênteses; a faixa de referência no gráfico faz o mesmo.

## Acessibilidade

- Tabs: padrão **Tabs** do APG (`role="tablist"`, `aria-selected`, setas para navegar, ativação automática ou manual) (**documentado**).
- Gráfico de evolução: precisa de alternativa textual (resumo em texto ou tabela oculta visualmente). WCAG 1.1.1 (conteúdo não textual). O `aria-label` do SVG deve dizer a conclusão ("subiu de 12º para 5º em 3 meses"), não descrever as linhas.
- Contadores e tiles: o número e o rótulo devem ser lidos juntos, na ordem certa ("35 vitórias", não "Vitórias" e depois "35" soltos). Ordem do DOM = rótulo depois do valor, ou `<dl>`.

## Relação com o que já existe

Existe `Avatar` (branch do feed) e `AvatarUpload` (auth). Faltam: cabeçalho de perfil, StatTile, linha de cartel, Tabs, chips de filtro, gráfico de evolução, badge de categoria, lista de partidas recentes (pode derivar do `ScoreBlock`). Ver o inventário.

## Perguntas para o Gabriel

1. No perfil de **outro** jogador, o que vem primeiro: cartel e ranking (leitura competitiva) ou seguir e atividade (social)?
2. O perfil do outro compara com "mim" (caminho C) ou é neutro?
3. Categoria (D, C, B) é **atributo do jogador** (um selo no cabeçalho) ou **atributo de cada ranking** (o jogador pode ser B num ranking e C em outro)?
4. Evolução é dado público ou só do dono do perfil? (O Garmin avisa "Only you can view your status".)
