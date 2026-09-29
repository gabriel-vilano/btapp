import { describe, expect, it } from 'vitest';
import { FLAT_RULE, closed, enrollment, played, testRounds, win } from '../standings.test-utils';
import { actorsFor, testSeason } from './feedEvents.test-utils';
import { qualificationEvents } from './finalQualification';

const [t1, t2, t3, t4] = ['t1', 't2', 't3', 't4'].map((slug, i) => enrollment(slug, i));
const rounds = Object.values(testRounds);
const CUTOFF = testRounds.second.deadline;
const AFTER = '2026-02-12T12:00:00Z';

// T1 vence duas, T2 vence uma; T4 perde de 6/0 e fica atrás do T3: T1 > T2 > T3 > T4
const matches = [
  played(t1, t2, win(6, 4)),
  played(t2, t3, win(6, 4)),
  played(t1, t4, win(6, 0)),
];

function events(enrollments = [t1, t2, t3, t4], qualifiers = 2, now = AFTER) {
  return qualificationEvents(testSeason(qualifiers, CUTOFF), { enrollments, matches, rounds }, actorsFor(enrollments), now);
}

describe('qualificationEvents (R28)', () => {
  it('depois da data de corte, os classificados ganham o evento público', () => {
    const result = events();
    expect(result.map((event) => event.enrollment_id)).toEqual([t1.id, t2.id]);
    expect(result[0]).toMatchObject({ type: 'final_qualification', visibility: 'public', created_at: CUTOFF, actor_ids: ['t1-1', 't1-2'] });
  });

  it('antes da data de corte não existe (R23)', () => {
    expect(events(undefined, 2, '2026-02-01T00:00:00Z')).toEqual([]);
  });

  it('temporada sem final não tem classificação', () => {
    const season = { ...testSeason(2), final: null };
    expect(qualificationEvents(season, { enrollments: [t1], matches, rounds }, actorsFor([t1]), AFTER)).toEqual([]);
  });

  it('inscrição encerrada não tem direito à vaga, que passa para a próxima (R45)', () => {
    const t2Closed = closed(t2, '2026-01-25T00:00:00Z');
    const result = events([t1, t2Closed, t3, t4]);
    expect(result.map((event) => event.enrollment_id)).toEqual([t1.id, t3.id]);
  });

  it('empate total na linha de corte: o evento dos empatados espera o admin (R37)', () => {
    // Com vitória 100 e derrota 50 sem games: T1 200; T2, T3, T4 e T5 100. T2 e T3
    // empatam em tudo (1 vitória, +6 de saldo) e disputam a 2ª vaga
    const t5 = enrollment('t5', 5);
    const flat = (a: typeof t1, b: typeof t1) => played(a, b, win(6, 0), { rule: FLAT_RULE });
    const tied = [flat(t1, t4), flat(t1, t4), flat(t2, t5), flat(t3, t5)];
    const enrollments = [t1, t2, t3, t4, t5];
    const result = qualificationEvents(testSeason(2, CUTOFF), { enrollments, matches: tied, rounds }, actorsFor(enrollments), AFTER);
    expect(result.map((event) => event.enrollment_id)).toEqual([t1.id]);
  });
});
