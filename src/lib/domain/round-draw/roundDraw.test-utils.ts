import { countPairs, pairKey, type PairCounts, type Pairing } from './pairHistory';

// Apoio aos testes do sorteio: checagens de estrutura e um solucionador por
// força bruta que acha a menor repetição possível, para comparar com o sorteio.

export function unitIds(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `u${i + 1}`);
}

export function gamesPerUnit(pairings: readonly Pairing[]): Map<string, number> {
  const games = new Map<string, number>();
  for (const unit of pairings.flat()) games.set(unit, (games.get(unit) ?? 0) + 1);
  return games;
}

/** Quantos confrontos da rodada já tinham acontecido na temporada. */
export function repeatedPairings(pairings: readonly Pairing[], history: PairCounts): number {
  return pairings.filter(([a, b]) => (history.get(pairKey(a, b)) ?? 0) > 0).length;
}

export function hasDuplicateInRound(pairings: readonly Pairing[]): boolean {
  return [...countPairs(pairings).values()].some((count) => count > 1);
}

export function mergeHistory(history: PairCounts, pairings: readonly Pairing[]): Map<string, number> {
  const merged = new Map(history);
  for (const [key, count] of countPairs(pairings)) merged.set(key, (merged.get(key) ?? 0) + count);
  return merged;
}

function allPairs(ids: readonly string[]): Pairing[] {
  return ids.flatMap((a, i) => ids.slice(i + 1).map((b): Pairing => [a, b]));
}

interface SearchState {
  pairs: Pairing[];
  history: PairCounts;
  perUnit: number;
  degree: Map<string, number>;
  best: number;
}

function fits(state: SearchState, [a, b]: Pairing): boolean {
  return (state.degree.get(a) ?? 0) < state.perUnit && (state.degree.get(b) ?? 0) < state.perUnit;
}

function bump(state: SearchState, [a, b]: Pairing, delta: number): void {
  state.degree.set(a, (state.degree.get(a) ?? 0) + delta);
  state.degree.set(b, (state.degree.get(b) ?? 0) + delta);
}

function search(state: SearchState, from: number, left: number, cost: number): void {
  if (left === 0) state.best = Math.min(state.best, cost);
  if (left === 0 || state.pairs.length - from < left || cost >= state.best) return;
  const pair = state.pairs[from];
  if (fits(state, pair)) {
    bump(state, pair, 1);
    search(state, from + 1, left - 1, cost + (state.history.get(pairKey(...pair)) ?? 0));
    bump(state, pair, -1);
  }
  search(state, from + 1, left, cost);
}

/** Menor repetição possível com todo mundo jogando o máximo de jogos. Só para categorias pequenas. */
export function optimalRepeatCost(ids: readonly string[], matchesPerUnit: number, history: PairCounts): number {
  const perUnit = Math.min(matchesPerUnit, ids.length - 1);
  const state: SearchState = { pairs: allPairs(ids), history, perUnit, degree: new Map(), best: Infinity };
  search(state, 0, Math.floor((ids.length * perUnit) / 2), 0);
  return state.best;
}
