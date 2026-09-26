import { pairKey, repeatCost, type PairCounts, type Pairing } from './pairHistory';

// Busca local sobre os confrontos de uma tentativa (técnica "2-opt"): pega
// dois confrontos, A×B e C×D, e testa trocar os adversários (A×C e B×D, ou
// A×D e B×C). A troca mantém o número de jogos de cada unidade e só é aceita
// se diminui a repetição. Corrige escolhas ruins que o passo guloso fez cedo.

// Cada troca aceita reduz a repetição em pelo menos 1, então a busca termina
// sozinha; o limite só protege de um histórico enorme.
const MAX_PASSES = 50;

type PairingSwap = readonly [Pairing, Pairing];

function swapOptions([a, b]: Pairing, [c, d]: Pairing): PairingSwap[] {
  return [
    [
      [a, c],
      [b, d],
    ],
    [
      [a, d],
      [b, c],
    ],
  ];
}

function isValidSwap(swap: PairingSwap, drawnKeys: ReadonlySet<string>): boolean {
  return swap.every(([first, second]) => first !== second && !drawnKeys.has(pairKey(first, second)));
}

function applySwap(pairings: Pairing[], i: number, j: number, swap: PairingSwap, drawnKeys: Set<string>): void {
  drawnKeys.delete(pairKey(...pairings[i]));
  drawnKeys.delete(pairKey(...pairings[j]));
  [pairings[i], pairings[j]] = swap;
  drawnKeys.add(pairKey(...swap[0]));
  drawnKeys.add(pairKey(...swap[1]));
}

function trySwap(pairings: Pairing[], i: number, j: number, history: PairCounts, drawnKeys: Set<string>): boolean {
  const currentCost = repeatCost([pairings[i], pairings[j]], history);
  for (const swap of swapOptions(pairings[i], pairings[j])) {
    if (!isValidSwap(swap, drawnKeys) || repeatCost(swap, history) >= currentCost) continue;
    applySwap(pairings, i, j, swap, drawnKeys);
    return true;
  }
  return false;
}

function improvementPass(pairings: Pairing[], history: PairCounts, drawnKeys: Set<string>): boolean {
  let improved = false;
  for (let i = 0; i < pairings.length; i++) {
    for (let j = i + 1; j < pairings.length; j++) improved = trySwap(pairings, i, j, history, drawnKeys) || improved;
  }
  return improved;
}

/** Troca adversários entre confrontos enquanto isso diminuir a repetição. */
export function improvePairings(pairings: readonly Pairing[], history: PairCounts): Pairing[] {
  const result = [...pairings];
  const drawnKeys = new Set(result.map((pairing) => pairKey(...pairing)));
  let pass = 0;
  while (pass < MAX_PASSES && improvementPass(result, history, drawnKeys)) pass++;
  return result;
}
