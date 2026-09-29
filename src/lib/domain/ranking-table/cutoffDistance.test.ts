import { describe, expect, it } from 'vitest';
import type { SeasonFinal } from '@/src/types/domain';
import { computeStandings } from '../standings';
import { closed, enrollment, FLAT_RULE, played, testScope, win } from '../standings.test-utils';
import { cutoffDistance } from './cutoffDistance';

// "Faltam N pts para o Nº" (docs/RANKING.md, RK11).

const final: SeasonFinal = { name: 'Saideira', qualifiers: 2, cutoff_date: '2026-03-01T00:00:00Z', tournament_id: null };
const BEFORE = '2026-02-01T00:00:00Z';
const AFTER = '2026-03-02T00:00:00Z';

const [a, b, c, d] = [enrollment('a', 0), enrollment('b', 1), enrollment('c', 2), enrollment('d', 3)];
// A 216, B 104, D 92, C 38: a vaga 2 é da B
const matches = [played(a, c, win(6, 0)), played(a, d, win(6, 4)), played(b, d, win(6, 4))];
const rows = computeStandings(testScope([a, b, c, d], matches));

describe('cutoffDistance (RK11)', () => {
  it('abaixo da linha: pontos até a última vaga e a posição dela', () => {
    expect(cutoffDistance(rows, final, c.id, BEFORE)).toEqual({ points: 104 - 38, position: 2 });
    expect(cutoffDistance(rows, final, d.id, BEFORE)).toEqual({ points: 104 - 92, position: 2 });
  });

  it('dentro da zona: nada', () => {
    expect(cutoffDistance(rows, final, a.id, BEFORE)).toBeNull();
    expect(cutoffDistance(rows, final, b.id, BEFORE)).toBeNull();
  });

  it('some depois da data de corte', () => {
    expect(cutoffDistance(rows, final, c.id, AFTER)).toBeNull();
  });

  it('temporada sem final: nada', () => {
    expect(cutoffDistance(rows, null, c.id, BEFORE)).toBeNull();
  });

  it('encerrada dentro da zona: a última vaga desce uma posição', () => {
    const withClosed = computeStandings(testScope([closed(a, '2026-01-20T00:00:00Z'), b, c, d], matches));
    expect(cutoffDistance(withClosed, final, c.id, BEFORE)).toEqual({ points: 92 - 38, position: 3 });
  });

  it('a própria inscrição encerrada não disputa vaga', () => {
    const withClosed = computeStandings(testScope([a, b, c, closed(d, '2026-01-20T00:00:00Z')], matches));
    expect(cutoffDistance(withClosed, final, d.id, BEFORE)).toBeNull();
  });

  it('empate na última vaga: fora por desempate, falta 0 pt', () => {
    // X e Y com 100 pontos (games sem valor); o saldo de games põe X na frente
    const [x, y, w1, w2] = [enrollment('x', 0), enrollment('y', 1), enrollment('w1', 2), enrollment('w2', 3)];
    const tied = [played(x, w1, win(6, 0), { rule: FLAT_RULE }), played(y, w2, win(6, 4), { rule: FLAT_RULE })];
    const tiedRows = computeStandings(testScope([x, y, w1, w2], tied));
    expect(cutoffDistance(tiedRows, { ...final, qualifiers: 1 }, y.id, BEFORE)).toEqual({ points: 0, position: 1 });
  });

  it('empate em todos os critérios na última vaga (espera o admin): falta 0 pt', () => {
    const [x, y, w1, w2] = [enrollment('x', 0), enrollment('y', 1), enrollment('w1', 2), enrollment('w2', 3)];
    const tiedRows = computeStandings(testScope([x, y, w1, w2], [played(x, w1, win(6, 4)), played(y, w2, win(6, 4))]));
    expect(tiedRows[1].awaiting_admin).toBe(true);
    expect(cutoffDistance(tiedRows, { ...final, qualifiers: 1 }, y.id, BEFORE)).toEqual({ points: 0, position: 1 });
  });

  it('menos inscrições ativas que vagas: todas dentro', () => {
    expect(cutoffDistance(rows, { ...final, qualifiers: 8 }, d.id, BEFORE)).toBeNull();
  });
});
