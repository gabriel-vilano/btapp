import { describe, expect, it } from 'vitest';
import type { RankingMatch, ScheduleHistory } from '@/src/types/domain';
import {
  CONTEXT,
  EMPTY,
  MATCH,
  NOW,
  PLAYER,
  SAT,
  SIDES,
  act,
  option,
  withPending,
} from './scheduleState.test-utils';
import { acceptScheduleOption, proposeSchedule, reportScheduleDate } from './transitions';
import { scheduleViewOf } from './scheduleView';

const AFTER_SAT = '2026-09-05T18:00:00.000Z';
const AFTER_ALL_OPTIONS = '2026-09-07T12:00:00.000Z';
const WED = '2026-09-09T19:00:00.000Z';
const FRI = '2026-09-11T19:00:00.000Z';

function viewOf(history: ScheduleHistory, viewerId: string, now: string = NOW, match: RankingMatch = MATCH) {
  return scheduleViewOf({ history, match, sides: SIDES, viewerId, now });
}

function agreedOnSat(): ScheduleHistory {
  return acceptScheduleOption(withPending(), 0, act(PLAYER.b1), CONTEXT);
}

describe('estado da marcação para quem vê o confronto (SCHEDULING.md §6)', () => {
  it('sem proposta nem data, é "sem data" para os dois lados', () => {
    expect(viewOf(EMPTY, PLAYER.a1).kind).toBe('no_date');
    expect(viewOf(EMPTY, PLAYER.b2).kind).toBe('no_date');
  });

  it('a proposta pendente aguarda o outro lado e é a vez de quem não propôs', () => {
    const history = withPending();
    expect(viewOf(history, PLAYER.a1).kind).toBe('awaiting_other_side');
    // O parceiro de quem enviou também espera: a proposta é do lado (M2, M4)
    expect(viewOf(history, PLAYER.a2).kind).toBe('awaiting_other_side');
    const view = viewOf(history, PLAYER.b1);
    expect(view).toEqual({ kind: 'awaiting_you', proposal: history.proposals[0], agreed: null });
  });

  it('com data acordada no futuro, é "data acordada"', () => {
    const view = viewOf(agreedOnSat(), PLAYER.a1);
    expect(view.kind).toBe('agreed');
    expect(view.kind === 'agreed' && view.agreed.starts_at).toBe(SAT);
  });

  it('a data informada fora do app também vale como data acordada (M14)', () => {
    const history = reportScheduleDate(EMPTY, { id: 'rd-1', starts_at: SAT, venue: null }, act(PLAYER.b2), CONTEXT);
    const view = viewOf(history, PLAYER.a1);
    expect(view.kind === 'agreed' && view.agreed.source.kind).toBe('reported_date');
  });

  it('depois da data acordada, sem resultado, é "data passou"', () => {
    expect(viewOf(agreedOnSat(), PLAYER.b1, AFTER_SAT).kind).toBe('date_passed');
  });

  it('a remarcação do outro lado é a vez de quem vê, e a data acordada continua valendo (M13)', () => {
    const reschedule = proposeSchedule(
      agreedOnSat(),
      { id: 'proposal-2', options: [option(WED), option(FRI)] },
      act(PLAYER.b2),
      CONTEXT,
    );
    const view = viewOf(reschedule, PLAYER.a2);
    expect(view.kind).toBe('awaiting_you');
    expect(view.kind === 'awaiting_you' && view.agreed?.starts_at).toBe(SAT);
    expect(viewOf(reschedule, PLAYER.b1).kind).toBe('awaiting_other_side');
  });

  it('a proposta cujas opções passaram já conta como expirada, e o confronto volta a "sem data" (M12)', () => {
    expect(viewOf(withPending(), PLAYER.b1, AFTER_ALL_OPTIONS).kind).toBe('no_date');
  });

  it('fora de "Confronto definido", a marcação congela como leitura (M1)', () => {
    const notPlayed: RankingMatch = { ...MATCH, status: 'not_played' };
    expect(viewOf(agreedOnSat(), PLAYER.a1, AFTER_SAT, notPlayed)).toMatchObject({ kind: 'frozen' });
  });

  it('quem não é do confronto vê só a data acordada, sem propostas (M18)', () => {
    expect(viewOf(withPending(), PLAYER.outsider)).toEqual({ kind: 'public', agreed: null });
    const view = viewOf(agreedOnSat(), PLAYER.outsider);
    expect(view.kind === 'public' && view.agreed?.starts_at).toBe(SAT);
  });

  it('com a marcação congelada, quem não é do confronto vê o registro, não "sem data" (M1, M18)', () => {
    const notPlayed: RankingMatch = { ...MATCH, status: 'not_played' };
    expect(viewOf(withPending(), PLAYER.outsider, NOW, notPlayed)).toEqual({ kind: 'public_frozen', agreed: null });
    const view = viewOf(agreedOnSat(), PLAYER.outsider, AFTER_SAT, notPlayed);
    expect(view.kind === 'public_frozen' && view.agreed?.starts_at).toBe(SAT);
  });
});
