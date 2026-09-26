import { describe, expect, it } from 'vitest';
import type { RankingMatch, ScheduleHistory, TournamentMatch } from '@/src/types/domain';
import { agreedScheduleOf, pendingProposalOf } from './history';
import {
  CONTEXT,
  EMPTY,
  MATCH,
  NOW,
  PLAYER,
  ROUND_DEADLINE,
  SAT,
  SUN,
  WED,
  act,
  expectRefusal,
  option,
  withPending,
} from './scheduleState.test-utils';
import {
  acceptScheduleOption,
  closeScheduleOnMatchExit,
  proposeSchedule,
  reportScheduleDate,
  withdrawScheduleProposal,
} from './transitions';

const LATER = '2026-09-04T09:00:00.000Z';
const AFTER_ALL_OPTIONS = '2026-09-07T12:00:00.000Z';
const FRI = '2026-09-11T19:00:00.000Z';

function propose(history: ScheduleHistory, id: string, playerId: string, at: string = LATER): ScheduleHistory {
  return proposeSchedule(history, { id, options: [option(WED), option(FRI)] }, act(playerId, at), CONTEXT);
}

describe('propor horários (M2, M5, M6)', () => {
  it('nasce pendente, do lado de quem enviou', () => {
    const [proposal] = withPending().proposals;
    expect(proposal).toEqual({
      id: 'proposal-1',
      match_id: MATCH.id,
      side: 'a',
      proposed_by: PLAYER.a1,
      created_at: NOW,
      options: [option(SAT), option(SUN, null)],
      status: 'pending',
    });
  });

  it('qualquer um dos 4 propõe; quem é de fora, não', () => {
    expect(propose(EMPTY, 'p', PLAYER.b2).proposals[0]?.side).toBe('b');
    expectRefusal(() => propose(EMPTY, 'p', PLAYER.outsider), 'not_allowed');
  });

  it('de 2 a 3 opções com horários distintos (M5)', () => {
    const draft = (starts: string[]) => ({ id: 'p', options: starts.map((start) => option(start)) });
    expect(proposeSchedule(EMPTY, draft([SAT, SUN, WED]), act(PLAYER.a1), CONTEXT).proposals).toHaveLength(1);
    expectRefusal(() => proposeSchedule(EMPTY, draft([SAT]), act(PLAYER.a1), CONTEXT), 'invalid_options');
    expectRefusal(() => proposeSchedule(EMPTY, draft([SAT, SUN, WED, LATER]), act(PLAYER.a1), CONTEXT), 'invalid_options');
    expectRefusal(() => proposeSchedule(EMPTY, draft([SAT, SAT]), act(PLAYER.a1), CONTEXT), 'invalid_options');
  });

  it('só horários futuros e antes do prazo da rodada, sem outra janela (M6, M19)', () => {
    const draft = (start: string) => ({ id: 'p', options: [option(SAT), option(start)] });
    expectRefusal(() => proposeSchedule(EMPTY, draft(NOW), act(PLAYER.a1), CONTEXT), 'invalid_options');
    expectRefusal(() => proposeSchedule(EMPTY, draft(ROUND_DEADLINE), act(PLAYER.a1), CONTEXT), 'invalid_options');
    expectRefusal(() => proposeSchedule(EMPTY, draft('não é data'), act(PLAYER.a1), CONTEXT), 'invalid_options');
    const lastMinute = '2026-09-15T23:00:00.000Z';
    const history = proposeSchedule(EMPTY, draft(lastMinute), act(PLAYER.a1), CONTEXT);
    expect(pendingProposalOf(history)?.options[1]?.starts_at).toBe(lastMinute);
  });

  it('a contraproposta do outro lado substitui a pendente: não existe "Recusar" vazio (M8, M9)', () => {
    const history = propose(withPending(), 'proposal-2', PLAYER.b1);
    expect(history.proposals).toMatchObject([
      { id: 'proposal-1', status: 'superseded', superseded_by: { kind: 'proposal', proposal_id: 'proposal-2' }, closed_at: LATER },
      { id: 'proposal-2', status: 'pending', side: 'b' },
    ]);
  });

  it('o próprio lado troca os horários, inclusive o parceiro de quem enviou (M10)', () => {
    const history = propose(withPending(), 'proposal-2', PLAYER.a2);
    expect(history.proposals.map((proposal) => proposal.status)).toEqual(['superseded', 'pending']);
  });

  it('proposta com todas as opções passadas expira antes da nova, datada na última opção (M12)', () => {
    const later = propose(withPending(), 'proposal-2', PLAYER.b1, AFTER_ALL_OPTIONS);
    expect(later.proposals[0]).toMatchObject({ status: 'expired', closed_at: SUN });
    expect(later.proposals[0]).not.toHaveProperty('superseded_by');
  });

  it('remarcar é propor de novo: a data acordada vale até a nova ser aceita (M13)', () => {
    const agreed = acceptScheduleOption(withPending(), 0, act(PLAYER.b1), CONTEXT);
    const rescheduled = propose(agreed, 'proposal-2', PLAYER.b2);
    expect(rescheduled.proposals.map((proposal) => proposal.status)).toEqual(['accepted', 'pending']);
    expect(agreedScheduleOf(rescheduled)?.starts_at).toBe(SAT);
    const accepted = acceptScheduleOption(rescheduled, 1, act(PLAYER.a2, LATER), CONTEXT);
    expect(agreedScheduleOf(accepted)?.starts_at).toBe(FRI);
    expect(accepted.proposals.map((proposal) => proposal.status)).toEqual(['accepted', 'accepted']);
  });
});

describe('aceitar uma opção (M3, M4, M11, M12)', () => {
  it('qualquer um do outro lado aceita, e a opção vira a data acordada', () => {
    const history = acceptScheduleOption(withPending(), 1, act(PLAYER.b2, LATER), CONTEXT);
    expect(history.proposals[0]).toMatchObject({
      status: 'accepted',
      accepted_option_index: 1,
      responded_by: PLAYER.b2,
      responded_at: LATER,
    });
    expect(agreedScheduleOf(history)).toEqual({
      starts_at: SUN,
      venue: null,
      agreed_at: LATER,
      source: { kind: 'proposal', proposal_id: 'proposal-1', accepted_by: PLAYER.b2 },
    });
  });

  it('vale o primeiro aceite: depois dele não há o que aceitar', () => {
    const accepted = acceptScheduleOption(withPending(), 0, act(PLAYER.b1), CONTEXT);
    expectRefusal(() => acceptScheduleOption(accepted, 1, act(PLAYER.b2), CONTEXT), 'no_pending_proposal');
  });

  it('quem propôs não aceita, nem o parceiro dele, nem quem é de fora (M4)', () => {
    expectRefusal(() => acceptScheduleOption(withPending(), 0, act(PLAYER.a1), CONTEXT), 'not_allowed');
    expectRefusal(() => acceptScheduleOption(withPending(), 0, act(PLAYER.a2), CONTEXT), 'not_allowed');
    expectRefusal(() => acceptScheduleOption(withPending(), 0, act(PLAYER.outsider), CONTEXT), 'not_allowed');
  });

  it('opção que passou não pode ser aceita; a outra ainda pode (M12)', () => {
    const betweenOptions = '2026-09-05T20:00:00.000Z';
    expectRefusal(() => acceptScheduleOption(withPending(), 0, act(PLAYER.b1, betweenOptions), CONTEXT), 'option_passed');
    expectRefusal(() => acceptScheduleOption(withPending(), 0, act(PLAYER.b1, SAT), CONTEXT), 'option_passed');
    const history = acceptScheduleOption(withPending(), 1, act(PLAYER.b1, betweenOptions), CONTEXT);
    expect(agreedScheduleOf(history)?.starts_at).toBe(SUN);
  });

  it('índice de opção inexistente é recusado', () => {
    expectRefusal(() => acceptScheduleOption(withPending(), 2, act(PLAYER.b1), CONTEXT), 'invalid_options');
    expectRefusal(() => acceptScheduleOption(withPending(), -1, act(PLAYER.b1), CONTEXT), 'invalid_options');
  });

  it('sem proposta pendente não há o que aceitar', () => {
    expectRefusal(() => acceptScheduleOption(EMPTY, 0, act(PLAYER.b1), CONTEXT), 'no_pending_proposal');
  });
});

describe('retirar a proposta (M10, M16)', () => {
  it('qualquer um do lado que propôs retira, e ela fica no histórico', () => {
    const history = withdrawScheduleProposal(withPending(), act(PLAYER.a2, LATER), CONTEXT);
    expect(history.proposals).toMatchObject([
      { id: 'proposal-1', status: 'withdrawn', withdrawal: { by: 'player', player_id: PLAYER.a2 }, closed_at: LATER },
    ]);
    expect(pendingProposalOf(history)).toBeNull();
  });

  it('o outro lado não retira: responde com outra proposta (M9)', () => {
    expectRefusal(() => withdrawScheduleProposal(withPending(), act(PLAYER.b1), CONTEXT), 'not_allowed');
    expectRefusal(() => withdrawScheduleProposal(withPending(), act(PLAYER.outsider), CONTEXT), 'not_allowed');
  });

  it('proposta expirada não é retirada (M12)', () => {
    expectRefusal(() => withdrawScheduleProposal(withPending(), act(PLAYER.a1, AFTER_ALL_OPTIONS), CONTEXT), 'no_pending_proposal');
  });
});

describe('informar a data combinada fora do app (M14, M15)', () => {
  const draft = { id: 'reported-1', starts_at: WED, venue: 'Arena Sunset' };

  it('qualquer jogador informa, sem aceite, e fica registrado quem e quando', () => {
    const history = reportScheduleDate(EMPTY, draft, act(PLAYER.b2, LATER), CONTEXT);
    expect(history.reported_dates).toEqual([
      { ...draft, match_id: MATCH.id, reported_by: PLAYER.b2, reported_at: LATER },
    ]);
    expect(agreedScheduleOf(history)?.source).toEqual({
      kind: 'reported_date',
      reported_date_id: 'reported-1',
      reported_by: PLAYER.b2,
    });
    expectRefusal(() => reportScheduleDate(EMPTY, draft, act(PLAYER.outsider), CONTEXT), 'not_allowed');
  });

  it('a data precisa ser uma data; o horário não é limitado', () => {
    const invalid = { ...draft, starts_at: 'sábado à tarde' };
    expectRefusal(() => reportScheduleDate(EMPTY, invalid, act(PLAYER.a1), CONTEXT), 'invalid_date');
  });

  it('encerra a proposta pendente como substituída pela data (M15)', () => {
    const history = reportScheduleDate(withPending(), draft, act(PLAYER.a1, LATER), CONTEXT);
    expect(history.proposals[0]).toMatchObject({
      status: 'superseded',
      superseded_by: { kind: 'reported_date', reported_date_id: 'reported-1' },
      closed_at: LATER,
    });
  });

  it('uma data nova substitui a anterior como data acordada, e as duas ficam no histórico', () => {
    const first = reportScheduleDate(EMPTY, draft, act(PLAYER.a1), CONTEXT);
    const second = reportScheduleDate(first, { id: 'reported-2', starts_at: SUN, venue: null }, act(PLAYER.b1, LATER), CONTEXT);
    expect(second.reported_dates).toHaveLength(2);
    expect(agreedScheduleOf(second)?.starts_at).toBe(SUN);
  });

  it('data informada depois de uma proposta aceita passa a valer (M14)', () => {
    const accepted = acceptScheduleOption(withPending(), 0, act(PLAYER.b1), CONTEXT);
    const history = reportScheduleDate(accepted, draft, act(PLAYER.a1, LATER), CONTEXT);
    expect(agreedScheduleOf(history)?.starts_at).toBe(WED);
  });
});

describe('só o confronto do ranking em "Confronto definido" aceita marcação (M1)', () => {
  const awaiting: RankingMatch = {
    ...MATCH,
    status: 'awaiting_confirmation',
    report: { result: { type: 'wo', winner: 'a' }, reported_by: PLAYER.a1, reported_at: NOW },
  };
  const frozen = { ...CONTEXT, match: awaiting };

  it.each([
    ['propor', () => proposeSchedule(EMPTY, { id: 'p', options: [option(SAT), option(SUN)] }, act(PLAYER.a1), frozen)],
    ['aceitar', () => acceptScheduleOption(withPending(), 0, act(PLAYER.b1), frozen)],
    ['retirar', () => withdrawScheduleProposal(withPending(), act(PLAYER.a1), frozen)],
    ['informar data', () => reportScheduleDate(EMPTY, { id: 'r', starts_at: SAT, venue: null }, act(PLAYER.a1), frozen)],
  ])('%s na partida congelada é recusado', (_action, action) => {
    expectRefusal(action, 'match_not_schedulable');
  });

  it('torneio não tem marcação: a programação é do organizador', () => {
    const tournamentMatch: TournamentMatch = {
      ...MATCH,
      kind: 'tournament',
      stage: null,
      status: 'defined',
    };
    const tournament = { ...CONTEXT, match: tournamentMatch };
    expectRefusal(() => withdrawScheduleProposal(withPending(), act(PLAYER.a1), tournament), 'match_not_schedulable');
  });

  it('o histórico precisa ser da mesma partida', () => {
    const other = { ...CONTEXT, match: { ...MATCH, id: 'match-other' } };
    const draft = { id: 'p', options: [option(SAT), option(SUN)] };
    expectRefusal(() => proposeSchedule(EMPTY, draft, act(PLAYER.a1), other), 'match_not_schedulable');
  });
});

describe('a partida sai de "Confronto definido"', () => {
  it('resultado lançado: a pendente é retirada pelo sistema, com o motivo', () => {
    const history = closeScheduleOnMatchExit(withPending(), 'result_reported', LATER);
    expect(history.proposals[0]).toMatchObject({
      status: 'withdrawn',
      withdrawal: { by: 'system', reason: 'result_reported' },
      closed_at: LATER,
    });
  });

  it('prazo da rodada: a pendente já expirou, porque toda opção é anterior ao prazo (M6, M12)', () => {
    const history = closeScheduleOnMatchExit(withPending(), 'round_deadline', '2026-09-16T00:00:00.000Z');
    expect(history.proposals[0]).toMatchObject({ status: 'expired', closed_at: SUN });
  });

  it('sem pendente, nada muda', () => {
    const accepted = acceptScheduleOption(withPending(), 0, act(PLAYER.b1), CONTEXT);
    expect(closeScheduleOnMatchExit(accepted, 'result_reported', LATER)).toEqual(accepted);
  });
});
