# 07 — Navegação

Tab bar × menu, e como apps de esporte organizam a arquitetura de informação. É a superfície que ataca o problema 2 do audit: **"menu com 19+ itens, busca duplicada, perfil sobrecarregado"** (`docs/PRODUCT.md`, seção "Problemas do concorrente principal que o produto quer resolver (hipóteses)"; o audit completo é o documento "Auditoria do app atual", projeto Discovery e estratégia no Linear).

**JTBDs:** todos, indiretamente. A navegação decide qual JTBD está a um toque e qual está a três.

---

## Resumo

- **Tab bar inferior com 4 ou 5 destinos é unânime** na amostra: 28 de 28 apps de esporte e fitness observados ao longo das 7 superfícies. Nenhum usa menu lateral (hamburger) como navegação principal. O NFL tem um ícone de menu, mas **como quinta aba**.
- **As diretrizes das plataformas concordam no número e divergem numa regra:** o Material 3 fixa **3 a 5 destinos** e o HIG pede "o número apropriado, lembrando que menos é mais fácil". O HIG diz **"use a tab bar para navegação, não para ações"**, e o Strava, referência do produto, coloca **"Record" como aba central**. É a divergência mais importante desta superfície.
- **Perfil como última aba** (muitas vezes com o avatar no lugar do ícone) aparece em 8 apps de fitness e social. **Ranking/leaderboard como aba própria** em 4 (Mimo, Beli, Fi, Duolingo).
- **"More" como quinta aba** é comum nos apps de liga e de dispositivo (FotMob, Premier League, Formula 1, Garmin; o "Discover" do NBA faz o mesmo papel). O HIG pede para **evitar** a aba de overflow.

---

## Padrões recorrentes

### 1. Inventário de tab bars observadas

Contagem por app, com as telas vistas em todas as buscas desta pesquisa (**observado**):

| App | Abas (esquerda → direita) | Observação |
| --- | --- | --- |
| Strava | Home · Maps · **Record** · Groups · You | Ação no centro; badge numérico na Home |
| Mimo | Learn · Practice · Build · **Leaderboard** · Profile | Ranking como aba |
| Beli | Feed · Your Lists · **＋ (Search)** · Leaderboard · Profile (avatar) | Botão central em círculo cheio |
| Fi | Live · Health · **Rank** · Community · (avatar) | Ranking no centro |
| Duolingo | 6 ícones sem rótulo (inclui liga) | Excede o limite do Material 3 |
| Peloton | Home · Feed · Workouts · Challenges · Profile (avatar) | Feed e Home separados |
| adidas Running | Feed · Community · Activity · Progress · Profile | Badge "4" no Feed |
| Nike Run Club | Home · Plans · Run · Club · Activity | "Run" é ação, mas sem destaque |
| AllTrails | Explore · Community · Navigate · Saved · Profile | |
| Ladder | Workouts · Chat · Teams · Profile · Upgrade | Upsell como aba |
| Tonal | Home · Activity · Explore · Custom · Settings | Configurações como aba |
| Garmin Connect | Home · Challenges · Calendar · News Feed · More | **Tab bar editável** pelo usuário |
| WHOOP | Home · Plan · Community · More + **botão de ação flutuante** | Ação fora da tab bar |
| Fitbit | Today · Coach · You + **FAB** | 3 abas |
| Cal AI | Home · Progress · Settings + **FAB** | 3 abas |
| Apple Fitness | Summary · Fitness+ · Workout · Sharing | Barra flutuante |
| FotMob | Matches · News · Leagues · Following · More | |
| theScore | News · Scores · Favorites · Discover · Leagues | |
| Premier League | Latest · PL · Fantasy · Stats · More | |
| Formula 1 | Home · Schedule · Results · Fantasy · More | |
| NBA | Home · Games · NBA Cup · Moments · Discover | "Discover" funciona como More |
| MLS | Home · Matches · **(logo)** · News · Standings | Centro é marca, não ação |
| NFL | 5 ícones sem rótulo, centro "NFL+", último é menu | |
| DAZN | Home · Scores · Schedule · Sports | |
| Vivino | Home · Shop · **(câmera)** · My Wines · More | Ação no centro |
| Luma, Fixtured, timespent | 3 a 4 ícones em **pílula flutuante** | Estilo iOS 26 (Liquid Glass) |

Frequências (por app, 28 apps):

- **5 abas:** 19. **4 abas:** 5. **3 abas:** 3. **6 abas:** 1 (Duolingo).
- **Rótulo em todas as abas:** 24. **Só ícone (ou rótulo só na aba ativa):** 4 (Duolingo, NFL, Fixtured, timespent).
- **Ação no centro da tab bar:** 4 (Strava, Beli, Vivino, NFL+ como assinatura). **Ação em FAB fora da barra:** 3 (WHOOP, Fitbit, Cal AI).
- **"More" ou menu como aba:** 7 (FotMob, Premier League, Formula 1, Garmin, WHOOP, Vivino, NFL).
- **Perfil (ou "You") na última posição:** 8 (Strava, Mimo, Beli, Fi, Peloton, adidas, AllTrails, Fitbit).

### 2. O que as diretrizes dizem (documentado)

| Regra | Material 3 (navigation bar) | Apple HIG (tab bars) |
| --- | --- | --- |
| Número de destinos | "três a cinco". Menos de três: use tabs. Mais de cinco: use rail ou menu | "o número apropriado"; "é mais fácil navegar entre menos abas"; se permitir customizar, "padrão de cinco ou menos" |
| Rótulos | 1 a 2 palavras | "Inclua rótulos"; "palavras únicas sempre que possível" |
| Badges | Pequeno para "tem novidade", grande para contagem | "Reserve badges para informação crítica" |
| Ações | (não trata) | "Use a tab bar para navegação, **não para ações**" |
| Overflow | (não trata) | "Evite abas de overflow"; a aba More esconde conteúdo |
| Aba vazia | (não trata) | "Não desabilite nem esconda abas"; explique por que a seção está vazia |

Fontes: Material Design 3, "Navigation bar – Guidelines"; Apple Human Interface Guidelines, "Tab bars" (ambas lidas em 25/09/2026).

### 3. Onde ficam notificações e busca

- **Sino e mensagens no topo** da Home (Strava: busca à esquerda, chat e sino à direita; Garmin; Fitbit). Nenhum app da amostra usa notificações como aba.
- **Busca no topo** (Strava, Apple Sports) ou **como aba** (Beli, HIG permite "uma aba de busca dedicada no fim"). O audit cita **busca duplicada** no app atual: a regra de ouro é um lugar só (**inferência**).

### 4. "More" bem e mal feito

- **FotMob:** seis itens, cada um com ícone e descrição de uma linha ("Notifications: gerencie avisos de notícias, times e jogadores"). Curto e escaneável.
- **Premier League, NBA, NFL:** listas longas com dezenas de itens em seções. É o "menu com 19+ itens" do audit, só que escondido atrás de uma aba.
- **Garmin:** oferece "Edit Tab Bar" dentro do More: o usuário escolhe o que sobe para a barra.

---

## Exemplos

| App | O que observar | Link |
| --- | --- | --- |
| Strava | "Record" como aba central; sino e chat no topo | [tela](https://mobbin.com/screens/93f9acfd-853d-4ea2-bd54-3bc62155b2ce) |
| Mimo | Leaderboard como aba, com a própria linha em destaque | [tela](https://mobbin.com/screens/2fd042e9-2f51-458c-9e1d-12c023dece3c) |
| Beli | Botão central cheio e Leaderboard como aba | [tela](https://mobbin.com/screens/6c8c2ab7-5171-4041-b586-e717aed36b6c) |
| Fi | "Rank" no centro da barra; avatar como última aba | [tela](https://mobbin.com/screens/e2c2c412-1be6-4e1e-8f48-5960e7c426c3) |
| WHOOP | Ação principal em botão flutuante, fora da tab bar, com coach mark | [tela](https://mobbin.com/screens/94aab7d4-0c76-45dd-932d-45a5b9663d4e) |
| Fitbit | Três abas + FAB | [tela](https://mobbin.com/screens/5caa4d54-68bd-4f9b-ab84-d4c7abc0c61a) |
| FotMob | "More" curto, com descrição por item | [tela](https://mobbin.com/screens/b67afcc2-ca7d-4e04-8b04-262a42be7733) |
| Garmin Connect | "More" com "Edit Tab Bar" | [tela](https://mobbin.com/screens/4d19f2a3-a5fe-4f90-990d-33aa9e8f0526) |
| Premier League | "More" longo, em seções | [tela](https://mobbin.com/screens/5068ccd3-38a1-49ed-b350-11ba43e1c0bd) |
| NBA | "Discover" como More, lista longa | [tela](https://mobbin.com/screens/910d57d3-10c0-4a7d-9bb9-1d3d1e03a0b7) |
| adidas Running | Tela de gravação sob a aba "Activity", badge no Feed | [tela](https://mobbin.com/screens/22d947a4-374b-4130-982d-c45ab5c6e7d1) |
| Apple Fitness | Barra flutuante com 4 abas | [tela](https://mobbin.com/screens/35c82e3b-a43e-47c5-ae01-573f85d5a8ba) |

Amostra: 16 telas em 2 buscas desta superfície, mais as tab bars visíveis nas 23 buscas anteriores. Apps contados uma vez cada.

---

## Caminhos possíveis

Os nomes das abas abaixo são **ilustrativos**, só para comparar estruturas.

### A. Quatro destinos, sem ação na barra

`Feed · Ranking · Competições · Perfil`. Registrar resultado vive no contexto: card de pendência, página da partida, botão no ranking.

- **A favor:** segue o HIG ao pé da letra; cada aba é um JTBD (4, 2, 1, 5+3). Barra calma, rótulos cabem em português ("Competições" é a palavra mais longa, 11 letras).
- **Contra:** registrar resultado, que é o gargalo do produto (risco H1), fica sem atalho global.
- **Referências:** DAZN, Apple Fitness (4 abas).

### B. Cinco com ação no centro

`Feed · Ranking · (＋ Registrar) · Competições · Perfil`. O centro abre o registro de partida.

- **A favor:** registrar vira gesto de um toque, de qualquer lugar. É o modelo do Strava, que o produto já usa de referência. Ataca diretamente o cold start de dados.
- **Contra:** contraria o HIG ("não para ações"). O jogador registra algumas partidas por semana e navega dezenas de vezes: o espaço mais nobre da barra fica ocioso na maior parte do tempo (**inferência**).
- **Referências:** Strava, Beli, Vivino.

### C. Quatro destinos + ação contextual

Quatro abas (como A) e um **botão flutuante** ou **card fixo** que aparece só onde faz sentido (feed e ranking), ou só quando há partida a registrar ou confirmar.

- **A favor:** mantém a barra limpa e ainda dá atalho. A ação some quando não tem o que fazer.
- **Contra:** FAB sobre card de feed cobre conteúdo; precisa de regra de quando aparece. Descoberta menor que a aba central.
- **Referências:** WHOOP, Fitbit, Cal AI.

### Para o que não cabe nas abas

1. **Sem "More":** configurações e conta dentro do Perfil (Strava, Peloton). O HIG recomenda evitar overflow.
2. **"More" curto e descrito** (FotMob), com no máximo 6 itens.
3. **Tab bar editável** (Garmin). Poderoso, mas é complexidade que um MVP dificilmente precisa.

### Para quem joga mais de um ranking

A aba Ranking pode abrir **direto no ranking principal** com um seletor no topo (MLS: dropdown de temporada; NBA: tabs de conferência) ou numa **lista "Meus rankings"** que leva a cada um. É uma decisão de IA que depende de quantos rankings um jogador típico disputa.

---

## O que funciona e o que evitar

- ✅ **Rótulo em toda aba**, uma palavra, em português. Os dois guias concordam.
- ✅ **Badge só para o crítico:** resultado a confirmar é crítico (muda o ranking de outra pessoa); curtida nova não é.
- ✅ **Perfil com avatar** na última aba: reforça "esta é você" e é padrão em 8 apps.
- ❌ **Menu lateral** como navegação principal. Nenhum app de esporte da amostra usa; é a raiz do "19+ itens" do audit.
- ❌ **"More" com lista longa.** Só muda o problema de lugar.
- ❌ **Aba escondida ou desabilitada** quando vazia (HIG). Ranking sem ranking deve explicar ("Você ainda não está em nenhum ranking") e oferecer a descoberta.

## Acessibilidade

- Tab bar de app é **navegação**, não o widget Tabs do APG. A marcação é `<nav aria-label="Principal">` com links, e a aba atual com `aria-current="page"` (**documentado**, WAI-ARIA 1.2 e MDN `aria-current`). Usar `role="tablist"` numa barra de rotas é um erro comum.
- Rótulo visível = nome acessível. Se a aba for só ícone, `aria-label` no link.
- Badge: incluir a contagem no nome acessível ("Feed, 3 novidades"), não só visualmente.
- Tap target: 48px (`--dimension-tap-target-minimum`); a barra precisa respeitar a safe area inferior do iOS.

## Relação com o que já existe

`Icon` e `TextLink` existem. Faltam: TabBar (navegação principal), Badge de contagem, TopBar/AppHeader (título, busca, sino), FAB se o caminho C for escolhido. Ver o inventário.

## Perguntas para o Gabriel

1. **Registrar resultado** merece lugar na barra (B), um atalho contextual (C) ou só o fluxo contextual (A)?
2. **Competições** (descoberta) é aba própria ou vive dentro do Ranking ou do Feed? Com torneios fora do MVP, talvez ainda não mereça aba.
3. Onde ficam **notificações**: sino no topo do Feed (padrão da amostra) ou aba?
4. O app tem **busca global** (jogadores, arenas, competições) ou cada seção tem a própria? O audit aponta busca duplicada no app atual.
5. Um jogador típico disputa **quantos rankings ao mesmo tempo**? Decide se a aba Ranking abre direto num ranking ou numa lista.
