// Dados da aba Competições (docs/NAVIGATION.md §6, N29 e N30), já no formato
// da tela: nomes resolvidos e rota de destino. A derivação a partir das
// tabelas do domínio vem com a integração; até lá, os mocks tipados em
// `src/mocks/competitionsTab.ts` preenchem este contrato.

/** Variação de posição contra a última foto de rodada (RANKING.md, RK12). */
export type StandingDelta = { direction: 'up' | 'down'; value: number } | { direction: 'none' };

interface MyCompetitionBase {
  enrollment_id: string;
  competition_name: string;
  category_name: string; // 'Masculino B', 'Mista C 40+'
  partner_name: string | null; // em simples, null
  href: string;
}

/** Inscrição ativa num ranking: vira um StandingSummaryItem. */
export interface MyRankingItem extends MyCompetitionBase {
  kind: 'ranking';
  enrolled_at: string; // ISO 8601; define a ordem (N29)
  position: number;
  delta: StandingDelta | null; // 1ª rodada: sem foto para comparar
}

/** Próximo confronto já definido do torneio. */
export interface TournamentNextMatch {
  starts_at: string; // ISO 8601
  court: string | null; // 'Quadra 3'; nem todo confronto tem quadra definida
}

/** Inscrição ativa num torneio: vira um TournamentSummaryItem. */
export interface MyTournamentItem extends MyCompetitionBase {
  kind: 'tournament';
  starts_on: string; // ISO 8601
  ends_on: string; // ISO 8601; igual a starts_on no torneio de 1 dia
  next_match: TournamentNextMatch | null;
}

export type MyCompetitionItem = MyRankingItem | MyTournamentItem;

/** Última temporada de ranking do jogador, para o vazio 'com temporada passada' (9.2). */
export interface PastSeasonItem {
  enrollment_id: string;
  competition_name: string;
  category_name: string;
  season_name: string; // '1º semestre 2026'
  partner_name: string | null;
  final_position: number;
  href: string; // a classificação daquela temporada (RK21)
}

/**
 * O que espera o admin (N30):
 * - `contested`: contestação em arbitragem;
 * - `not_played`: partida não realizada (R40);
 * - `tournament_no_result`: confronto de torneio cujo horário passou sem resultado (R38).
 */
export type AdminPendingKind = 'contested' | 'not_played' | 'tournament_no_result';

export interface AdminPendingItem {
  id: string;
  kind: AdminPendingKind;
  competition_name: string;
  category_name: string;
  sides: string; // 'Lucas e Rafael x Pedro e Thiago'
  since: string; // ISO 8601; desde quando a decisão espera o admin
  href: string; // a decisão na área 'Administrar' (N31)
}

/** Tudo o que a aba precisa para um jogador. */
export interface CompetitionsTabData {
  /** Admin de alguma competição (R15). Quem não é nunca vê o bloco de pendências. */
  is_admin: boolean;
  admin_pendings: AdminPendingItem[];
  /** Só inscrições ativas em temporada ou torneio que não terminou (N29). */
  competitions: MyCompetitionItem[];
  last_season: PastSeasonItem | null;
}
