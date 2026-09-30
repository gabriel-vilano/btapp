import type {
  CompetitionMatch,
  CompetitionResult,
  FriendlyMatch,
  MatchFormat,
  RankingMatch,
  SidePoints,
  TournamentMatch,
} from '@/src/types/domain';

// A partida muda de estado trocando só os campos do estado. Espalhar a partida
// inteira (`...match`) levaria junto campos do estado anterior (ex.: `contest`
// numa partida confirmada), que o tipo não enxerga mas o banco gravaria. Por
// isso cada transição parte da base, copiada campo a campo.

/**
 * Calcula os pontos de um resultado de ranking (R8–R11, R36). A transição recebe
 * a função pronta, com a regra do ranking já aplicada: a máquina de estados não
 * depende de como a pontuação é calculada.
 */
export type ScoreRankingResult = (result: CompetitionResult, format: MatchFormat) => SidePoints;

function competitionFields(match: CompetitionMatch) {
  return {
    id: match.id,
    competition_id: match.competition_id,
    category_id: match.category_id,
    side_a_enrollment_id: match.side_a_enrollment_id,
    side_b_enrollment_id: match.side_b_enrollment_id,
    format: match.format,
    scheduled_at: match.scheduled_at,
    venue: match.venue,
    created_at: match.created_at,
  };
}

export function rankingBase(match: RankingMatch): Omit<RankingMatch, 'status'> {
  return {
    ...competitionFields(match),
    kind: 'ranking',
    round_id: match.round_id,
    undone_reports: match.undone_reports,
  };
}

export function tournamentBase(match: TournamentMatch): Omit<TournamentMatch, 'status'> {
  return { ...competitionFields(match), kind: 'tournament', stage: match.stage };
}

export function friendlyBase(match: FriendlyMatch): Omit<FriendlyMatch, 'status'> {
  return {
    id: match.id,
    kind: 'friendly',
    side_a_unit_id: match.side_a_unit_id,
    side_b_unit_id: match.side_b_unit_id,
    format: match.format,
    played_at: match.played_at,
    venue: match.venue,
    created_at: match.created_at,
    report: match.report,
  };
}
