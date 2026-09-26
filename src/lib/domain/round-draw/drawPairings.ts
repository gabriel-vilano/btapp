import { buildPairings, type PairingAttempt } from './buildPairings';
import { improvePairings } from './improvePairings';
import { repeatCost, type PairCounts, type Pairing } from './pairHistory';
import { shuffled, type RandomSource } from './seededRandom';

// Sorteio dos confrontos em si, sem saber de ranking nem de partida: só ids.
//
// Achar a combinação com o mínimo de repetição é um problema de grafos
// (escolher um subgrafo em que todo vértice tem o mesmo grau) que não tem
// atalho simples. Como as categorias são pequenas, a solução é por força
// bruta barata: várias tentativas aleatórias, cada uma gulosa e depois
// melhorada por busca local, e fica a melhor. É isso que faz o sorteio ser
// aleatório: cada tentativa começa de uma ordem embaralhada.

const ATTEMPTS = 60;

export interface PairingProblem {
  unitIds: readonly string[];
  matchesPerUnit: number; // do ranking (Rankin: 4; Vila: 2)
  history: PairCounts; // confrontos da temporada antes desta rodada
}

interface ScoredAttempt extends PairingAttempt {
  cost: number;
}

function validateProblem({ unitIds, matchesPerUnit }: PairingProblem): void {
  if (!Number.isInteger(matchesPerUnit) || matchesPerUnit < 1) {
    throw new Error(`Jogos por rodada inválido: recebi '${matchesPerUnit}', esperado inteiro maior que 0`);
  }
  const duplicate = unitIds.find((id, index) => unitIds.indexOf(id) !== index);
  if (duplicate !== undefined) {
    throw new Error(`Unidade repetida no sorteio: recebi '${duplicate}' mais de uma vez, esperado ids únicos`);
  }
}

function scoredAttempt(problem: PairingProblem, perUnit: number, random: RandomSource): ScoredAttempt {
  const built = buildPairings(shuffled(problem.unitIds, random), perUnit, problem.history);
  const pairings = improvePairings(built.pairings, problem.history);
  return { pairings, unfilled: built.unfilled, cost: repeatCost(pairings, problem.history) };
}

// Primeiro todo mundo com seus jogos; depois, o mínimo de repetição.
function isBetter(candidate: ScoredAttempt, best: ScoredAttempt): boolean {
  if (candidate.unfilled !== best.unfilled) return candidate.unfilled < best.unfilled;
  return candidate.cost < best.cost;
}

function isPerfect(attempt: ScoredAttempt, minimumUnfilled: number): boolean {
  return attempt.unfilled === minimumUnfilled && attempt.cost === 0;
}

/** Embaralha a lista e sorteia quem fica no lado A de cada confronto. */
function orient(pairings: readonly Pairing[], random: RandomSource): Pairing[] {
  return shuffled(pairings, random).map(([first, second]) => (random() < 0.5 ? [first, second] : [second, first]));
}

/**
 * Sorteia os confrontos de uma rodada (R30): cada unidade joga
 * `matchesPerUnit` partidas, e o confronto só se repete quando não sobra
 * combinação nova. Na mesma rodada, nunca se repete.
 *
 * Limites da própria conta: com menos adversários que jogos, cada unidade
 * joga uma vez contra cada um; com total ímpar de vagas, uma unidade fica
 * com um jogo a menos.
 */
export function drawPairings(problem: PairingProblem, random: RandomSource): Pairing[] {
  validateProblem(problem);
  const perUnit = Math.min(problem.matchesPerUnit, problem.unitIds.length - 1);
  if (perUnit <= 0) return [];
  const minimumUnfilled = (perUnit * problem.unitIds.length) % 2;
  let best = scoredAttempt(problem, perUnit, random);
  for (let i = 1; i < ATTEMPTS && !isPerfect(best, minimumUnfilled); i++) {
    const candidate = scoredAttempt(problem, perUnit, random);
    if (isBetter(candidate, best)) best = candidate;
  }
  return orient(best.pairings, random);
}
