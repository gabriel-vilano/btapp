import { describe, expect, it } from 'vitest';
import type { SeasonFinal } from '@/src/types/domain';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { closeRound, cutoffLine, finalQualifiers } from './roundClose';
import { computeStandings } from './standings';
import { closed, enrollment, played, testRounds, testScope, win } from './standings.test-utils';

// Fechamento da rodada (docs/DOMAIN.md, R46) e linha de corte da final (R27,
// R28).

describe('closeRound (R46)', () => {
  const { season, rounds, rankingCategories } = mockEntities;
  const cases = [rounds.first, rounds.second].flatMap((round) =>
    Object.values(rankingCategories).map((category) => [round.id, category.id, round] as const),
  );

  it.each(cases)('%s / %s: reproduz a foto dos mocks', (roundId, categoryId, round) => {
    const expected = mockDomain.standingSnapshots.filter((s) => s.round_id === roundId && s.category_id === categoryId);
    const photo = closeRound(round, { season_id: season.id, category_id: categoryId, ...mockDomain });
    expect(photo).toEqual(expected);
  });

  it('a decisão do admin depois do prazo entra na rodada seguinte', () => {
    const [x, y] = [enrollment('x', 0), enrollment('y', 1)];
    const lateDecision = played(y, x, win(6, 4), { round: testRounds.first, confirmedAt: '2026-01-25T12:00:00Z' });
    const scope = testScope([x, y], [lateDecision]);
    expect(closeRound(testRounds.first, scope).map((s) => [s.enrollment_id, s.points])).toEqual([[x.id, 0], [y.id, 0]]);
    expect(closeRound(testRounds.second, scope).map((s) => [s.enrollment_id, s.points])).toEqual([[y.id, 104], [x.id, 46]]);
  });

  it('recusa rodada de outra temporada', () => {
    const otherRound = { ...testRounds.first, id: 'round-x', season_id: 'season-other' };
    expect(() => closeRound(otherRound, testScope([], []))).toThrow(/season-other/);
  });
});

describe('cutoffLine (R23, R28)', () => {
  it('a encerrada não tem vaga: ela passa para a próxima ativa (R45)', () => {
    const [a, b, c] = [enrollment('a', 0), enrollment('b', 1), enrollment('c', 2)];
    const closedA = closed(a, '2026-01-20T00:00:00Z');
    const matches = [played(a, b, win(6, 0)), played(a, c, win(6, 0)), played(b, c, win(6, 4))];
    const rows = computeStandings(testScope([closedA, b, c], matches));
    expect(rows[0].enrollment_id).toBe(a.id);
    expect(cutoffLine(rows, 2)).toEqual({ qualified_ids: [b.id, c.id], awaiting_admin: false });
  });

  it('empate sem desempate atravessando a linha: a vaga espera o admin', () => {
    const [x, y, w1, w2] = [enrollment('x', 0), enrollment('y', 1), enrollment('w1', 2), enrollment('w2', 3)];
    const rows = computeStandings(testScope([x, y, w1, w2], [played(x, w1, win(6, 4)), played(y, w2, win(6, 4))]));
    expect(cutoffLine(rows, 1)).toEqual({ qualified_ids: [x.id], awaiting_admin: true });
    expect(cutoffLine(rows, 2)).toEqual({ qualified_ids: [x.id, y.id], awaiting_admin: false });
  });

  it('com menos inscrições ativas que vagas, todas se classificam', () => {
    const [x, y] = [enrollment('x', 0), enrollment('y', 1)];
    const rows = computeStandings(testScope([x, y], [played(x, y, win(6, 4))]));
    expect(cutoffLine(rows, 4)).toEqual({ qualified_ids: [x.id, y.id], awaiting_admin: false });
  });
});

describe('finalQualifiers (R27, R28)', () => {
  it('a posição na data de corte define a vaga, não o que vem depois', () => {
    const [x, y, w] = [enrollment('x', 0), enrollment('y', 1), enrollment('w', 2)];
    const final: SeasonFinal = { name: 'Saideira', qualifiers: 1, cutoff_date: '2026-02-01T00:00:00Z', tournament_id: null };
    const matches = [
      played(x, y, win(6, 4), { confirmedAt: '2026-01-10T00:00:00Z' }),
      played(y, x, win(6, 0), { round: testRounds.second, confirmedAt: '2026-02-05T00:00:00Z' }),
      played(y, w, win(6, 0), { round: testRounds.second, confirmedAt: '2026-02-06T00:00:00Z' }),
    ];
    const scope = testScope([x, y, w], matches);
    expect(computeStandings(scope)[0].enrollment_id).toBe(y.id);
    expect(finalQualifiers(final, scope)).toEqual({ qualified_ids: [x.id], awaiting_admin: false });
  });

  it('mocks: a Saideira leva as 4 primeiras ativas; a M4 encerrada fica de fora', () => {
    const { season, rankingCategories, mistaC40: mx } = mockEntities;
    const scope = { season_id: season.id, category_id: rankingCategories.mistaC40.id, ...mockDomain };
    const cutoff = cutoffLine(computeStandings(scope), season.final?.qualifiers ?? 0);
    expect(cutoff.qualified_ids).toEqual([mx.m3.id, mx.m1.id, mx.m2.id, mx.m5.id]);
  });
});
