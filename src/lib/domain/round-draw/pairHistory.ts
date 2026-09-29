// Confronto e histórico de confrontos, pelo id da inscrição de cada lado.

/** Um confronto: os dois lados de uma partida. A ordem não muda o confronto. */
export type Pairing = readonly [string, string];

/** Quantas vezes cada confronto já aconteceu, pela chave de `pairKey`. */
export type PairCounts = ReadonlyMap<string, number>;

/** Chave do confronto que ignora a ordem: `pairKey(a, b) === pairKey(b, a)`. */
export function pairKey(first: string, second: string): string {
  return first < second ? `${first}|${second}` : `${second}|${first}`;
}

export function countPairs(pairings: readonly Pairing[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const [first, second] of pairings) {
    const key = pairKey(first, second);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function timesMet(history: PairCounts, first: string, second: string): number {
  return history.get(pairKey(first, second)) ?? 0;
}

/** Soma das vezes que os confrontos já aconteceram: é o que o sorteio minimiza. */
export function repeatCost(pairings: readonly Pairing[], history: PairCounts): number {
  return pairings.reduce((total, [first, second]) => total + timesMet(history, first, second), 0);
}
