import type { MatchSet, MatchSideKey } from '@/src/types/domain';

// Regras de um set isolado (docs/DOMAIN.md, R29). Quem monta a partida a
// partir dos sets é o `matchScore.ts`.

/** Set de games até `target` (6 ou 8) ou super tiebreak, contado em pontos. */
export type SetKind = { type: 'games'; target: 6 | 8 } | { type: 'super_tiebreak' };

// Super tiebreak a 10, com 2 de vantagem (padrão do Beach Tennis; ex.: 10/7, 12/10)
const SUPER_TIEBREAK_TARGET = 10;

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Set de games encerrado. Com alvo N: N/0 a N/(N−2); em (N−1)/(N−1) vai a
 * N+1; em N/N, tie-break a 7, anotado como (N+1)/N. Set de 6: 6/4, 7/5, 7/6.
 */
function isFinishedGamesSet(high: number, low: number, target: number): boolean {
  if (high === target) return low <= target - 2;
  if (high === target + 1) return low === target - 1 || low === target;
  return false;
}

function isFinishedSuperTiebreak(high: number, low: number): boolean {
  if (high < SUPER_TIEBREAK_TARGET || high - low < 2) return false;
  return high === SUPER_TIEBREAK_TARGET || high - low === 2;
}

/** Placar de um set que terminou pela regra do tipo dele. Ex.: 6/4 sim, 6/5 não. */
export function isFinishedSet(set: MatchSet, kind: SetKind): boolean {
  if (!isNonNegativeInteger(set.games_a) || !isNonNegativeInteger(set.games_b)) return false;
  const high = Math.max(set.games_a, set.games_b);
  const low = Math.min(set.games_a, set.games_b);
  if (kind.type === 'super_tiebreak') return isFinishedSuperTiebreak(high, low);
  return isFinishedGamesSet(high, low, kind.target);
}

/**
 * Placar parcial que um set em andamento pode ter: ainda não terminou e é
 * alcançável pela regra. Ex.: no set de 6, 5/6 e 6/6 sim; 7/4 não.
 */
export function isInProgressSet(set: MatchSet, kind: SetKind): boolean {
  if (!isNonNegativeInteger(set.games_a) || !isNonNegativeInteger(set.games_b)) return false;
  if (isFinishedSet(set, kind)) return false;
  const high = Math.max(set.games_a, set.games_b);
  const low = Math.min(set.games_a, set.games_b);
  if (kind.type === 'games') return high <= kind.target;
  return high < SUPER_TIEBREAK_TARGET || high - low <= 1;
}

/** Quem venceu um set encerrado. */
export function setWinner(set: MatchSet): MatchSideKey {
  return set.games_a > set.games_b ? 'a' : 'b';
}

function withSide(set: MatchSet, side: MatchSideKey, value: number): MatchSet {
  return side === 'a' ? { ...set, games_a: value } : { ...set, games_b: value };
}

function gamesOf(set: MatchSet, side: MatchSideKey): number {
  return side === 'a' ? set.games_a : set.games_b;
}

/**
 * Fecha um set em andamento dando todos os games seguintes a `winner` (R11).
 * Ex.: no set de 6, 5/2 para o lado B vira 5/7.
 */
export function completeSet(set: MatchSet, kind: SetKind, winner: MatchSideKey): MatchSet {
  let completed: MatchSet = { ...set, interrupted: false };
  while (!isFinishedSet(completed, kind)) {
    completed = withSide(completed, winner, gamesOf(completed, winner) + 1);
  }
  return completed;
}

/** Set inteiro para um lado, quando a desistência veio antes dele começar. Ex.: 6/0. */
export function wholeSetFor(kind: SetKind, winner: MatchSideKey): MatchSet {
  const empty: MatchSet = {
    games_a: 0,
    games_b: 0,
    super_tiebreak: kind.type === 'super_tiebreak',
    interrupted: false,
  };
  return completeSet(empty, kind, winner);
}
