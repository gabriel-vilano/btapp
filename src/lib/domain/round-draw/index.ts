// Sorteio da rodada do ranking (docs/DOMAIN.md, R7 e R30). Função pura: a
// aleatoriedade e os ids entram como parâmetro, então o mesmo input com a
// mesma semente dá sempre o mesmo sorteio.

export {
  drawRound,
  RoundDrawError,
  type DrawnMatch,
  type RoundDrawErrorCode,
  type RoundDrawInput,
} from './drawRound';
export { drawPairings, type PairingProblem } from './drawPairings';
export { countPairs, pairKey, type PairCounts, type Pairing } from './pairHistory';
export { createSeededRandom, type RandomSource } from './seededRandom';
