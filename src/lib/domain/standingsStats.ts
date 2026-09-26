import type {
  Enrollment,
  Match,
  MatchConfirmation,
  MatchSideKey,
  RankingMatch,
  Round,
} from '@/src/types/domain';
import { countGames } from './matchPoints';
import { completeRetiredScore } from './matchScore';

// O que conta para a classificação de uma categoria numa temporada (R8, R16)
// e os números que o desempate usa (R37): pontos, vitórias e saldo de games.

/** Partida de ranking confirmada: a única que pontua (R16). */
export type ConfirmedRankingMatch = Extract<RankingMatch, { status: 'confirmed' }>;

/** Uma categoria numa temporada, com as tabelas de onde a classificação sai. */
export interface StandingsScope {
  season_id: string;
  category_id: string;
  rounds: Round[]; // as rodadas de outras temporadas são ignoradas
  enrollments: Enrollment[];
  matches: Match[]; // torneio, amistoso e outras categorias são ignorados
}

/** Números de uma inscrição que a classificação ordena. */
export interface EnrollmentStats {
  enrollment: Enrollment;
  points: number;
  wins: number;
  games_balance: number; // games vencidos − games perdidos
}

/** Momento em que a partida foi confirmada, venha a confirmação de onde vier (R16). */
export function confirmedAt(confirmation: MatchConfirmation): string {
  if (confirmation.via === 'opponent') return confirmation.responded_at;
  if (confirmation.via === 'deadline') return confirmation.confirmed_at;
  return confirmation.acted_at;
}

function isBefore(iso: string, asOf: string | undefined): boolean {
  return asOf === undefined || Date.parse(iso) <= Date.parse(asOf);
}

/**
 * Partidas confirmadas da categoria na temporada, até `asOf` quando informado.
 * Uma partida confirmada depois de `asOf` fica de fora, mesmo que seja de uma
 * rodada anterior: é o que faz a decisão tardia do admin entrar na rodada
 * seguinte (R46).
 */
export function countedMatches(scope: StandingsScope, asOf?: string): ConfirmedRankingMatch[] {
  const roundIds = new Set(scope.rounds.filter((r) => r.season_id === scope.season_id).map((r) => r.id));
  return scope.matches.filter(
    (match): match is ConfirmedRankingMatch =>
      match.kind === 'ranking' &&
      match.status === 'confirmed' &&
      match.category_id === scope.category_id &&
      roundIds.has(match.round_id) &&
      isBefore(confirmedAt(match.confirmation), asOf),
  );
}

/**
 * Inscrições da categoria na temporada, até `asOf`. A encerrada por troca de
 * parceiro continua na tabela, com os pontos congelados (R45).
 */
export function countedEnrollments(scope: StandingsScope, asOf?: string): Enrollment[] {
  return scope.enrollments.filter(
    (enrollment) =>
      enrollment.category_id === scope.category_id &&
      enrollment.season_id === scope.season_id &&
      isBefore(enrollment.enrolled_at, asOf),
  );
}

/** Lado da inscrição na partida, ou null se ela não jogou. */
export function sideOf(match: ConfirmedRankingMatch, enrollmentId: string): MatchSideKey | null {
  if (match.side_a_enrollment_id === enrollmentId) return 'a';
  if (match.side_b_enrollment_id === enrollmentId) return 'b';
  return null;
}

/** Vencedor da partida. O W.O. duplo não tem (R36). */
export function winnerOf(match: ConfirmedRankingMatch): MatchSideKey | null {
  return match.result.type === 'double_wo' ? null : match.result.winner;
}

/**
 * Games de cada lado. Na desistência vale o placar completado pelo formato,
 * o mesmo que pontua (R11); W.O. e W.O. duplo não têm placar e valem 0.
 */
function gamesOf(match: ConfirmedRankingMatch): Record<MatchSideKey, number> {
  const { result } = match;
  if (result.type === 'normal') return countGames(result.sets);
  if (result.type === 'retired') return countGames(completeRetiredScore(result, match.format));
  return { a: 0, b: 0 };
}

function addMatch(stats: EnrollmentStats, match: ConfirmedRankingMatch, side: MatchSideKey): void {
  const other: MatchSideKey = side === 'a' ? 'b' : 'a';
  const games = gamesOf(match);
  // Os pontos já foram calculados pelo `matchPoints` ao confirmar a partida, e
  // a correção do admin os recalcula (R41): somar o guardado evita divergir dele
  stats.points += match.points[side];
  stats.games_balance += games[side] - games[other];
  if (winnerOf(match) === side) stats.wins += 1;
}

/** Soma pontos, vitórias e saldo de games de cada inscrição (R8, R37). */
export function enrollmentStats(enrollments: Enrollment[], matches: ConfirmedRankingMatch[]): EnrollmentStats[] {
  return enrollments.map((enrollment) => {
    const stats: EnrollmentStats = { enrollment, points: 0, wins: 0, games_balance: 0 };
    for (const match of matches) {
      const side = sideOf(match, enrollment.id);
      if (side !== null) addMatch(stats, match, side);
    }
    return stats;
  });
}
