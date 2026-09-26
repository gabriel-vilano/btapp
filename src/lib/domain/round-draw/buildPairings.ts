import { pairKey, timesMet, type PairCounts, type Pairing } from './pairHistory';

// Uma tentativa gulosa de montar os confrontos da rodada. A ordem dos ids
// (embaralhada por quem chama) é o desempate aleatório: com critérios iguais,
// ganha quem vem primeiro.
//
// A cada passo, a unidade com mais jogos por marcar escolhe o adversário que
// ela menos enfrentou na temporada. Começar por quem tem mais jogos pendentes
// é a ideia do algoritmo de Havel–Hakimi: evita que sobre, no fim, uma
// unidade com jogos a marcar e ninguém livre para enfrentar.

export interface PairingAttempt {
  pairings: Pairing[];
  unfilled: number; // jogos que ficaram sem adversário
}

interface AttemptState {
  remaining: Map<string, number>;
  drawnKeys: Set<string>; // confrontos já sorteados nesta rodada
  pairings: Pairing[];
  unfilled: number;
}

function initialState(order: readonly string[], matchesPerUnit: number): AttemptState {
  const remaining = new Map(order.map((id) => [id, matchesPerUnit]));
  return { remaining, drawnKeys: new Set(), pairings: [], unfilled: 0 };
}

function remainingOf(state: AttemptState, id: string): number {
  return state.remaining.get(id) ?? 0;
}

function pickNextUnit(order: readonly string[], state: AttemptState): string | undefined {
  let best: string | undefined;
  for (const id of order) {
    const left = remainingOf(state, id);
    if (left > 0 && (best === undefined || left > remainingOf(state, best))) best = id;
  }
  return best;
}

// Mesmo confronto duas vezes na mesma rodada, nunca.
function isEligible(state: AttemptState, unit: string, candidate: string): boolean {
  if (candidate === unit || remainingOf(state, candidate) === 0) return false;
  return !state.drawnKeys.has(pairKey(unit, candidate));
}

/** Menor é melhor: primeiro o menos enfrentado, depois quem tem mais jogos por marcar. */
function opponentRank(state: AttemptState, history: PairCounts, unit: string, candidate: string): number[] {
  return [timesMet(history, unit, candidate), -remainingOf(state, candidate)];
}

function isLower(rank: number[], other: number[]): boolean {
  const index = rank.findIndex((value, i) => value !== other[i]);
  return index !== -1 && rank[index] < other[index];
}

function pickOpponent(
  unit: string,
  order: readonly string[],
  state: AttemptState,
  history: PairCounts,
): string | undefined {
  let best: string | undefined;
  let bestRank: number[] = [];
  for (const candidate of order) {
    if (!isEligible(state, unit, candidate)) continue;
    const rank = opponentRank(state, history, unit, candidate);
    if (best === undefined || isLower(rank, bestRank)) [best, bestRank] = [candidate, rank];
  }
  return best;
}

function addPairing(state: AttemptState, unit: string, opponent: string): void {
  state.pairings.push([unit, opponent]);
  state.drawnKeys.add(pairKey(unit, opponent));
  state.remaining.set(unit, remainingOf(state, unit) - 1);
  state.remaining.set(opponent, remainingOf(state, opponent) - 1);
}

// A unidade escolhida marca todos os seus jogos antes de passar a vez: é o
// que dá ao Havel–Hakimi a garantia de fechar a rodada quando é possível.
function fillUnit(state: AttemptState, unit: string, order: readonly string[], history: PairCounts): void {
  while (remainingOf(state, unit) > 0) {
    const opponent = pickOpponent(unit, order, state, history);
    if (opponent === undefined) break;
    addPairing(state, unit, opponent);
  }
  state.unfilled += remainingOf(state, unit);
  state.remaining.set(unit, 0);
}

/** Monta os confrontos de uma rodada numa passada gulosa, na ordem de desempate dada. */
export function buildPairings(
  order: readonly string[],
  matchesPerUnit: number,
  history: PairCounts,
): PairingAttempt {
  const state = initialState(order, matchesPerUnit);
  for (let unit = pickNextUnit(order, state); unit !== undefined; unit = pickNextUnit(order, state)) {
    fillUnit(state, unit, order, history);
  }
  return { pairings: state.pairings, unfilled: state.unfilled };
}
