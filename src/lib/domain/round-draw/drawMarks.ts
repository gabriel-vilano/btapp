import type { RankingMatch } from '@/src/types/domain';
import { countPairs, timesMet, type Pairing } from './pairHistory';

// Marcas do resultado do sorteio (ROUND_DRAW.md SR10, SR11): o confronto que
// repete um da temporada ("Já se enfrentaram nesta temporada") e a dupla com
// jogo a menos ("2 jogos nesta rodada"). As duas só se sabem depois do sorteio
// e aparecem também para os jogadores.

export interface ShortUnit {
  enrollment_id: string;
  games: number;
}

export interface CategoryDrawMarks {
  category_id: string;
  repeated_match_ids: string[];
  short_units: ShortUnit[];
}

function sidesOf(match: RankingMatch): Pairing {
  return [match.side_a_enrollment_id, match.side_b_enrollment_id];
}

// Confrontos da categoria sorteados antes desta partida, fora desta rodada. A
// cancelada não conta, como no sorteio (R30). Comparar pela criação deixa o
// resultado reaberto depois ("Ver confrontos") igual ao da hora do sorteio.
function historyBefore(drawn: RankingMatch, seasonMatches: readonly RankingMatch[]): Pairing[] {
  return seasonMatches
    .filter((m) => m.category_id === drawn.category_id && m.round_id !== drawn.round_id)
    .filter((m) => m.status !== 'cancelled' && Date.parse(m.created_at) < Date.parse(drawn.created_at))
    .map(sidesOf);
}

function isRepeat(drawn: RankingMatch, seasonMatches: readonly RankingMatch[]): boolean {
  return timesMet(countPairs(historyBefore(drawn, seasonMatches)), ...sidesOf(drawn)) > 0;
}

// Com total ímpar de vagas, uma dupla fica com um jogo a menos que as outras.
function shortUnits(matches: readonly RankingMatch[]): ShortUnit[] {
  const games = new Map<string, number>();
  for (const id of matches.flatMap(sidesOf)) games.set(id, (games.get(id) ?? 0) + 1);
  const most = Math.max(...games.values());
  return [...games].filter(([, count]) => count < most).map(([enrollment_id, count]) => ({ enrollment_id, games: count }));
}

function marksOf(categoryId: string, matches: RankingMatch[], seasonMatches: readonly RankingMatch[]): CategoryDrawMarks {
  return {
    category_id: categoryId,
    repeated_match_ids: matches.filter((m) => isRepeat(m, seasonMatches)).map((m) => m.id),
    short_units: shortUnits(matches),
  };
}

/**
 * Marcas de cada categoria sorteada na rodada, na ordem em que as categorias
 * aparecem nas partidas.
 *
 * @example
 * const marks = roundDrawMarks(round.id, seasonMatches); // seasonMatches já com as partidas da rodada
 */
export function roundDrawMarks(roundId: string, seasonMatches: readonly RankingMatch[]): CategoryDrawMarks[] {
  const byCategory = new Map<string, RankingMatch[]>();
  for (const match of seasonMatches.filter((m) => m.round_id === roundId)) {
    byCategory.set(match.category_id, [...(byCategory.get(match.category_id) ?? []), match]);
  }
  return [...byCategory].map(([categoryId, matches]) => marksOf(categoryId, matches, seasonMatches));
}
