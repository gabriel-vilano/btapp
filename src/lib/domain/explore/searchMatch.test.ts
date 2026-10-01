import { describe, expect, it } from 'vitest';
import { isExactUsername, matchesSearchTerm, normalizeSearchText } from './searchMatch';

describe('matchesSearchTerm (EX15)', () => {
  it('exemplos da spec: sem acento, pelo sobrenome e com ou sem @', () => {
    expect(matchesSearchTerm('João Silva', 'joao')).toBe(true);
    expect(matchesSearchTerm('Ana Silva', 'sil')).toBe(true);
    expect(matchesSearchTerm('lucas.m', '@lu')).toBe(true);
    expect(matchesSearchTerm('lucas.m', 'lu')).toBe(true);
  });

  it('ignora maiúscula, acento no termo e espaço sobrando', () => {
    expect(matchesSearchTerm('Júlia Andrade', '  JÚL ')).toBe(true);
    expect(matchesSearchTerm('Sérgio Batista', 'serg')).toBe(true);
  });

  it('vale só pelo início da palavra, não pelo meio', () => {
    expect(matchesSearchTerm('Ana Silva', 'ilva')).toBe(false);
    expect(matchesSearchTerm('lucas.m', 'm')).toBe(false);
  });

  it('termo com duas palavras acha o nome em sequência', () => {
    expect(matchesSearchTerm('Ana Paula Ribeiro', 'paula rib')).toBe(true);
    expect(matchesSearchTerm('Ana Paula Ribeiro', 'ana rib')).toBe(false);
  });

  it('termo vazio ou só @ não acha nada', () => {
    expect(matchesSearchTerm('Ana Silva', '')).toBe(false);
    expect(matchesSearchTerm('Ana Silva', ' @ ')).toBe(false);
  });
});

describe('isExactUsername (EX16)', () => {
  it('o termo inteiro é o @username, com ou sem @', () => {
    expect(isExactUsername('lucas.m', '@Lucas.M')).toBe(true);
    expect(isExactUsername('lucas.m', 'lucas')).toBe(false);
    expect(isExactUsername('lucas.m', '@')).toBe(false);
  });
});

describe('normalizeSearchText', () => {
  it('minúsculo, sem acento e com um espaço só entre palavras', () => {
    expect(normalizeSearchText('  Paulo   César ')).toBe('paulo cesar');
  });
});
