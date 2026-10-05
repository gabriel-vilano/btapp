# 01 — Ranking

A tela que carrega o "coração emocional" do produto (`docs/PRODUCT.md`). Aqui o jogador lê a posição, a variação e a distância para as Finals.

**JTBDs:** 2 (saber onde estou no ranking) principal; 5 (sentir que estou evoluindo) e 3 (avaliar adversário) secundários.
**Oportunidades relacionadas (`DISCOVERY.md`):** 2.2 explicar a pontuação, 2.3 corrida às Finals com linha de corte, 2.4 ranking individual × dupla.

---

## Resumo

- **Dois gêneros de UI disputam esta tela:** a **tabela de classificação** dos apps de liga (Premier League, NBA, FotMob, MLS), densa em colunas, e o **leaderboard social** dos apps gamificados (Duolingo, Strava, Mimo, Bump), com avatar, uma métrica e a própria linha em destaque. O ranking de BT fica entre os dois: tem poucas colunas (posição, jogador/dupla, pontos) mas é pessoal como um leaderboard.
- **A própria linha em destaque é o padrão mais consistente** do gênero social (6 de 9 apps de leaderboard observados).
- **A linha de corte (zona) é o padrão mais útil para as Finals** e aparece nos dois gêneros: "Promotion zone" no Duolingo e no Uxcel, linha tracejada ou barra lateral colorida nas tabelas de liga.
- **Quase ninguém desenha a queda.** Subir ganha tela cheia, confete e botão de compartilhar; descer aparece só como seta vermelha na lista. Isso coincide com a decisão do `FEED_CARDS.md` (queda com fundo neutro).

---

## Padrões recorrentes

### 1. Linha do próprio usuário em destaque

**Observado em 6 de 9 apps de leaderboard:** Bump, Life Reset, Duolingo, Uxcel Go, Mimo, theScore (time seguido em negrito). Três tratamentos:

| Tratamento | Quem usa | O que observar |
| --- | --- | --- |
| **Fundo de marca cheio** (texto invertido) | Life Reset (laranja), Mimo (verde) | Máxima ênfase. Funciona em lista longa, mas compete com as cores de subir/descer quando a marca é verde ou vermelha |
| **Fundo sutil** (cinza ou tom claro) | Duolingo (cinza), Uxcel Go (verde claro) | Destaque sem gritar. É o tratamento que convive melhor com setas coloridas na mesma linha |
| **Linha "levantada"** (card flutuante sobre a lista, com sombra) | Bump | A linha sai do fluxo e vira um objeto. Carrega também o delta (`+7.17`) e a seta |

Quando o usuário está fora da parte visível, os apps resolvem de dois jeitos: **seção separada "você"** (Vivino: "Your rank 478392" no topo e uma seção "network" abaixo do top 3) ou **aviso** (Fi: banner "Maggie não está no top 100k"). Nenhuma tela observada mostra a linha fixa (sticky) no rodapé durante o scroll, mas o padrão é conhecido do Strava web (**inferência**, não confirmado no Mobbin).

### 2. Variação de posição (delta)

**Observado em 6 apps:** Bump, Life Reset, Box Box Club, Premier League (fantasy), Apple Sports, Beli.

- **Seta + número** abaixo ou ao lado da posição (Box Box Club: chevron duplo verde "▲ 5" ou vermelho "▼ 15" sob o número). É o formato mais legível quando a variação é grande.
- **Só ícone** em círculo colorido na coluna de posição (Premier League fantasy). Economiza largura, mas perde a magnitude.
- **Delta da métrica, não da posição** (Life Reset: "52 ▲" em pontos; Bump: "+7.17"). Responde "quanto ganhei", não "quantas posições subi".
- **Traço neutro para "manteve"** (Premier League: "–").

WCAG 1.4.1 (Uso de cor) exige que subir e descer não dependam só de verde e vermelho. Todos os exemplos observados usam seta **e** cor, o que satisfaz a regra (**documentado**, WCAG 2.2).

### 3. Linha de corte e zonas

**Observado em 6 apps:** Duolingo e Uxcel Go (divisor "↑ Promotion zone ↑" entre linhas), MLS (linhas tracejadas entre posições 4/5 e 7/8), Apple Sports (triângulos pequenos à esquerda e linha tracejada), FotMob (barra vertical colorida na borda esquerda: verde para vaga na Champions, azul para Europa League), NBA (lista partida em seções "East leaders" e "East wild card").

É o padrão que traduz melhor a regra das **Finals por posição numa data de corte** (oportunidade 2.3). Dois estilos:

- **Divisor com texto** (Duolingo): diz o que a linha significa. Mais claro para quem não conhece a regra.
- **Marcação na borda** (FotMob, MLS): mais discreta, depende de legenda. Funciona para quem já conhece a regra.

### 4. Filtros de escopo

Quase todos os rankings têm pelo menos um eixo de filtro:

- **Categoria / divisão** como tabs no topo (NBA, NFL, MLS, Premier League: "Eastern / Western", "Division / Conference / League"). Mapeia direto para "Simples B / Duplas Masc. C".
- **Período** como chips (Strava: "All-time / This year"; Azar: "Today / This week / All time"; Blank Street: "Day / Week / Month / All time").
- **Recorte social** (corner: "New York / Global"; Beli: "All members" em dropdown; Strava: "Following" em outra tela). Ecoa o JTBD 4.
- **Visualização** (FotMob: "Short / Full / Form"). Mesma tabela com mais ou menos colunas. Interessante para as duas leituras do perfil (social × competitiva).

### 5. Topo 3 com tratamento próprio

Pódio visual (Digg: #1 ao centro e maior), medalhas ou troféus nas três primeiras linhas (Mimo, BitePal, corner), ou hero do líder (Strava: coroa, tempo em display e nome do "CR" acima da lista). Funciona para rankings em que o topo é inalcançável para a maioria; no BT de arena, o topo são jogadores que a pessoa conhece.

### 6. Temporada e contagem regressiva

Duolingo ("1 day"), Mimo ("6d 3h 10m"), Life Reset ("Season 7 · 25d 13h left" + barra "166 XP to Silver IV"). Corresponde ao **semestre** do ranking de BT e à data de corte das Finals.

### 7. Momento de subir (tela de celebração)

**Observado em 8 apps** na busca por celebração: Duolingo ("You moved up to the Silver League", troféu, botão Continue), Yahoo News ("You moved up to Seeker · 15 more reads until Explorer", Share), Tripadvisor (marco com trilha de progresso 1-2-3-5-10-20-50-100+), Runna (medalha e confete), Numo, How We Feel, Any Distance, LinkedIn (resultado do jogo com prévia do leaderboard).

Padrão comum: **hero centralizado + uma frase + próximo marco + CTA (continuar ou compartilhar)**. Nenhum dos 8 tem versão para "desceu".

---

## Exemplos

| App | Categoria | O que observar | Link |
| --- | --- | --- | --- |
| Duolingo | Educação (liga) | Tiers no topo, contagem regressiva, divisor "Promotion zone", própria linha em cinza | [tela](https://mobbin.com/screens/7015949b-ed19-42f7-9f94-c08794c95c8a) |
| Duolingo | Educação | Celebração de promoção de liga | [tela](https://mobbin.com/screens/790f98ad-76bd-4145-91ba-9c8173dc99d4) |
| Uxcel Go | Educação | Própria linha em verde claro, divisor de zona abaixo dela | [tela](https://mobbin.com/screens/8baf7fae-7014-4821-bc86-766c38f3635d) |
| Mimo | Educação | Própria linha em verde cheio, troféus no top 3, tiers bloqueados | [tela](https://mobbin.com/screens/2fd042e9-2f51-458c-9e1d-12c023dece3c) |
| Life Reset | Hábitos | Header de tier com barra "XP para o próximo", temporada, delta por linha | [tela](https://mobbin.com/screens/f6f2a12c-eebc-4d5b-83f5-353e1cf9a5da) |
| Bump | Social | Própria linha levantada como card flutuante com delta | [tela](https://mobbin.com/screens/88393975-8ac9-4b99-bae5-c12a943287b9) |
| Box Box Club | Esporte (F1) | Delta de posição com chevron e número sob a posição | [tela](https://mobbin.com/screens/47acfd35-2639-4115-b96c-d37f95c6efd5) |
| Premier League | Esporte (fantasy) | Coluna Pos com ícone de subida/descida e traço para "manteve" | [tela](https://mobbin.com/screens/d9e1225e-2ec5-4cf3-b418-3af7221409a8) |
| FotMob | Esporte | Barra lateral colorida por zona; toggle Short / Full / Form | [tela](https://mobbin.com/screens/2d3e370c-7780-4b5f-9f3c-133a91b6c063) |
| MLS | Esporte | Linhas tracejadas como corte de playoff; tabs de conferência | [tela](https://mobbin.com/screens/a9512f7d-5199-4e30-9c73-0ee038fb96e5) |
| Apple Sports | Esporte | Triângulos de zona discretos e tabela compacta em card | [tela](https://mobbin.com/screens/efdc453c-7860-4314-9b20-a4f31133a761) |
| NBA | Esporte | Lista partida em seções (líderes × wild card) com tabs e segmented | [tela](https://mobbin.com/screens/e7c037b1-41d4-4a60-ab5c-3f87d42a86a1) |
| theScore | Esporte | Time seguido em negrito dentro da tabela | [tela](https://mobbin.com/screens/1d4bf7ee-e00f-4360-8986-646663f5605f) |
| Strava | Fitness | Hero do líder (coroa), chips de período e gênero, rodapé "dispute a coroa" | [tela](https://mobbin.com/screens/bfaa6f9c-b9c9-4a71-b6b9-6e049959832a) |
| Vivino | Social | "Seu rank" no topo, top 3 global e seção da rede | [tela](https://mobbin.com/screens/8404b7ee-c979-40d6-a145-ece40054f0a8) |
| Beli | Social | Segmented por métrica + dropdowns de membros e cidade | [tela](https://mobbin.com/screens/6c8c2ab7-5171-4041-b586-e717aed36b6c) |
| Fi | Pet / fitness | Banner explicando que o usuário está fora do top | [tela](https://mobbin.com/screens/e2c2c412-1be6-4e1e-8f48-5960e7c426c3) |
| Digg | Social | Pódio top 3 com #1 central | [tela](https://mobbin.com/screens/f795dc8e-8d8f-4cf2-bc82-5486ab6e3540) |
| Tripadvisor | Viagem | Celebração de marco com trilha de progresso até o próximo nível | [tela](https://mobbin.com/screens/804736fe-67f5-4943-a85d-ffd6aef70814) |
| Yahoo News | Mídia | Celebração com "faltam X para o próximo" e Share | [tela](https://mobbin.com/screens/39200ee8-5742-4e3c-878a-f17067e441d1) |

Amostra: 50 telas vistas em 5 buscas, 34 usadas, de 30 apps. Descartadas: telas de cripto, finanças e rankings de conteúdo sem relação com pessoas (OKX, BitePal parcial, Formula 1 "Performance").

---

## Caminhos possíveis

Não são excludentes. Servem para discutir ênfase.

### A. Lista com a própria linha fixa

Lista completa da categoria, com a linha do jogador em destaque e **fixa no topo ou rodapé** quando sai da área visível.

- **A favor:** o jogador sempre vê a própria posição sem perder o contexto de quem está em volta. Serve ao JTBD 3 (ver adversários próximos).
- **Contra:** exige cuidado técnico (sticky + scroll + leitor de tela anunciando a linha duas vezes). Em ranking longo (100+), o contexto de "quem está perto" some.
- **Referências:** Bump, Duolingo, Mimo, Strava (web).

### B. Hero pessoal + lista

O topo da tela é **o jogador**: posição em display, delta, pontos e distância até a linha das Finals. A lista vem abaixo.

- **A favor:** coloca o momento emocional em primeiro plano, como o `FEED_CARDS.md` fez com o card de ranking (posição em `display-sm`, delta abaixo). Resolve "onde estou" em um olhar.
- **Contra:** empurra a lista para baixo. Quem abre para ver o ranking dos outros (leitura competitiva) rola mais.
- **Referências:** Life Reset (header de tier com barra), Vivino ("Your rank"), Strava (hero do líder, mesma estrutura aplicada a outra pessoa).

### C. Lista em zonas

A lista é dividida pela **linha das Finals** (e, se existir, pela zona de promoção ou rebaixamento de categoria). O divisor diz o que a linha significa.

- **A favor:** torna visível a regra que o jogador mais precisa entender (oportunidade 2.3). É o padrão mais "de domínio" dos três.
- **Contra:** depende de o organizador ter regra de corte cadastrada. Em ranking sem Finals, a zona não existe e a tela fica igual à A.
- **Referências:** Duolingo, Uxcel Go (divisor com texto), FotMob, MLS (marcação discreta).

### Para o momento de subir e descer

1. **Tela de celebração (interstitial)** ao abrir o app depois de subir, como no Duolingo. Máximo impacto, custa uma interrupção.
2. **Feedback inline:** o delta anima na própria lista ou no hero. Menos intrusivo, fácil de perder.
3. **Só o card do feed** (já especificado) + compartilhar. Zero tela nova; o momento vira social.

Para a queda, as referências não oferecem modelo. É uma lacuna de mercado e uma decisão de tom do Gabriel.

---

## O que funciona e o que evitar

- ✅ **Seta + número + cor** para a variação. Nunca só cor (WCAG 1.4.1).
- ✅ **Divisor com texto** para regras que o usuário não conhece ("Classificam para as Finals").
- ✅ **Recorte social** (amigos) ao lado do recorte oficial: transforma a tabela em motivo de conversa (Beli, corner, Vivino).
- ❌ **Tabela com muitas colunas no mobile.** NBA e MLS rolam na horizontal a 393px. O ranking de BT tem poucas métricas; usar tabela larga é importar um problema que não existe.
- ❌ **Fundo de marca cheio na própria linha quando a marca é da mesma família do "subiu"/"desceu".** O coral da marca fica perto do vermelho de queda (`--color-red-600`). Tratamento a testar com cuidado (**inferência**).
- ❌ **Celebrar posição que não mudou.** O `FEED_CARDS.md` já diz: variação zero não gera card. Vale o mesmo para a tela.

## Acessibilidade

- O WAI-ARIA APG **não tem padrão de leaderboard** (**documentado**, ausência). As opções semânticas são `<table>` (quando há colunas comparáveis) ou `<ol>` (lista ordenada, com a posição implícita). Tabela dá cabeçalhos de coluna ao leitor de tela; lista é mais simples e casa com linhas-card.
- Tabs de categoria seguem o padrão **Tabs** do APG (setas movem entre abas, `aria-selected`). Segmented control com 2 ou 3 opções também pode ser **radio group**. Ambos precisam ser implementados à mão no DS.
- Linha fixa (caminho A): garantir que ela não fique duplicada para o leitor de tela (`aria-hidden` na cópia fixa, ou link "ir para minha posição").

## Relação com o que já existe

- `RankingBlock` e `RankingCard` (branch `feature/feed-cards`) já têm a unidade **posição + delta + pontos + badge de marco**. Um hero de ranking (caminho B) pode reusar a mesma gramática.
- Não existem no DS: Tabs, SegmentedControl, Chip de filtro, linha de ranking, divisor de zona, Badge. Ver o inventário.

## Perguntas para o Gabriel

1. O jogador abre o ranking mais para **se ver** (hero, caminho B) ou para **ver os outros** (lista, caminhos A e C)?
2. Todo ranking do MVP tem Finals com linha de corte? Se não, a zona (C) precisa de estado "sem corte".
3. Ranking de dupla mostra **dois avatares e dois nomes** por linha, ou o ranking é sempre individual (oportunidade 2.4)?
4. Queda merece algum tratamento além da seta vermelha? Encorajamento ("faltam 40 pts para voltar") ou silêncio?
