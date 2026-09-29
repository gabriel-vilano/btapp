import type { RetiredScore, SetScore } from "@/src/types/feed";

/** Houve pelo menos um game jogado no jogo desistido (R11). */
export function hasPlayedGames(score: RetiredScore): boolean {
  return score.completed_sets.length > 0 || isStarted(score.interrupted_set);
}

/** O set teve algum game. 0 × 0 é a desistência antes do primeiro game do set. */
export function isStarted(set: SetScore): boolean {
  return set.a + set.b > 0;
}
