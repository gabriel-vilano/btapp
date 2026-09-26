import { describe, expect, it } from 'vitest';
import type { MatchFormat, MatchSet, MatchSideKey, NormalResult, RetiredResult } from '@/src/types/domain';
import { gameSet, interruptedSet, superTiebreak } from '@/src/mocks/domain/builders';
import { completeRetiredScore, formatScore, validateScore, type ScoreErrorCode } from './matchScore';

// Validação e completamento do placar pelo formato (docs/DOMAIN.md, R11 e R29).

function normal(winner: MatchSideKey, ...sets: MatchSet[]): NormalResult {
  return { type: 'normal', winner, sets };
}

function retired(winner: MatchSideKey, ...sets: MatchSet[]): RetiredResult {
  return { type: 'retired', winner, sets };
}

function interruptedSuperTiebreak(pointsA: number, pointsB: number): MatchSet {
  return { ...superTiebreak(pointsA, pointsB), interrupted: true };
}

function expectInvalid(result: NormalResult | RetiredResult, format: MatchFormat, code: ScoreErrorCode) {
  const check = validateScore(result, format);
  expect(check.valid ? 'válido' : check.code, formatScore(result.sets)).toBe(code);
}

describe('validateScore: set de 6 (R29)', () => {
  it.each([[6, 0], [6, 4], [7, 5], [7, 6], [4, 6], [6, 7]])('aceita %i/%i', (a, b) => {
    expect(validateScore(normal(a > b ? 'a' : 'b', gameSet(a, b)), 'one_set_of_6')).toEqual({ valid: true });
  });

  it.each([[6, 5], [5, 3], [7, 4], [8, 6], [7, 7], [6, 6]])('recusa %i/%i', (a, b) => {
    expectInvalid(normal('a', gameSet(a, b)), 'one_set_of_6', 'set_score');
  });
});

describe('validateScore: set de 8 (R29)', () => {
  it.each([[8, 0], [8, 6], [9, 7], [9, 8], [6, 8]])('aceita %i/%i', (a, b) => {
    expect(validateScore(normal(a > b ? 'a' : 'b', gameSet(a, b)), 'one_set_of_8')).toEqual({ valid: true });
  });

  it.each([[8, 7], [7, 6], [6, 4], [10, 8], [9, 6]])('recusa %i/%i', (a, b) => {
    expectInvalid(normal('a', gameSet(a, b)), 'one_set_of_8', 'set_score');
  });
});

describe('validateScore: 2 sets de 6 com super tiebreak (R29)', () => {
  it.each([
    ['2 a 0', normal('a', gameSet(6, 4), gameSet(6, 3))],
    ['STB a 10', normal('a', gameSet(6, 4), gameSet(3, 6), superTiebreak(10, 7))],
    ['STB na vantagem de 2', normal('b', gameSet(6, 4), gameSet(3, 6), superTiebreak(10, 12))],
  ])('aceita %s', (_label, result) => {
    expect(validateScore(result, 'two_sets_of_6_stb')).toEqual({ valid: true });
  });

  it.each([
    ['1 set só', normal('a', gameSet(6, 4)), 'undecided'],
    ['1 a 1 sem STB', normal('a', gameSet(6, 4), gameSet(3, 6)), 'undecided'],
    ['3º set depois do 2 a 0', normal('a', gameSet(6, 4), gameSet(6, 3), superTiebreak(10, 7)), 'too_many_sets'],
    ['3º set normal no lugar do STB', normal('a', gameSet(6, 4), gameSet(3, 6), gameSet(6, 2)), 'set_type'],
    ['STB no 1º set', normal('a', superTiebreak(10, 7), gameSet(6, 3)), 'set_type'],
    ['STB sem vantagem de 2', normal('a', gameSet(6, 4), gameSet(3, 6), superTiebreak(10, 9)), 'set_score'],
    ['STB passando da vantagem', normal('a', gameSet(6, 4), gameSet(3, 6), superTiebreak(13, 10)), 'set_score'],
  ] as const)('recusa %s', (_label, result, code) => {
    expectInvalid(result, 'two_sets_of_6_stb', code);
  });
});

describe('validateScore: regras gerais', () => {
  it('recusa placar vazio', () => {
    expectInvalid(normal('a'), 'one_set_of_6', 'no_sets');
  });

  it('recusa vencedor diferente do placar', () => {
    expectInvalid(normal('b', gameSet(6, 4)), 'one_set_of_6', 'winner_mismatch');
  });

  it('recusa set além do formato', () => {
    expectInvalid(normal('a', gameSet(6, 4), gameSet(6, 2)), 'one_set_of_6', 'too_many_sets');
  });

  it('recusa games negativos ou fracionados', () => {
    expectInvalid(normal('a', gameSet(6, -1)), 'one_set_of_6', 'set_score');
    expectInvalid(normal('a', gameSet(6, 1.5)), 'one_set_of_6', 'set_score');
  });

  it('recusa set interrompido em resultado normal', () => {
    expectInvalid(normal('a', interruptedSet(4, 2)), 'one_set_of_6', 'interrupted_set');
  });
});

describe('validateScore: desistência (R11)', () => {
  it.each([
    ['set de 6 no meio', retired('b', interruptedSet(4, 2)), 'one_set_of_6'],
    ['set de 6 no tie-break', retired('a', interruptedSet(6, 6)), 'one_set_of_6'],
    ['set de 8 em 7/7', retired('a', interruptedSet(7, 7)), 'one_set_of_8'],
    ['antes do 2º set começar', retired('b', gameSet(6, 4), interruptedSet(0, 0)), 'two_sets_of_6_stb'],
    ['no STB', retired('a', gameSet(6, 4), gameSet(4, 6), interruptedSuperTiebreak(5, 8)), 'two_sets_of_6_stb'],
  ] as const)('aceita %s', (_label, result, format) => {
    expect(validateScore(result, format)).toEqual({ valid: true });
  });

  it.each([
    ['sem set interrompido', retired('a', gameSet(6, 4)), 'one_set_of_6', 'interrupted_set'],
    ['interrompido antes do último set', retired('a', interruptedSet(3, 2), gameSet(6, 1)), 'two_sets_of_6_stb', 'interrupted_set'],
    ['interrompido com placar de set encerrado', retired('a', interruptedSet(6, 4)), 'one_set_of_6', 'set_score'],
    ['interrompido com placar inalcançável', retired('a', interruptedSet(7, 2)), 'one_set_of_6', 'set_score'],
    ['depois da partida decidida', retired('a', gameSet(6, 4), gameSet(6, 3), interruptedSuperTiebreak(1, 0)), 'two_sets_of_6_stb', 'too_many_sets'],
  ] as const)('recusa %s', (_label, result, format, code) => {
    expectInvalid(result, format, code);
  });
});

describe('completeRetiredScore (R11)', () => {
  it.each([
    ['set de 6: o vencedor fecha o set', retired('b', interruptedSet(4, 2)), 'one_set_of_6', '4/6'],
    ['set de 6: 5/5 vai a 7', retired('a', interruptedSet(5, 5)), 'one_set_of_6', '7/5'],
    ['set de 6: 6/6 vai ao tie-break', retired('b', interruptedSet(6, 5)), 'one_set_of_6', '6/7'],
    ['set de 8: 7/7 vai a 9', retired('a', interruptedSet(7, 7)), 'one_set_of_8', '9/7'],
    ['set de 8: 8/8 vai ao tie-break', retired('a', interruptedSet(8, 8)), 'one_set_of_8', '9/8'],
    ['2 sets: 1 a 1 leva ao STB do vencedor', retired('a', gameSet(4, 6), interruptedSet(3, 2)), 'two_sets_of_6_stb', '4/6 6/2 10/0'],
    ['2 sets: desistência no 1º set', retired('a', interruptedSet(1, 3)), 'two_sets_of_6_stb', '6/3 6/0'],
    ['2 sets: antes do 2º set começar', retired('b', gameSet(6, 4), interruptedSet(0, 0)), 'two_sets_of_6_stb', '6/4 0/6 0/10'],
    ['2 sets: desistência no STB', retired('a', gameSet(6, 4), gameSet(4, 6), interruptedSuperTiebreak(5, 8)), 'two_sets_of_6_stb', '6/4 4/6 10/8'],
    ['2 sets: STB na vantagem', retired('b', gameSet(6, 4), gameSet(4, 6), interruptedSuperTiebreak(11, 10)), 'two_sets_of_6_stb', '6/4 4/6 11/13'],
  ] as const)('%s', (_label, result, format, expected) => {
    expect(formatScore(completeRetiredScore(result, format))).toBe(expected);
  });

  it('o placar completado não tem set interrompido e não altera o lançado', () => {
    const result = retired('a', gameSet(4, 6), interruptedSet(3, 2));
    const completed = completeRetiredScore(result, 'two_sets_of_6_stb');
    expect(completed.every((set) => !set.interrupted)).toBe(true);
    expect(completed[2].super_tiebreak).toBe(true);
    expect(result.sets[1]).toEqual(interruptedSet(3, 2));
  });

  it('lança erro com o motivo quando o placar lançado é inválido', () => {
    expect(() => completeRetiredScore(retired('a', interruptedSet(6, 4)), 'one_set_of_6')).toThrow(/set 1 \(6\/4\)/);
  });
});
