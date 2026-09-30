import { describe, expect, it } from 'vitest';
import { gameSet, interruptedSet, superTiebreak } from '@/src/mocks/domain/builders';
import { toScore } from './score';

// Resultado do domínio no formato do ScoreBlock, gravado do lado vencedor.

describe('toScore', () => {
  it('vitória do lado A: os sets ficam como estão', () => {
    const sets = [gameSet(6, 4), gameSet(3, 6), superTiebreak(10, 7)];
    expect(toScore({ type: 'normal', winner: 'a', sets })).toEqual({
      type: 'normal',
      sets: [{ a: 6, b: 4 }, { a: 3, b: 6 }, { a: 10, b: 7 }],
    });
  });

  it('vitória do lado B: o vencedor vai para o `a`', () => {
    expect(toScore({ type: 'normal', winner: 'b', sets: [gameSet(4, 6)] })).toEqual({ type: 'normal', sets: [{ a: 6, b: 4 }] });
  });

  it('W.O.: sem placar', () => {
    expect(toScore({ type: 'wo', winner: 'b' })).toEqual({ type: 'wo' });
  });

  it('desistência: os sets completos e o interrompido', () => {
    expect(toScore({ type: 'retired', winner: 'b', sets: [gameSet(4, 6), interruptedSet(2, 1)] })).toEqual({
      type: 'retired',
      completed_sets: [{ a: 6, b: 4 }],
      interrupted_set: { a: 1, b: 2 },
    });
  });

  it('desistência entre sets: o set seguinte fica 0 × 0', () => {
    expect(toScore({ type: 'retired', winner: 'a', sets: [gameSet(6, 2)] })).toEqual({
      type: 'retired',
      completed_sets: [{ a: 6, b: 2 }],
      interrupted_set: { a: 0, b: 0 },
    });
  });
});
