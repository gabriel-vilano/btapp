import type {
  CompetitionResult,
  MatchFormat,
  MatchSet,
  MatchSideKey,
  ScoringRule,
  SidePoints,
} from '@/src/types/domain';
import { completeRetiredScore, validateScore } from './matchScore';
import { setWinner } from './setRules';

// Pontuação de uma partida confirmada de ranking (docs/DOMAIN.md, R8–R11 e
// R36). Torneio e amistoso não pontuam: quem chama decide se a partida conta.

type GameCount = Record<MatchSideKey, number>;

function otherSide(side: MatchSideKey): MatchSideKey {
  return side === 'a' ? 'b' : 'a';
}

function bySide(winner: MatchSideKey, winnerValue: number, loserValue: number): SidePoints {
  return winner === 'a' ? { a: winnerValue, b: loserValue } : { a: loserValue, b: winnerValue };
}

/** Games de cada lado. O super tiebreak vale 1 game para o vencedor dele (R9). */
export function countGames(sets: MatchSet[]): GameCount {
  const count: GameCount = { a: 0, b: 0 };
  for (const set of sets) {
    if (set.super_tiebreak) {
      count[setWinner(set)] += 1;
      continue;
    }
    count.a += set.games_a;
    count.b += set.games_b;
  }
  return count;
}

function sidePoints(base: number, won: number, lost: number, rule: ScoringRule): number {
  return base + won * rule.per_game_won + lost * rule.per_game_lost;
}

/** Base de vitória e derrota mais o saldo de games do placar (R9, R11). */
function pointsFromScore(
  sets: MatchSet[],
  winner: MatchSideKey,
  bases: { winner: number; loser: number },
  rule: ScoringRule,
): SidePoints {
  const games = countGames(sets);
  const loser = otherSide(winner);
  const winnerPoints = sidePoints(bases.winner, games[winner], games[loser], rule);
  const loserPoints = sidePoints(bases.loser, games[loser], games[winner], rule);
  return bySide(winner, winnerPoints, loserPoints);
}

/**
 * Pontos de cada lado numa partida confirmada de ranking, pela regra do
 * ranking. Lança erro se o placar for inválido para o formato (R29).
 * Ex.: 6/4 6/3 com a regra padrão → `{ a: 110, b: 40 }`.
 */
export function matchPoints(result: CompetitionResult, format: MatchFormat, rule: ScoringRule): SidePoints {
  if (result.type === 'double_wo') return { a: 0, b: 0 }; // R36: sem campo na regra
  if (result.type === 'wo') return bySide(result.winner, rule.wo_winner, rule.wo_absent);
  if (result.type === 'retired') {
    const bases = { winner: rule.retirement_winner, loser: rule.retirement_retiree };
    return pointsFromScore(completeRetiredScore(result, format), result.winner, bases, rule);
  }
  const check = validateScore(result, format);
  if (!check.valid) throw new Error(`Placar inválido: ${check.message}`);
  return pointsFromScore(result.sets, result.winner, { winner: rule.win, loser: rule.loss }, rule);
}
