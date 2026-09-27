# Inventário de componentes

Consolida os componentes que as 7 superfícies pedem, com o tier da estratégia de Storybook (`CLAUDE.md`), o que já existe e o que falta.

> **Não é backlog.** Nenhuma issue de implementação sai daqui antes de as specs das superfícies serem aprovadas. O inventário serve para enxergar **reuso** (o que aparece em várias superfícies) e **lacunas** (o que o DS ainda não tem) na hora de escrever essas specs.

**Tiers (`CLAUDE.md` > Storybook > Estratégia de cobertura):**
1 = primitivo do DS · 2 = composto com estados ocultos · 3 = bloco reutilizável de feature · 4 = composição final (tela, card completo).

**Onde está o que existe** (em 25/09/2026):

- `master`: `src/components/ui/` (Alert, Button, ButtonLink, FormInput, Icon, TextLink, Toast), `src/components/auth/` (AuthFormContainer, AuthFormHeader, AvatarUpload, OtpInput, PasswordChecklist, ResendTimer), `src/components/icons/Logo`.
- Branch `feature/feed-cards` (ainda não mergeada): `src/components/feed/` (Avatar e AvatarStack, CardShell, CardHeader, CardFooter, ScoreBlock, MetaInfo, CompetitionBlock, RankingBlock, MatchVsBlock, CheerBar, H2HButton, ProfileMiniCard e os cards ActivityCard, ResultCard, MatchCard, EnrollmentCard, FriendshipCard, RankingCard). Têm story: CardHeader, CompetitionBlock, MatchVsBlock, ProfileMiniCard. Nenhum tem MDX.

**Superfícies:** R = Ranking · F = Feed · P = Perfil · H = Head-to-head · S = Registro de placar · D = Descoberta · N = Navegação · A = Agenda (aba "Jogos", `DOMAIN.md` §4) · M = Marcação de jogos (`SCHEDULING.md`).

A e M entraram depois, na auditoria do design system (26/09/2026), junto com os três componentes marcados com ⭐, que a pesquisa das 7 superfícies não tinha levantado.

---

## Visão rápida: o que mais se repete

Os componentes que aparecem em **4 ou mais superfícies** são os de maior retorno. Nenhum deles existe hoje como primitivo.

| Componente | Superfícies | Existe? |
| --- | --- | --- |
| **Badge / Tag** | R, F, P, H, S, D (6) | Parcial: estilos locais no `ResultCard` (`.label`) e no `RankingBlock` (`.badge`) |
| **Avatar** | R, F, P, H, S, D, N (7) | Sim, mas mora em `feed/`, não em `ui/` |
| **Tabs / SegmentedControl** | R, P, H, D (4) | Não |
| **Chip** (filtro e seleção) | R, P, S, D (4) | Não |
| **DeltaIndicator** (▲ 2, ▼ 3, –) | R, F, P, H (4) | Parcial: `.delta` local no `RankingBlock` |
| **EmptyState** | R, F, H, D, N (5) | Sim (`ui/EmptyState`) |
| **StatTile** | F, P, H, R (4) | Não |

---

## Tier 1 — Primitivos do DS

| Componente | Superfícies | Existe? | O que falta |
| --- | --- | --- | --- |
| **Button** | todas | Sim (`primary`, `secondary`, `ghost`; `fullWidth`; loading) | Nada para as superfícies. Talvez tamanho compacto para ações dentro de card (Confirmar / Contestar) |
| **IconButton** | N, D, P, S | Não | Botão só com ícone e `aria-label` obrigatório: sino, busca, fechar folha, compartilhar, favoritar competição |
| **Icon** | todas | Sim | — |
| **TextLink** | todas | Sim | — |
| **FormInput** | S, D | Sim (`text`, `email`, `password`, `tel`, `search` com lupa, `datetime-local`) | Variante numérica (`inputmode="numeric"`) se a entrada de placar usar campo. Limpar e carregando da busca ficam no SearchField |
| **SearchField** | D, N | Não | Campo com ícone de lupa, limpar e estado de carregando. Pode ser variante do FormInput |
| **Alert** | S, D | Sim (`attention`, `success`, `information`) | — |
| **Toast** | S | Sim | — |
| **Avatar / AvatarStack** | todas | Sim, em `feed/` (tamanhos 32, 40, 48) | Mover para `ui/` (é Tier 1). Fallback com iniciais. Tamanhos maiores para cabeçalho de perfil (64 ou 96) |
| **Badge / Tag** | R, F, P, H, S, D | Parcial (estilos locais) | Primitivo com tons (`success`, `attention`, `accent`, `neutral`) para VITÓRIA/DERROTA/W.O., marco (Líder, Finals), categoria (B, C), status de competição (Inscrições abertas, Adiado), "Aguardando confirmação" |
| **CountBadge** | N, F | Não | Ponto ou número sobre ícone (aba, sino). Nome acessível com a contagem |
| **DeltaIndicator** | R, F, P, H | Parcial (`.delta` no `RankingBlock`) | Seta + número + cor, com "manteve" (–). Nunca só cor (WCAG 1.4.1) |
| **Chip** | R, P, S, D | Não | Três usos: filtro liga/desliga (`aria-pressed`), filtro ativo removível (×), seleção única em grupo (radio). Decidir se é um componente com variantes ou três |
| **SegmentedControl** | R, P, H, D | Não | 2 a 4 opções. Semântica de radio group ou de Tabs, conforme troque conteúdo ou filtro |
| **Tabs** (na página) | R, P | Não | Padrão APG Tabs, setas, `aria-selected`. Não confundir com a TabBar de navegação |
| **Stepper** | S | Não | Padrão APG Spinbutton. Só se o registro de placar seguir o caminho B |
| **ProgressBar** | R, P | Não | Trilha até a linha das Finals ou até a promoção de categoria. `role="progressbar"` com valor textual |
| **Skeleton** | R, F, P, D | Sim (`ui/Skeleton`: `text`, `circle`, `rect`; pulso com os tokens `--color-loading-*`) | Nada para as superfícies. Cada tela monta a silhueta do próprio conteúdo |
| **Spinner** | S, todas | Sim (`ui/Spinner`: `xs`, `sm`, `md`, `lg`; usado pelo Button em loading) | — |
| **Divider** | R, P, D | Não | Separador simples. Base para o ZoneDivider (Tier 3) |
| **BottomSheet / Dialog** | D, S | Não | Padrão APG Dialog (Modal): foco preso, `Esc`, foco volta. Base da folha de filtros e da contestação |
| **TabBar** | N | Não | Navegação principal: `<nav>` com links e `aria-current="page"`, CountBadge, safe area do iOS. Uma instância, mas é casca do app inteiro |
| **AppHeader** | N, todas | Não | Título, voltar, ações (IconButton). `AuthFormHeader` resolve só o caso de auth |
| **FAB** | N, F | Não | Só se a navegação seguir o caminho C |
| **ListItem** ⭐ | A, M, F, R, N | Sim (`ui/ListItem`, com o `List`; navegável, acionável ou estático) | Nada para as superfícies. Slot à esquerda (avatar ou ícone), título, texto de apoio, slot à direita (Badge, valor, chevron ou ação). Base do item da agenda, das pendências do feed, do RankingRow e das configurações |
| **Checkbox** ⭐ | M, P | Sim (`ui/Checkbox`) | Caixa desmarcada por padrão com o texto da finalidade ao lado. Primeiro uso: consentimento do telefone para o WhatsApp (`SCHEDULING.md` M21, LGPD) |

## Tier 2 — Compostos com estados ocultos

| Componente | Superfícies | Existe? | Estados que justificam o tier |
| --- | --- | --- | --- |
| **EmptyState** | R, F, H, D, N | Sim (`ui/EmptyState`: ícone opcional, título, apoio e uma ação) | Sem amigos, sem ranking, sem confronto, sem resultado de filtro. A variante "e conteúdo sugerido abaixo" é composição da tela: o conteúdo vem depois do `EmptyState` |
| **ScoreInput** | S | Não | Set completo, incompleto, inválido (7 × 7), tiebreak, super tiebreak, W.O., desistência. É o componente de maior risco técnico das 7 superfícies |
| **PendingResultCard** | S, F | Não | Aguardando você, aguardando adversário, confirmado, contestado, confirmado automaticamente por prazo |
| **StatusTimeline** | S, M | Sim (`ui/StatusTimeline`: quem, o quê e quando, em ordem cronológica; marcador neutro) | Um evento só, histórico longo, evento do sistema (sem autor), ato de admin com o papel. Usos: histórico da marcação (`SCHEDULING.md` M16, M17) e do resultado (lançado, contestado, arbitrado, corrigido) |
| **FilterSheet** | D, R | Não | Filtros ativos, contagem de resultados, zero resultados, limpar por seção. Compõe BottomSheet + Chip |
| **SidePicker** (jogadores e duplas) | S, H | Não | Buscar jogador, jogador sem conta, trocar de lado, dupla incompleta |
| **EvolutionChart** | P, R | Não | Poucos pontos (1 ou 2 partidas), período sem dados, faixa de referência ligada ou não. Alternativa textual obrigatória |
| **CelebrationScreen** | R, F | Não | Subiu, marco (Líder, Top 10, Finals), promoção de categoria. Nenhuma referência tem estado de queda |
| **ScheduleOptionPicker** ⭐ | M | Não | As 2 ou 3 opções de horário de uma proposta como cartões de escolha única, mais "Nenhum serve" (`SCHEDULING.md` M5, M9, M11). Estados: aguardando você, aguardando o outro lado (só leitura), opção que já passou (M12), proposta expirada |

## Tier 3 — Blocos reutilizáveis de feature

| Componente | Superfícies | Existe? | O que falta |
| --- | --- | --- | --- |
| **CardShell / CardHeader / CardFooter** | F | Sim (branch do feed) | CardHeader com duas pessoas em duplas (hurdle registrado no `CLAUDE.md`) |
| **ScoreBlock** | F, H, P, S | Sim (1, 2 e 3 sets; vencedor e perdedor por set) | Variante **compacta** para listas (confrontos no H2H, partidas recentes no perfil) e para pré-visualização no registro |
| **RankingBlock** | F, R | Sim (subiu, desceu, marco) | Pode virar o hero do topo da tela de ranking (caminho B do ranking) |
| **RankingRow** | R | Não | Posição, avatar(es), nome(s), pontos, DeltaIndicator, destaque "você". Variante de dupla |
| **ZoneDivider** | R | Não | Linha de corte com texto ("Classificam para as Finals") |
| **MetaInfo** | F, D | Sim (data, local, nota) | Prazo de inscrição |
| **CompetitionBlock** | F, D | Sim | Status (inscrições abertas ou encerradas, adiado), prazo, categorias. Pode ser o item da lista de descoberta |
| **MatchVsBlock / CheerBar / H2HButton** | F, H | Sim (H2HButton sem `onClick`, stub registrado no `CLAUDE.md`) | Ligar o H2HButton à página de H2H |
| **ProfileMiniCard** | F | Sim (stub sem `onClick`) | — |
| **ProfileHeader** | P | Não | Avatar, nome, categoria (Badge), posição clicável, RecordLine, Seguir |
| **RecordLine** (cartel) | P, H | Não | "V 24 · D 7 · W.O. 1" em uma linha |
| **StatTile / StatRow** | P, F, H, R | Não | Valor em display + rótulo; linha de 3 ou 4 tiles; variante com DeltaIndicator (resumo semanal) |
| **FormGuide** (forma recente) | H, P | Não | Últimos 5 como V/D com letra e cor |
| **ComparisonBar** | H | Não | Barra espelhada com número nas pontas |
| **H2HSummary** | H | Não | "3 × 1" com barra proporcional e total |
| **AchievementCallout** | F, P | Não | Caixa de conquista inline dentro de um card (padrão Strava). Base pode ser um Callout genérico |
| **WeeklySnapshot** | F, P | Não | Módulo de resumo do período (jogos, vitórias, pontos com variação). Compõe StatTile |

## Tier 4 — Composições finais

Geralmente sem story (`CLAUDE.md`); quando valer, uma story-galeria.

| Composição | Superfícies | Existe? | Observação |
| --- | --- | --- | --- |
| Cards do feed (ResultCard, MatchCard, EnrollmentCard, FriendshipCard, RankingCard, ActivityCard) | F | Sim (branch do feed) | Candidatos à story-galeria única |
| Tela de ranking | R | Não | Depende do caminho escolhido (A, B ou C) |
| Página de perfil | P | Não | |
| Página de H2H | H | Não | Pode não existir se o caminho C (pré-jogo contextual) for escolhido |
| Fluxo de registro de placar | S | Não | |
| Lista e detalhe de competição | D | Não | |
| Menu "More" ou configurações | N | Não | Pode não existir (caminho "sem More") |

---

## Observações para as specs

- **Avatar está no lugar errado.** É Tier 1 e mora em `src/components/feed/`. Vale decidir, ao mergear a branch do feed, se ele sobe para `ui/` (fora do escopo desta issue; é assunto da branch do feed).
- **Badge é o primitivo mais pedido e já existe duas vezes, escrito à mão.** `.label` do `ResultCard` e `.badge` do `RankingBlock` resolvem variações do mesmo problema, e as superfícies novas pedem pelo menos mais quatro usos (categoria, status de competição, pendência, forma recente).
- **Tabs × SegmentedControl × TabBar × Chip** são quatro coisas diferentes com aparência parecida. Nomear e separar antes de implementar evita o erro comum de usar `role="tablist"` numa barra de navegação.
- **O ScoreBlock é o bloco mais reaproveitável.** Aparece no feed, no H2H, no perfil e como pré-visualização do registro. Uma variante compacta atende três superfícies.

---

## Uso das ferramentas nesta pesquisa

| Ferramenta | Chamadas | Limite | Observação |
| --- | --- | --- | --- |
| **Mobbin** (`search_screens`, `search_flows`) | **25** | 70 | Ranking 5 · Feed 4 · Perfil 4 · H2H 2 · Placar 4 · Descoberta 4 · Navegação 2. Cerca de 230 telas vistas |
| **Firecrawl** (`firecrawl_scrape`) | **5** | 30 | Playtomic Help (2), letzplay.me (1, redirecionou para a home), Material 3 e Apple HIG (2). Modo Alexandria não usado |
| WebSearch | 2 | — | UTR e Playtomic |
| WebFetch | 2 | — | Playtomic Manager e Material 3: bloqueados pelo proxy da sessão, refeitos com Firecrawl |

O orçamento do Mobbin ficou abaixo do limite porque as buscas por apps de raquete (padel, tênis, placar) não retornaram telas do domínio: o Mobbin não indexa Playtomic, UTR nem apps brasileiros de BT. Mais buscas repetiriam os mesmos apps de liga e fitness.
