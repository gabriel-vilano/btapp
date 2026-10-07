# Referências visuais

Levantamento de padrões de UI para as superfícies do produto, feito em setembro de 2026. Um arquivo por superfície e um inventário que consolida os componentes.

> **Este diretório não decide nada.** Cada superfície lista padrões recorrentes, caminhos possíveis com trade-offs e a relação com os JTBDs. A escolha é do Gabriel. Specs aprovadas vão para docs próprios (como o `FEED_CARDS.md`).

## Arquivos

| # | Superfície | Arquivo |
| --- | --- | --- |
| 1 | Ranking | [`01-ranking.md`](01-ranking.md) |
| 2 | Feed de atividade | [`02-feed.md`](02-feed.md) |
| 3 | Perfil do jogador | [`03-perfil.md`](03-perfil.md) |
| 4 | Head-to-head | [`04-head-to-head.md`](04-head-to-head.md) |
| 5 | Registro de partida e placar | [`05-registro-placar.md`](05-registro-placar.md) |
| 6 | Descoberta de competições | [`06-descoberta-competicoes.md`](06-descoberta-competicoes.md) |
| 7 | Navegação | [`07-navegacao.md`](07-navegacao.md) |
| — | Inventário de componentes | [`inventario-componentes.md`](inventario-componentes.md) |

## Como ler

**Evidência.** Toda afirmação carrega uma de três marcas:

- **Observado:** está na tela do Mobbin ou do site citado. Medidas (raio, altura, espaçamento) são sempre estimativa.
- **Documentado:** vem de um design system, de uma norma (WCAG, WAI-ARIA APG) ou da documentação do produto.
- **Inferência:** leitura do agente. Serve para abrir discussão, não para fechar.

**Frequência.** Quando um padrão diz "7 de 12 apps", a contagem é **por app**, não por tela. Um app com muitas telas não distorce a conta.

**Links.** Todas as telas apontam para o `mobbin_url` (exige conta no Mobbin). Nenhuma imagem de terceiros foi copiada para o repo, por direito autoral. Onde a tela importa, o texto descreve **o que observar** nela.

**Viés da amostra.** O Mobbin cobre bem apps globais (Strava, Duolingo, Premier League, FotMob) e mal os apps de nicho de raquete brasileiros. Não há tela do concorrente principal, do Tênis Integrado ou do Playtomic no Mobbin: esses entram por site e loja de apps, com evidência mais fraca. O Mobbin também não cobre Android; o Material 3 entra como referência documentada.

## Relação com outros docs

- **JTBDs e princípios:** `docs/PRODUCT.md`; **tiers do Storybook:** `.claude/rules/storybook.md`
- **Evidência de mercado e oportunidades por JTBD:** `docs/DISCOVERY.md` (PR do mapa de oportunidades, ainda aberto). Estes arquivos citam as oportunidades pelo número de lá (ex.: "oportunidade 2.3").
- **Cards do feed (spec aprovada):** `docs/FEED_CARDS.md`, na branch `feature/feed-cards`. O arquivo do feed aqui não repete a spec: compara com o mercado e aponta o que ela ainda não cobre.
- **Tokens:** `docs/TOKENS.md`
