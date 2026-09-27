import { describe, expect, it } from 'vitest';
import { createSeededRandom, shuffled } from './seededRandom';

function sequence(seed: number, length: number): number[] {
  const random = createSeededRandom(seed);
  return Array.from({ length }, () => random());
}

describe('createSeededRandom', () => {
  it('a mesma semente dá a mesma sequência', () => {
    expect(sequence(42, 10)).toEqual(sequence(42, 10));
  });

  it('sementes diferentes dão sequências diferentes', () => {
    expect(sequence(1, 10)).not.toEqual(sequence(2, 10));
  });

  it('gera números em [0, 1)', () => {
    const values = sequence(7, 1000);
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it('recusa semente que não é inteira, citando o valor', () => {
    expect(() => createSeededRandom(1.5)).toThrow("recebi '1.5'");
  });
});

describe('shuffled', () => {
  it('mantém os itens e não altera a lista original', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const result = shuffled(items, createSeededRandom(3));
    expect([...result].sort()).toEqual(items);
    expect(items).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
