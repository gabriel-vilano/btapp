// Aleatoriedade injetável do sorteio. A função de sorteio nunca chama
// Math.random direto: recebe a fonte. Assim o app sorteia de verdade e o
// teste passa uma semente e sempre recebe o mesmo resultado.

/** Fonte de aleatoriedade: devolve um número em [0, 1), como `Math.random`. */
export type RandomSource = () => number;

/**
 * Gerador com semente (algoritmo mulberry32): a mesma semente dá sempre a
 * mesma sequência. Serve para teste e para reproduzir um sorteio.
 *
 * @example
 * const random = createSeededRandom(42);
 * random(); // sempre o mesmo número para a semente 42
 */
export function createSeededRandom(seed: number): RandomSource {
  if (!Number.isInteger(seed)) {
    throw new Error(`Semente inválida: recebi '${seed}', esperado um número inteiro`);
  }
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Cópia embaralhada da lista (Fisher–Yates), sem alterar a original. */
export function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
