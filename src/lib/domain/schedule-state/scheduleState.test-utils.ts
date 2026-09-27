import { expect } from 'vitest';
import type { RankingMatch, ScheduleHistory, ScheduleOption } from '@/src/types/domain';
import type { ScheduleActor, ScheduleContext, ScheduleSides } from './guards';
import { ScheduleError, type ScheduleErrorCode } from './scheduleError';
import { proposeSchedule } from './transitions';

// Confronto mínimo para os testes da marcação. Duplas A1+A2 × B1+B2 e um
// jogador de fora. As opções ficam entre o sorteio e o prazo da rodada.

export const PLAYER = { a1: 'p-a1', a2: 'p-a2', b1: 'p-b1', b2: 'p-b2', outsider: 'p-outsider' };

export const SIDES: ScheduleSides = { a: [PLAYER.a1, PLAYER.a2], b: [PLAYER.b1, PLAYER.b2] };

export const DRAW_AT = '2026-09-01T12:00:00.000Z';
export const NOW = '2026-09-03T12:00:00.000Z';
export const ROUND_DEADLINE = '2026-09-15T23:59:00.000Z';

export const SAT = '2026-09-05T14:00:00.000Z';
export const SUN = '2026-09-06T10:00:00.000Z';
export const WED = '2026-09-09T19:00:00.000Z';

export const MATCH: RankingMatch = {
  id: 'match-test',
  kind: 'ranking',
  round_id: 'round-test',
  competition_id: 'competition-test',
  category_id: 'category-test',
  side_a_enrollment_id: 'enrollment-a',
  side_b_enrollment_id: 'enrollment-b',
  format: 'one_set_of_6',
  scheduled_at: null,
  venue: null,
  created_at: DRAW_AT,
  status: 'defined',
};

export const CONTEXT: ScheduleContext = { match: MATCH, sides: SIDES, roundDeadline: ROUND_DEADLINE };

export const EMPTY: ScheduleHistory = { match_id: MATCH.id, proposals: [], reported_dates: [] };

export function act(playerId: string, at: string = NOW): ScheduleActor {
  return { playerId, at };
}

export function option(startsAt: string, venue: string | null = 'Arena Sunset'): ScheduleOption {
  return { starts_at: startsAt, venue };
}

/** Histórico com uma proposta pendente do lado A (A1): sábado e domingo. */
export function withPending(at: string = NOW): ScheduleHistory {
  return proposeSchedule(EMPTY, { id: 'proposal-1', options: [option(SAT), option(SUN, null)] }, act(PLAYER.a1, at), CONTEXT);
}

export function expectRefusal(action: () => unknown, code: ScheduleErrorCode): void {
  let caught: unknown = null;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(ScheduleError);
  expect((caught as ScheduleError).code).toBe(code);
}
