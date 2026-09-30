import { describe, expect, it } from 'vitest';
import { players as p } from '@/src/mocks/domain/people';
import { scheduleHistoryOf } from '@/src/mocks/domain/scheduling';
import type { ScheduleSides } from './guards';
import { scheduleSummaryOf } from './summary';
import { acceptScheduleOption, proposeSchedule, reportScheduleDate } from './transitions';
import { expireProposals } from './history';
import { CONTEXT, EMPTY, NOW, PLAYER, SAT, SIDES, SUN, WED, act, option, withPending } from './scheduleState.test-utils';

const matchId = (slug: string): string => `match-arena-mangaba-mb-${slug}`;

const MB_SIDES = {
  r2_4: { a: [p.pedro.id, p.thiago.id], b: [p.caio.id, p.diego.id] },
  r3_5: { a: [p.andre.id, p.bruno.id], b: [p.caio.id, p.diego.id] },
} satisfies Record<string, ScheduleSides>;

describe('resumo da marcação por lado (M17)', () => {
  it('histórico vazio: tudo zerado e sem data', () => {
    const summary = scheduleSummaryOf(EMPTY, SIDES);
    expect(summary.a).toEqual({
      side: 'a',
      proposalCount: 0,
      offeredTimeCount: 0,
      offeredDayCount: 0,
      unansweredCount: 0,
      acceptedCount: 0,
      reportedDateCount: 0,
      firstProposedAt: null,
      lastProposedAt: null,
    });
    expect(summary.agreed).toBeNull();
  });

  it('não realizada do mock: a T2 propôs duas vezes, 5 horários, e a T4 nunca respondeu', () => {
    const summary = scheduleSummaryOf(scheduleHistoryOf(matchId('r2-4')), MB_SIDES.r2_4);
    const [first, second] = scheduleHistoryOf(matchId('r2-4')).proposals;
    expect(summary.a).toMatchObject({
      proposalCount: 2,
      offeredTimeCount: 5,
      unansweredCount: 2,
      firstProposedAt: first.created_at,
      lastProposedAt: second.created_at,
    });
    expect(summary.b).toMatchObject({ proposalCount: 0, offeredTimeCount: 0, acceptedCount: 0 });
    expect(summary.agreed).toBeNull();
  });

  it('o mesmo horário repetido em duas propostas conta uma vez', () => {
    const later = '2026-09-04T12:00:00.000Z';
    const history = proposeSchedule(withPending(), { id: 'proposal-2', options: [option(SAT), option(WED)] }, act(PLAYER.a2, later), CONTEXT);
    const summary = scheduleSummaryOf(history, SIDES);
    expect(summary.a).toMatchObject({ proposalCount: 2, offeredTimeCount: 3, firstProposedAt: NOW, lastProposedAt: later });
  });

  it('contraproposta conta para o lado que contrapropôs, e a substituída não fica sem resposta', () => {
    const history = proposeSchedule(withPending(), { id: 'proposal-2', options: [option(WED), option(SUN)] }, act(PLAYER.b1), CONTEXT);
    const summary = scheduleSummaryOf(history, SIDES);
    expect(summary.a).toMatchObject({ proposalCount: 1, offeredTimeCount: 2, unansweredCount: 0 });
    expect(summary.b).toMatchObject({ proposalCount: 1, offeredTimeCount: 2, unansweredCount: 0 });
  });

  it('só a proposta expirada conta como sem resposta (M12)', () => {
    const summary = scheduleSummaryOf(expireProposals(withPending(), '2026-09-20T00:00:00.000Z'), SIDES);
    expect(summary.a.unansweredCount).toBe(1);
  });

  it('aceite conta para o lado que aceitou e vira a data acordada', () => {
    const history = acceptScheduleOption(withPending(), 0, act(PLAYER.b2), CONTEXT);
    const summary = scheduleSummaryOf(history, SIDES);
    expect(summary.b.acceptedCount).toBe(1);
    expect(summary.a.acceptedCount).toBe(0);
    expect(summary.agreed).toMatchObject({ starts_at: SAT, source: { kind: 'proposal', accepted_by: PLAYER.b2 } });
  });

  it('data informada conta para o lado de quem informou, sem aceite do outro (M14)', () => {
    const history = reportScheduleDate(withPending(), { id: 'reported-1', starts_at: WED, venue: null }, act(PLAYER.b1), CONTEXT);
    const summary = scheduleSummaryOf(history, SIDES);
    expect(summary.b.reportedDateCount).toBe(1);
    expect(summary.a.reportedDateCount).toBe(0);
    expect(summary.agreed).toMatchObject({ starts_at: WED, source: { kind: 'reported_date', reported_by: PLAYER.b1 } });
  });

  it('mock da r3-5: o Diego informou a data, e a proposta do André ficou substituída', () => {
    const summary = scheduleSummaryOf(scheduleHistoryOf(matchId('r3-5')), MB_SIDES.r3_5);
    expect(summary.a).toMatchObject({ proposalCount: 1, offeredTimeCount: 3, unansweredCount: 0 });
    expect(summary.b).toMatchObject({ proposalCount: 0, reportedDateCount: 1 });
    expect(summary.agreed?.source).toMatchObject({ kind: 'reported_date', reported_by: p.diego.id });
  });
});

describe('horários em quantos dias (M17)', () => {
  const proposeA = (startsAt: readonly string[]) =>
    proposeSchedule(EMPTY, { id: 'proposal-days', options: startsAt.map((start) => option(start)) }, act(PLAYER.a1), CONTEXT);

  it('3 horários no mesmo dia contam 3 horários em 1 dia', () => {
    // sáb 05/09 às 9h, 12h e 18h em Brasília
    const history = proposeA(['2026-09-05T12:00:00.000Z', '2026-09-05T15:00:00.000Z', '2026-09-05T21:00:00.000Z']);
    expect(scheduleSummaryOf(history, SIDES).a).toMatchObject({ offeredTimeCount: 3, offeredDayCount: 1 });
  });

  it('horários em dias diferentes contam um dia cada', () => {
    const history = proposeA([SAT, SUN, WED]);
    expect(scheduleSummaryOf(history, SIDES).a).toMatchObject({ offeredTimeCount: 3, offeredDayCount: 3 });
  });

  it('o dia é o de Brasília: 22h de sábado não vira domingo, como seria em UTC', () => {
    // sáb 05/09 às 11h e às 22h em Brasília; o segundo já é 06/09 em UTC
    const history = proposeA([SAT, '2026-09-06T01:00:00.000Z']);
    expect(scheduleSummaryOf(history, SIDES).a).toMatchObject({ offeredTimeCount: 2, offeredDayCount: 1 });
  });

  it('23h59 e 0h em Brasília ficam em dias diferentes', () => {
    const history = proposeA(['2026-09-06T02:59:00.000Z', '2026-09-06T03:00:00.000Z']);
    expect(scheduleSummaryOf(history, SIDES).a).toMatchObject({ offeredTimeCount: 2, offeredDayCount: 2 });
  });

  it('mock da r2-4: 5 horários da T2 em 5 dias', () => {
    const summary = scheduleSummaryOf(scheduleHistoryOf(matchId('r2-4')), MB_SIDES.r2_4);
    expect(summary.a).toMatchObject({ offeredTimeCount: 5, offeredDayCount: 5 });
  });
});
