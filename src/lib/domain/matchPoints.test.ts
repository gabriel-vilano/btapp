import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCORING_RULE,
  type MatchSet,
  type MatchSideKey,
  type NormalResult,
  type RetiredResult,
  type ScoringRule,
} from '@/src/types/domain';
import { gameSet, interruptedSet, superTiebreak } from '@/src/mocks/domain/builders';
import { countGames, matchPoints } from './matchPoints';

// Pontuação pela regra padrão (docs/DOMAIN.md, R9–R11 e R36), com os exemplos
// da própria spec.

const rule = DEFAULT_SCORING_RULE;

function normal(winner: MatchSideKey, ...sets: MatchSet[]): NormalResult {
  return { type: 'normal', winner, sets };
}

function retired(winner: MatchSideKey, ...sets: MatchSet[]): RetiredResult {
  return { type: 'retired', winner, sets };
}

describe('countGames (R9)', () => {
  it('o super tiebreak vale 1 game para o vencedor dele', () => {
    expect(countGames([gameSet(6, 4), gameSet(3, 6), superTiebreak(10, 7)])).toEqual({ a: 10, b: 10 });
  });
});

describe('matchPoints: resultado normal (R9)', () => {
  it('6/4 6/3 → 110 e 40 (exemplo da spec)', () => {
    const result = normal('a', gameSet(6, 4), gameSet(6, 3));
    expect(matchPoints(result, 'two_sets_of_6_stb', rule)).toEqual({ a: 110, b: 40 });
  });

  it('6/4 3/6 10/7 → 100 e 50 (exemplo da spec com STB)', () => {
    const result = normal('a', gameSet(6, 4), gameSet(3, 6), superTiebreak(10, 7));
    expect(matchPoints(result, 'two_sets_of_6_stb', rule)).toEqual({ a: 100, b: 50 });
  });

  it('pontua o lado B quando ele vence', () => {
    const result = normal('b', gameSet(7, 9));
    expect(matchPoints(result, 'one_set_of_8', rule)).toEqual({ a: 50 + 14 - 18, b: 100 + 18 - 14 });
  });

  it('usa a regra do ranking, não a padrão', () => {
    const custom: ScoringRule = { ...rule, win: 3, loss: 1, per_game_won: 0, per_game_lost: 0 };
    const result = normal('a', gameSet(6, 4));
    expect(matchPoints(result, 'one_set_of_6', custom)).toEqual({ a: 3, b: 1 });
  });

  it('lança erro com o motivo quando o placar é inválido para o formato', () => {
    const result = normal('a', gameSet(6, 5));
    expect(() => matchPoints(result, 'one_set_of_6', rule)).toThrow(/set 1 \(6\/5\)/);
  });
});

describe('matchPoints: W.O. (R10, R36)', () => {
  it('quem compareceu leva 100, o ausente 0', () => {
    expect(matchPoints({ type: 'wo', winner: 'b' }, 'one_set_of_6', rule)).toEqual({ a: 0, b: 100 });
  });

  it('W.O. duplo vale 0 e 0', () => {
    expect(matchPoints({ type: 'double_wo' }, 'one_set_of_6', rule)).toEqual({ a: 0, b: 0 });
  });
});

describe('matchPoints: desistência pontua o placar completado (R11)', () => {
  it('2 sets: exemplo da spec, 6/4 para o desistente e 2/3 no 2º → 106 e 44', () => {
    const result = retired('a', gameSet(4, 6), interruptedSet(3, 2)); // completado: 4/6 6/2 10/0
    expect(matchPoints(result, 'two_sets_of_6_stb', rule)).toEqual({ a: 106, b: 44 });
  });

  it('set de 6: o desistente liderava 4/2 → completado 4/6', () => {
    expect(matchPoints(retired('b', interruptedSet(4, 2)), 'one_set_of_6', rule)).toEqual({ a: 46, b: 104 });
  });

  it('set de 8: 7/7 → completado 9/7', () => {
    expect(matchPoints(retired('a', interruptedSet(7, 7)), 'one_set_of_8', rule)).toEqual({ a: 104, b: 46 });
  });

  it('desistir perdendo não rende mais que perder o jogo inteiro (o porquê da R11)', () => {
    const lostWhole = matchPoints(normal('a', gameSet(6, 1)), 'one_set_of_6', rule);
    const retiredLosing = matchPoints(retired('a', interruptedSet(5, 1)), 'one_set_of_6', rule);
    expect(retiredLosing.b).toBe(lostWhole.b);
  });
});
