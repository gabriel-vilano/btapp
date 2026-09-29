import type { Enrollment } from '@/src/types/domain';
import { isPlayedResult } from './match-count';
import {
  countedEnrollments,
  countedMatches,
  enrollmentStats,
  sideOf,
  winnerOf,
  type ConfirmedRankingMatch,
  type EnrollmentStats,
  type StandingsScope,
} from './standingsStats';

// Classificação de uma categoria numa temporada (docs/DOMAIN.md, R8 e R37).
// Não é guardada: sai das partidas confirmadas cada vez que é pedida, e por
// isso a tabela atualiza ao vivo (R46).

/** Uma linha da classificação. */
export interface StandingRow {
  enrollment_id: string;
  enrollment_status: Enrollment['status']; // a encerrada fica, sem direito à final (R45)
  position: number; // começa em 1, sem posição repetida
  points: number;
  wins: number;
  games_balance: number;
  // Empate em todos os critérios: a ordem entre essas linhas é provisória
  // até a decisão do admin, o último critério da R37
  awaiting_admin: boolean;
}

type Compare = (x: EnrollmentStats, y: EnrollmentStats) => number;

const byPoints: Compare = (x, y) => y.points - x.points;
const byWinsThenGames: Compare = (x, y) => y.wins - x.wins || y.games_balance - x.games_balance;
// Só para a ordem ser estável enquanto o admin não decide: não é critério
const byEnrollmentOrder: Compare = (x, y) =>
  Date.parse(x.enrollment.enrolled_at) - Date.parse(y.enrollment.enrolled_at) ||
  x.enrollment.id.localeCompare(y.enrollment.id);

/** Quebra a lista ordenada em grupos consecutivos em que `compare` dá 0. */
function groupTies(sorted: EnrollmentStats[], compare: Compare): EnrollmentStats[][] {
  const groups: EnrollmentStats[][] = [];
  for (const stats of sorted) {
    const last = groups.at(-1);
    if (last !== undefined && compare(last[0], stats) === 0) last.push(stats);
    else groups.push([stats]);
  }
  return groups;
}

function headToHeadWins(matches: ConfirmedRankingMatch[], x: string, y: string): number {
  return matches.filter((match) => {
    // W.O. não é confronto (R19): quem não jogou não "já se enfrentou"
    if (!isPlayedResult(match.result)) return false;
    const side = sideOf(match, x);
    return side !== null && sideOf(match, y) !== null && winnerOf(match) === side;
  }).length;
}

/**
 * Confronto direto (R37): vale só para exatamente duas unidades empatadas em
 * pontos que já se enfrentaram. Devolve a dupla ordenada, ou null quando não
 * decide (não se enfrentaram, ou cada uma venceu o mesmo número de vezes).
 */
function headToHead(pair: EnrollmentStats[], matches: ConfirmedRankingMatch[]): EnrollmentStats[] | null {
  if (pair.length !== 2) return null;
  const [x, y] = pair;
  const xWins = headToHeadWins(matches, x.enrollment.id, y.enrollment.id);
  const yWins = headToHeadWins(matches, y.enrollment.id, x.enrollment.id);
  if (xWins === yWins) return null;
  return xWins > yWins ? [x, y] : [y, x];
}

type Ranked = { stats: EnrollmentStats; awaitingAdmin: boolean };

/** Vitórias → saldo de games; o que ainda empata espera o admin (R37). */
function rankByWinsAndGames(group: EnrollmentStats[]): Ranked[] {
  const sorted = [...group].sort((x, y) => byWinsThenGames(x, y) || byEnrollmentOrder(x, y));
  return groupTies(sorted, byWinsThenGames).flatMap((tied) =>
    tied.map((stats) => ({ stats, awaitingAdmin: tied.length > 1 })),
  );
}

/** Desempata um grupo empatado em pontos: confronto direto, vitórias, saldo, admin. */
function breakTie(group: EnrollmentStats[], matches: ConfirmedRankingMatch[]): Ranked[] {
  if (group.length === 1) return [{ stats: group[0], awaitingAdmin: false }];
  const byHeadToHead = headToHead(group, matches);
  if (byHeadToHead !== null) return byHeadToHead.map((stats) => ({ stats, awaitingAdmin: false }));
  return rankByWinsAndGames(group);
}

function toRow({ stats, awaitingAdmin }: Ranked, index: number): StandingRow {
  return {
    enrollment_id: stats.enrollment.id,
    enrollment_status: stats.enrollment.status,
    position: index + 1,
    points: stats.points,
    wins: stats.wins,
    games_balance: stats.games_balance,
    awaiting_admin: awaitingAdmin,
  };
}

/**
 * Classificação de uma categoria numa temporada: soma dos pontos das partidas
 * confirmadas de cada inscrição (R8), com o desempate da R37. Com `asOf`,
 * considera só o que estava confirmado naquele momento (fechamento da rodada,
 * data de corte da final).
 * Ex.: `computeStandings({ season_id, category_id, ...mockDomain })`.
 */
export function computeStandings(scope: StandingsScope, asOf?: string): StandingRow[] {
  const matches = countedMatches(scope, asOf);
  const stats = enrollmentStats(countedEnrollments(scope, asOf), matches);
  const sorted = [...stats].sort((x, y) => byPoints(x, y) || byEnrollmentOrder(x, y));
  return groupTies(sorted, byPoints)
    .flatMap((group) => breakTie(group, matches))
    .map(toRow);
}
