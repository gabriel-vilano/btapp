import type { MatchSet } from '@/src/types/domain';
import type { Score, SetScore } from '@/src/types/feed';
import type { RecentMatchResult } from '../profile';

// O placar do domínio (games por lado A e B) no formato do ScoreBlock, que
// grava do lado vencedor (`a` = vencedor), como o card de resultado.

function winnerFirst(set: MatchSet, winner: 'a' | 'b'): SetScore {
  return winner === 'a' ? { a: set.games_a, b: set.games_b } : { a: set.games_b, b: set.games_a };
}

/**
 * Converte o resultado para o `Score` do ScoreBlock.
 * Ex.: vitória do lado B por 4/6 → `{ type: 'normal', sets: [{ a: 6, b: 4 }] }`.
 */
export function toScore(result: RecentMatchResult): Score {
  if (result.type === 'wo') return { type: 'wo' };
  const sets = result.sets.map((set) => ({ set, score: winnerFirst(set, result.winner) }));
  if (result.type === 'normal') return { type: 'normal', sets: sets.map(({ score }) => score) };
  const interrupted = sets.find(({ set }) => set.interrupted);
  return {
    type: 'retired',
    completed_sets: sets.filter(({ set }) => !set.interrupted).map(({ score }) => score),
    // Desistência entre sets: o set seguinte não começou, fica 0 × 0
    interrupted_set: interrupted?.score ?? { a: 0, b: 0 },
  };
}
