import { describe, expect, it } from 'vitest';
import { agreedDates, scheduleHistoryOf } from '@/src/mocks/domain/scheduling';
import { agreedScheduleOf, expireProposals, isOptionOpen, pendingProposalOf } from './history';
import { EMPTY, NOW, SAT, SUN, option, withPending } from './scheduleState.test-utils';

const matchId = (slug: string): string => `match-arena-rm-mb-${slug}`;

describe('expirar a proposta (M12)', () => {
  it('pendente com alguma opção aberta continua pendente', () => {
    const history = withPending();
    expect(expireProposals(history, '2026-09-05T20:00:00.000Z')).toBe(history);
  });

  it('todas as opções passaram: expira no horário da última, não na hora em que rodou', () => {
    const history = expireProposals(withPending(), '2026-09-20T00:00:00.000Z');
    expect(history.proposals[0]).toEqual({ ...withPending().proposals[0], status: 'expired', closed_at: SUN });
    expect(pendingProposalOf(history)).toBeNull();
  });

  it('no horário exato da opção ela já não aceita', () => {
    expect(isOptionOpen(option(SAT), NOW)).toBe(true);
    expect(isOptionOpen(option(SAT), SAT)).toBe(false);
  });

  it('sem pendente, nada muda', () => {
    expect(expireProposals(EMPTY, NOW)).toBe(EMPTY);
  });
});

describe('data acordada (M11, M13, M14)', () => {
  it('sem aceite nem data informada, não há data', () => {
    expect(agreedScheduleOf(EMPTY)).toBeNull();
    expect(agreedScheduleOf(withPending())).toBeNull();
  });

  // Os mocks da marcação contam uma história por confronto; a data acordada
  // derivada do histórico tem de bater com a `scheduled_at` de cada partida.
  it.each([
    ['r3-2', agreedDates.r3_2, 'proposal'], // proposta aceita
    ['r3-3', agreedDates.r3_3, 'proposal'], // aceita + remarcação pendente: vale a aceita
    ['r3-4', agreedDates.r3_4, 'proposal'], // aceita + remarcação retirada pelo sistema
    ['r3-5', agreedDates.r3_5, 'reported_date'], // data informada substituiu a proposta
  ] as const)('mocks: %s tem data acordada vinda de %s', (slug, startsAt, kind) => {
    const agreed = agreedScheduleOf(scheduleHistoryOf(matchId(slug)));
    expect(agreed?.starts_at).toBe(startsAt);
    expect(agreed?.source.kind).toBe(kind);
  });

  it.each(['r2-4', 'r3-1'])('mocks: %s não tem data acordada', (slug) => {
    expect(agreedScheduleOf(scheduleHistoryOf(matchId(slug)))).toBeNull();
  });

  it('a pendente é a da remarcação da r3-3', () => {
    expect(pendingProposalOf(scheduleHistoryOf(matchId('r3-3')))?.id).toBe('proposal-mb-r3-3-2');
  });
});
