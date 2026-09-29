import { describe, expect, it } from 'vitest';
import { drawPairings } from './drawPairings';
import { pairKey, repeatCost, type PairCounts, type Pairing } from './pairHistory';
import {
  gamesPerUnit,
  hasDuplicateInRound,
  mergeHistory,
  optimalRepeatCost,
  repeatedPairings,
  unitIds,
} from './roundDraw.test-utils';
import { createSeededRandom } from './seededRandom';

// Sorteio dos confrontos (docs/DOMAIN.md, R30), com os dois modelos de
// ranking da spec: Rankin (4 jogos por rodada) e Vila (2 jogos por rodada).

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);
const EMPTY: PairCounts = new Map();

function draw(ids: string[], matchesPerUnit: number, history: PairCounts, seed: number): Pairing[] {
  return drawPairings({ unitIds: ids, matchesPerUnit, history }, createSeededRandom(seed));
}

/** Sorteia `rounds` rodadas seguidas, acumulando o histórico da temporada. */
function season(ids: string[], matchesPerUnit: number, rounds: number, seed: number): Pairing[][] {
  const drawn: Pairing[][] = [];
  let history: PairCounts = EMPTY;
  for (let round = 0; round < rounds; round++) {
    drawn.push(draw(ids, matchesPerUnit, history, seed * 100 + round));
    history = mergeHistory(history, drawn[round]);
  }
  return drawn;
}

function historyBefore(rounds: Pairing[][], index: number): PairCounts {
  return rounds.slice(0, index).reduce<PairCounts>((history, round) => mergeHistory(history, round), EMPTY);
}

describe('drawPairings: estrutura da rodada', () => {
  it('cada unidade joga o número de jogos do ranking, sem confronto duplicado na rodada', () => {
    const pairings = draw(unitIds(8), 4, EMPTY, 1);
    expect(pairings).toHaveLength(16);
    expect([...gamesPerUnit(pairings).values()]).toEqual(Array(8).fill(4));
    expect(hasDuplicateInRound(pairings)).toBe(false);
  });

  it('ninguém enfrenta a si mesmo', () => {
    expect(draw(unitIds(6), 4, EMPTY, 2).every(([a, b]) => a !== b)).toBe(true);
  });

  it('com menos de duas unidades não há confronto', () => {
    expect(draw(unitIds(1), 4, EMPTY, 1)).toEqual([]);
    expect(draw([], 2, EMPTY, 1)).toEqual([]);
  });
});

describe('drawPairings: sem repetir enquanto houver combinação nova (R30)', () => {
  it('Vila, 6 duplas: as rodadas 1 e 2 não repetem; a 3 repete só 3, o mínimo', () => {
    for (const seed of SEEDS) {
      const rounds = season(unitIds(6), 2, 3, seed);
      expect(repeatedPairings(rounds[1], historyBefore(rounds, 1))).toBe(0);
      // 15 confrontos possíveis, 12 já usados: a rodada 3 (6 jogos) usa os 3 novos.
      expect(repeatedPairings(rounds[2], historyBefore(rounds, 2))).toBe(3);
    }
  });

  it('Rankin, 6 duplas: a rodada 1 não repete; a 2 usa os 3 confrontos que sobraram', () => {
    for (const seed of SEEDS) {
      const rounds = season(unitIds(6), 4, 2, seed);
      // Regressão: o passo guloso travava e deixava duplas com 3 jogos.
      expect(rounds.map((round) => round.length)).toEqual([12, 12]);
      expect(repeatedPairings(rounds[0], EMPTY)).toBe(0);
      const history = historyBefore(rounds, 1);
      const newPairs = rounds[1].filter(([a, b]) => !history.has(pairKey(a, b)));
      expect(newPairs).toHaveLength(3); // 15 − 12 da rodada 1
    }
  });

  it('Rankin, 6 duplas: quando tudo já se repetiu, prefere o confronto que se repetiu menos', () => {
    for (const seed of SEEDS) {
      const rounds = season(unitIds(6), 4, 3, seed);
      const history = historyBefore(rounds, 2);
      expect(repeatCost(rounds[2], history)).toBe(optimalRepeatCost(unitIds(6), 4, history));
    }
  });

  it('atinge a menor repetição possível em históricos aleatórios (comparado com força bruta)', () => {
    const random = createSeededRandom(2026);
    for (let scenario = 0; scenario < 150; scenario++) {
      const ids = unitIds(3 + Math.floor(random() * 4)); // 3 a 6 unidades
      const matchesPerUnit = 1 + Math.floor(random() * 4); // 1 a 4 jogos
      const history = new Map(
        ids.flatMap((a, i) => ids.slice(i + 1).map((b) => [pairKey(a, b), Math.floor(random() * 3)] as const)),
      );
      const pairings = draw(ids, matchesPerUnit, history, scenario);
      expect(repeatCost(pairings, history)).toBe(optimalRepeatCost(ids, matchesPerUnit, history));
    }
  });
});

describe('drawPairings: categorias pequenas', () => {
  it('com menos adversários que jogos, cada unidade enfrenta cada outra uma vez', () => {
    const pairings = draw(unitIds(3), 4, EMPTY, 1); // Rankin com 3 duplas
    expect(pairings).toHaveLength(3);
    expect([...gamesPerUnit(pairings).values()]).toEqual([2, 2, 2]);
    expect(hasDuplicateInRound(pairings)).toBe(false);
  });

  it('com total ímpar de vagas, só uma unidade fica com um jogo a menos', () => {
    const pairings = draw(unitIds(5), 3, EMPTY, 1); // 5 × 3 = 15 vagas
    const games = [...gamesPerUnit(pairings).values()].sort();
    expect(games).toEqual([2, 3, 3, 3, 3]);
  });

  it('com 5 unidades e 1 jogo, uma fica de fora da rodada', () => {
    const pairings = draw(unitIds(5), 1, EMPTY, 4);
    expect(pairings).toHaveLength(2);
    expect(gamesPerUnit(pairings).size).toBe(4);
  });
});

describe('drawPairings: aleatoriedade', () => {
  it('a mesma semente reproduz o mesmo sorteio', () => {
    expect(draw(unitIds(6), 2, EMPTY, 9)).toEqual(draw(unitIds(6), 2, EMPTY, 9));
  });

  it('sementes diferentes dão sorteios diferentes', () => {
    const draws = new Set(SEEDS.map((seed) => JSON.stringify(draw(unitIds(6), 2, EMPTY, seed))));
    expect(draws.size).toBeGreaterThan(SEEDS.length / 2);
  });
});

describe('drawPairings: entrada inválida', () => {
  it('recusa jogos por rodada que não é inteiro positivo, citando o valor', () => {
    expect(() => draw(unitIds(4), 0, EMPTY, 1)).toThrow("recebi '0'");
    expect(() => draw(unitIds(4), 1.5, EMPTY, 1)).toThrow("recebi '1.5'");
  });

  it('recusa unidade repetida, citando o id', () => {
    expect(() => draw(['u1', 'u2', 'u1'], 1, EMPTY, 1)).toThrow("recebi 'u1'");
  });
});
