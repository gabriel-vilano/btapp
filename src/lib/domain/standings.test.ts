import { describe, expect, it } from 'vitest';
import type { RetiredResult } from '@/src/types/domain';
import { interruptedSet } from '@/src/mocks/domain/builders';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { computeStandings, type StandingRow } from './standings';
import { enrollment, FLAT_RULE, played, testScope, win } from './standings.test-utils';

// Classificação (docs/DOMAIN.md, R8) e desempate (R37). Nos cenários de
// empate, a regra FLAT_RULE (games sem valor) deixa montar pontos iguais com
// vitórias e saldos diferentes.

const ids = (rows: StandingRow[]) => rows.map((row) => row.enrollment_id);

describe('computeStandings: soma dos pontos (R8)', () => {
  it('ranking dos mocks: soma as partidas confirmadas, ao vivo (R46)', () => {
    const { season, rankingCategories, masculinoB: mb } = mockEntities;
    const rows = computeStandings({ season_id: season.id, category_id: rankingCategories.masculinoB.id, ...mockDomain });
    expect(rows.map((row) => [row.enrollment_id, row.points])).toEqual([
      [mb.t3.id, 418],
      [mb.t5.id, 402], // + 108 da r3-6, confirmada na rodada em andamento
      [mb.t1.id, 364],
      [mb.t2.id, 202],
      [mb.t6.id, 168],
      [mb.t4.id, 46],
    ]);
  });

  it('ignora partida não confirmada, de outra categoria e de outra temporada (R16)', () => {
    const [x, y] = [enrollment('x'), enrollment('y')];
    const counted = played(x, y, win(6, 4));
    const pending = { ...played(y, x, win(6, 0)), status: 'defined' as const };
    const otherCategory = { ...played(y, x, win(6, 1)), category_id: 'cat-other' };
    const otherSeason = { ...played(y, x, win(6, 2)), round_id: 'round-other-season' };
    const rows = computeStandings(testScope([x, y], [counted, pending, otherCategory, otherSeason]));
    expect(rows.map((row) => [row.enrollment_id, row.points])).toEqual([[x.id, 104], [y.id, 46]]);
  });

  it('com asOf, deixa de fora a partida confirmada e a inscrição feitas depois', () => {
    const [x, y, late] = [enrollment('x'), enrollment('y'), { ...enrollment('late'), enrolled_at: '2026-01-10T00:00:00Z' }];
    const early = played(x, y, win(6, 4), { confirmedAt: '2026-01-05T00:00:00Z' });
    const after = played(y, x, win(6, 0), { confirmedAt: '2026-01-15T00:00:00Z' });
    const rows = computeStandings(testScope([x, y, late], [early, after]), '2026-01-08T00:00:00Z');
    expect(rows.map((row) => [row.enrollment_id, row.points])).toEqual([[x.id, 104], [y.id, 46]]);
  });

  it('desistência: vitória para o vencedor e saldo pelo placar completado (R11)', () => {
    const [x, y] = [enrollment('x'), enrollment('y')];
    // Y vencia por 4/2 e desistiu: o placar completado é 4/6 para X
    const retired: RetiredResult = { type: 'retired', winner: 'b', sets: [interruptedSet(4, 2)] };
    const [first, second] = computeStandings(testScope([x, y], [played(y, x, retired)]));
    expect(first).toMatchObject({ enrollment_id: x.id, points: 104, wins: 1, games_balance: 2 });
    expect(second).toMatchObject({ enrollment_id: y.id, points: 46, wins: 0, games_balance: -2 });
  });
});

describe('computeStandings: desempate (R37)', () => {
  it('duas empatadas que já se enfrentaram: vale o confronto direto, antes do saldo', () => {
    // Y teria saldo melhor (+4 contra −4), mas X venceu o confronto
    const [y, x, w1, w2] = [enrollment('y', 0), enrollment('x', 1), enrollment('w1', 2), enrollment('w2', 3)];
    const matches = [
      played(x, y, win(6, 4), { rule: FLAT_RULE }),
      played(w2, x, win(6, 0), { rule: FLAT_RULE }),
      played(y, w1, win(6, 0), { rule: FLAT_RULE }),
    ];
    const rows = computeStandings(testScope([y, x, w1, w2], matches));
    expect(ids(rows)).toEqual([x.id, y.id, w2.id, w1.id]);
    expect(rows.every((row) => !row.awaiting_admin)).toBe(true);
  });

  it('W.O. não é confronto direto (R19), mas conta como vitória', () => {
    const [x, y, w1, w2, w3] = ['x', 'y', 'w1', 'w2', 'w3'].map((slug, order) => enrollment(slug, order));
    const matches = [
      played(x, y, { type: 'wo', winner: 'a' }, { rule: FLAT_RULE }),
      played(w2, x, win(6, 0), { rule: FLAT_RULE }),
      played(y, w1, win(6, 0), { rule: FLAT_RULE }),
      played(w3, y, win(6, 4), { rule: FLAT_RULE }),
    ];
    const [first, second] = computeStandings(testScope([x, y, w1, w2, w3], matches));
    expect(first).toMatchObject({ enrollment_id: y.id, points: 150, wins: 1, games_balance: 4 });
    expect(second).toMatchObject({ enrollment_id: x.id, points: 150, wins: 1, games_balance: -6 });
  });

  it('confronto direto empatado (1 a 1): segue para vitórias e saldo', () => {
    const [y, x] = [enrollment('y', 0), enrollment('x', 1)];
    const matches = [played(x, y, win(6, 0), { rule: FLAT_RULE }), played(y, x, win(6, 4), { rule: FLAT_RULE })];
    expect(ids(computeStandings(testScope([y, x], matches)))).toEqual([x.id, y.id]);
  });

  it('três empatadas: o confronto direto não entra, mesmo entre duas delas', () => {
    // Ciclo A > B > C > A. B venceu C, mas C fica à frente pelo saldo
    const [a, b, c] = [enrollment('a', 0), enrollment('b', 1), enrollment('c', 2)];
    const matches = [
      played(a, b, win(6, 0), { rule: FLAT_RULE }),
      played(b, c, win(6, 4), { rule: FLAT_RULE }),
      played(c, a, win(6, 4), { rule: FLAT_RULE }),
    ];
    const rows = computeStandings(testScope([a, b, c], matches));
    expect(rows.map((row) => [row.enrollment_id, row.games_balance])).toEqual([[a.id, 4], [c.id, 0], [b.id, -4]]);
  });

  it('vitórias vêm antes do saldo de games', () => {
    const [q, p] = [enrollment('q', 0), enrollment('p', 1)];
    const others = ['w1', 'w2', 'w3', 'w4', 'w5'].map((slug, order) => enrollment(slug, order + 2));
    const [w1, w2, w3, w4, w5] = others;
    const matches = [
      played(p, w1, win(6, 4), { rule: FLAT_RULE }),
      played(w2, p, win(6, 0), { rule: FLAT_RULE }),
      ...[w3, w4, w5].map((w) => played(w, q, win(7, 6), { rule: FLAT_RULE })),
    ];
    const [first, second] = computeStandings(testScope([q, p, ...others], matches));
    expect(first).toMatchObject({ enrollment_id: p.id, points: 150, wins: 1, games_balance: -4 });
    expect(second).toMatchObject({ enrollment_id: q.id, points: 150, wins: 0, games_balance: -3 });
  });

  it('empate em tudo: espera o admin, com ordem estável pela inscrição', () => {
    const [y, x, w1, w2] = [enrollment('y', 0), enrollment('x', 1), enrollment('w1', 2), enrollment('w2', 3)];
    const rows = computeStandings(testScope([x, y, w1, w2], [played(x, w1, win(6, 4)), played(y, w2, win(6, 4))]));
    expect(rows.map((row) => [row.enrollment_id, row.position, row.awaiting_admin])).toEqual([
      [y.id, 1, true],
      [x.id, 2, true],
      [w1.id, 3, true],
      [w2.id, 4, true],
    ]);
  });

  it('a encerrada continua na tabela, com os pontos congelados (R45)', () => {
    const { season, rankingCategories, mistaC40: mx } = mockEntities;
    const rows = computeStandings({ season_id: season.id, category_id: rankingCategories.mistaC40.id, ...mockDomain });
    expect(rows.find((row) => row.enrollment_id === mx.m4.id)).toMatchObject({ points: 88, enrollment_status: 'closed' });
  });
});
