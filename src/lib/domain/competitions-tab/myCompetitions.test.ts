import { describe, expect, it } from 'vitest';
import { rankingItem, tournamentItem } from './competitionsTab.test-utils';
import { sortMyCompetitions, tournamentMoment } from './myCompetitions';

const ids = (items: { enrollment_id: string }[]) => items.map((item) => item.enrollment_id);

describe('sortMyCompetitions (N29)', () => {
  it('põe os rankings antes dos torneios, mesmo com o torneio mais próximo', () => {
    const items = [tournamentItem('t1', '2026-10-01'), rankingItem('r1', '2026-03-01')];
    expect(ids(sortMyCompetitions(items))).toEqual(['r1', 't1']);
  });

  it('ordena os rankings da inscrição mais recente para a mais antiga', () => {
    const items = [
      rankingItem('antiga', '2026-02-01T12:00:00Z'),
      rankingItem('recente', '2026-08-01T12:00:00Z'),
      rankingItem('meio', '2026-05-01T12:00:00Z'),
    ];
    expect(ids(sortMyCompetitions(items))).toEqual(['recente', 'meio', 'antiga']);
  });

  it('ordena os torneios do mais próximo ao mais distante', () => {
    const items = [tournamentItem('longe', '2026-12-05'), tournamentItem('perto', '2026-10-10')];
    expect(ids(sortMyCompetitions(items))).toEqual(['perto', 'longe']);
  });

  it('usa o próximo jogo do torneio, quando há confronto, no lugar do início do evento', () => {
    // Os dois começam no mesmo dia; o jogo das 9h de B vem antes do de A às 14h
    const a = tournamentItem('a', '2026-10-10T00:00:00Z', '2026-10-10T17:00:00Z');
    const b = tournamentItem('b', '2026-10-10T00:00:00Z', '2026-10-10T12:00:00Z');
    expect(ids(sortMyCompetitions([a, b]))).toEqual(['b', 'a']);
  });

  it('desempata pelo id, para a lista não trocar de ordem entre renderizações', () => {
    const items = [rankingItem('r2', '2026-05-01'), rankingItem('r1', '2026-05-01')];
    expect(ids(sortMyCompetitions(items))).toEqual(['r1', 'r2']);
  });

  it('não muda a lista recebida', () => {
    const items = [tournamentItem('t1', '2026-10-01'), rankingItem('r1', '2026-03-01')];
    sortMyCompetitions(items);
    expect(ids(items)).toEqual(['t1', 'r1']);
  });

  it('devolve lista vazia para lista vazia', () => {
    expect(sortMyCompetitions([])).toEqual([]);
  });
});

describe('tournamentMoment', () => {
  it('é o próximo jogo quando há confronto', () => {
    expect(tournamentMoment(tournamentItem('t', '2026-10-10', '2026-10-11T12:00:00Z'))).toBe('2026-10-11T12:00:00Z');
  });

  it('é o início do evento sem confronto', () => {
    expect(tournamentMoment(tournamentItem('t', '2026-10-10'))).toBe('2026-10-10');
  });
});
