import { describe, expect, it } from 'vitest';
import { isCanonicalH2HRequest } from './canonical';

describe('isCanonicalH2HRequest', () => {
  it('aceita jogadores em qualquer ordem: a ordem dos lados é a perspectiva (HH6)', () => {
    expect(isCanonicalH2HRequest('pedrohenrique', 'lucassilva')).toBe(true);
  });

  it('pede a ordem alfabética dentro da dupla (HH5)', () => {
    expect(isCanonicalH2HRequest('lucassilva+rafaelcosta', 'pedrohenrique+thiagomendes')).toBe(true);
    expect(isCanonicalH2HRequest('rafaelcosta+lucassilva', 'pedrohenrique+thiagomendes')).toBe(false);
    expect(isCanonicalH2HRequest('lucassilva+rafaelcosta', 'thiagomendes%2Bpedrohenrique')).toBe(false);
  });

  it('deixa o segmento inválido para o "H2H não encontrado"', () => {
    expect(isCanonicalH2HRequest('a+b+c', 'lucassilva')).toBe(true);
  });
});
