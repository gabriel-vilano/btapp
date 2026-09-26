import { describe, expect, it } from 'vitest';
import type { FriendlyMatch, RetiredResult } from '@/src/types/domain';
import { cancelFriendly, confirmFriendly, contestFriendly, reportFriendly } from './friendlyTransitions';
import { PLAYER, REPORTED_AT, SIDES, WIN_A, act, expectRefusal, pendingFriendly } from './matchState.test-utils';

const draft = {
  id: 'friendly-test',
  side_a_unit_id: 'unit-a',
  side_b_unit_id: 'unit-b',
  format: 'one_set_of_6' as const,
  played_at: '2026-09-10T18:00:00.000Z',
  venue: null,
};

const MONTHS_LATER = '2027-01-10T12:00:00.000Z';

describe('lançar o amistoso (R42, R43)', () => {
  it('nasce pendente, com o lançamento de quem registrou', () => {
    expect(reportFriendly(draft, WIN_A, act(PLAYER.b2), SIDES)).toEqual({
      ...draft,
      kind: 'friendly',
      created_at: REPORTED_AT,
      report: { result: WIN_A, reported_by: PLAYER.b2, reported_at: REPORTED_AT },
      status: 'awaiting_confirmation',
    });
  });

  it('quem não joga não lança', () => {
    expectRefusal(() => reportFriendly(draft, WIN_A, act(PLAYER.outsider), SIDES), 'not_allowed');
  });

  it('desistência: quem lança é o adversário de quem desistiu (R11)', () => {
    const retiredWinB: RetiredResult = {
      type: 'retired',
      winner: 'b',
      sets: [{ games_a: 2, games_b: 3, super_tiebreak: false, interrupted: true }],
    };
    expect(reportFriendly(draft, retiredWinB, act(PLAYER.b1), SIDES).status).toBe('awaiting_confirmation');
    expectRefusal(() => reportFriendly(draft, retiredWinB, act(PLAYER.a1), SIDES), 'invalid_result');
  });
});

describe('responder ao amistoso (R43)', () => {
  it('o outro lado confirma, mesmo meses depois: não há prazo', () => {
    const match = confirmFriendly(pendingFriendly(), act(PLAYER.b1, MONTHS_LATER), SIDES);
    expect(match).toEqual({
      ...pendingFriendly(),
      status: 'confirmed',
      response: { responded_by: PLAYER.b1, responded_at: MONTHS_LATER },
    });
  });

  it('o outro lado contesta, e o resultado é descartado', () => {
    const match = contestFriendly(pendingFriendly(), act(PLAYER.b2), SIDES);
    expect(match).toEqual({
      ...pendingFriendly(),
      status: 'discarded',
      response: { responded_by: PLAYER.b2, responded_at: REPORTED_AT },
    });
  });

  it.each([PLAYER.a1, PLAYER.a2, PLAYER.outsider])('quem lançou, o parceiro e quem está de fora não respondem: %s', (playerId) => {
    expectRefusal(() => confirmFriendly(pendingFriendly(), act(playerId), SIDES), 'not_allowed');
    expectRefusal(() => contestFriendly(pendingFriendly(), act(playerId), SIDES), 'not_allowed');
  });
});

describe('cancelar o amistoso pendente (R43)', () => {
  it('quem lançou cancela', () => {
    const match = cancelFriendly(pendingFriendly(), act(PLAYER.a1, MONTHS_LATER));
    expect(match).toEqual({ ...pendingFriendly(), status: 'cancelled', cancelled_at: MONTHS_LATER });
  });

  it.each([PLAYER.a2, PLAYER.b1, PLAYER.outsider])('ninguém mais cancela, nem o parceiro: %s', (playerId) => {
    expectRefusal(() => cancelFriendly(pendingFriendly(), act(playerId)), 'not_allowed');
  });
});

describe('máquina de estados do amistoso', () => {
  const finalStates: [string, () => FriendlyMatch][] = [
    ['confirmed', () => confirmFriendly(pendingFriendly(), act(PLAYER.b1), SIDES)],
    ['discarded', () => contestFriendly(pendingFriendly(), act(PLAYER.b1), SIDES)],
    ['cancelled', () => cancelFriendly(pendingFriendly(), act(PLAYER.a1))],
  ];

  it.each(finalStates)('%s é final: nenhuma ação sai dele', (_status, build) => {
    const match = build();
    expectRefusal(() => confirmFriendly(match, act(PLAYER.b1), SIDES), 'invalid_status');
    expectRefusal(() => contestFriendly(match, act(PLAYER.b1), SIDES), 'invalid_status');
    expectRefusal(() => cancelFriendly(match, act(PLAYER.a1)), 'invalid_status');
  });
});
