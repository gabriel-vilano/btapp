import { describe, expect, it } from 'vitest';
import type {
  FriendlyMatch,
  PendingScheduleProposal,
  RankingMatch,
  ReportedScheduleDate,
  ScheduleHistory,
  TournamentMatch,
} from '@/src/types/domain';
import {
  definedRankingMatch,
  definedTournamentMatch,
  PLAYER,
  REPORTED_AT,
  RESPONSE_DEADLINE,
  ROUND_DEADLINE,
  SIDES,
  WIN_A,
} from '../match-state/matchState.test-utils';
import {
  friendlyAgendaEntry,
  rankingAgendaEntry,
  tournamentAgendaEntry,
  type RankingEntryContext,
} from './agendaEntry';

// Tabela 5.2 da docs/NAVIGATION.md, linha a linha, do ponto de vista do lado `a`.

const NOW = '2026-09-08T12:00:00.000Z'; // antes do prazo da rodada (15/09)
const FUTURE = '2026-09-12T17:00:00.000Z';
const PAST = '2026-09-07T17:00:00.000Z';

const emptyHistory: ScheduleHistory = { match_id: 'match-test', proposals: [], reported_dates: [] };

function ctx(overrides: Partial<RankingEntryContext> = {}): RankingEntryContext {
  return {
    viewerSide: 'a',
    sides: SIDES,
    roundDeadline: ROUND_DEADLINE,
    responseDeadlineHours: 48,
    history: emptyHistory,
    now: NOW,
    ...overrides,
  };
}

function unscheduled(): RankingMatch {
  return { ...definedRankingMatch(), scheduled_at: null };
}

function pendingProposal(side: 'a' | 'b', startsAt: string[] = [FUTURE, '2026-09-13T17:00:00.000Z']): PendingScheduleProposal {
  const options = startsAt.map((iso) => ({ starts_at: iso, venue: null }));
  return {
    id: `proposal-${side}`,
    match_id: 'match-test',
    side,
    proposed_by: side === 'a' ? PLAYER.a1 : PLAYER.b1,
    created_at: '2026-09-05T12:00:00.000Z',
    options: options as PendingScheduleProposal['options'],
    status: 'pending',
  };
}

function reportedDate(startsAt: string): ReportedScheduleDate {
  return {
    id: 'reported-1',
    match_id: 'match-test',
    reported_by: PLAYER.b2,
    reported_at: '2026-09-06T12:00:00.000Z',
    starts_at: startsAt,
    venue: 'Arena Sunset',
  };
}

function withHistory(proposals: PendingScheduleProposal[], reported: ReportedScheduleDate[] = []): ScheduleHistory {
  return { match_id: 'match-test', proposals, reported_dates: reported };
}

function awaiting(reportedBy: string): RankingMatch {
  return {
    ...definedRankingMatch(),
    status: 'awaiting_confirmation',
    report: { result: WIN_A, reported_by: reportedBy, reported_at: REPORTED_AT },
  };
}

describe('rankingAgendaEntry: confronto definido', () => {
  it('sem data e sem proposta: "Sua vez", marcar jogo até o fim da rodada', () => {
    const result = rankingAgendaEntry(unscheduled(), ctx());
    expect(result?.section).toBe('your_turn');
    expect(result?.situation).toEqual({ kind: 'schedule_match', deadline: ROUND_DEADLINE });
  });

  it('proposta do outro lado pendente: "Sua vez", responder, contando só as opções abertas', () => {
    const proposal = pendingProposal('b', [PAST, FUTURE, '2026-09-13T17:00:00.000Z']);
    const result = rankingAgendaEntry(unscheduled(), ctx({ history: withHistory([proposal]) }));
    expect(result?.section).toBe('your_turn');
    expect(result?.situation).toEqual({ kind: 'answer_proposal', openOptionCount: 2, deadline: ROUND_DEADLINE });
  });

  it('proposta do próprio lado pendente: "Aguardando"', () => {
    const result = rankingAgendaEntry(unscheduled(), ctx({ history: withHistory([pendingProposal('a')]) }));
    expect(result?.section).toBe('waiting');
    expect(result?.situation.kind).toBe('proposal_sent');
  });

  it('proposta com todas as opções já passadas conta como expirada: volta a marcar (M12)', () => {
    const expired = pendingProposal('b', [PAST, '2026-09-07T20:00:00.000Z']);
    const result = rankingAgendaEntry(unscheduled(), ctx({ history: withHistory([expired]) }));
    expect(result?.situation.kind).toBe('schedule_match');
  });

  it('data acordada no futuro: "Próximos jogos", com a data e a arena do histórico', () => {
    const history = withHistory([], [reportedDate(FUTURE)]);
    const result = rankingAgendaEntry(unscheduled(), ctx({ history }));
    expect(result?.section).toBe('upcoming');
    expect(result?.situation).toEqual({ kind: 'scheduled', startsAt: FUTURE, venue: 'Arena Sunset' });
  });

  it('sem histórico, usa a data gravada na partida', () => {
    const match = { ...definedRankingMatch(), scheduled_at: FUTURE };
    expect(rankingAgendaEntry(match, ctx())?.situation).toEqual({
      kind: 'scheduled',
      startsAt: FUTURE,
      venue: 'Arena Teste',
    });
  });

  it('data acordada já passou: "Sua vez", lançar resultado', () => {
    const match = { ...definedRankingMatch(), scheduled_at: PAST };
    const result = rankingAgendaEntry(match, ctx());
    expect(result?.section).toBe('your_turn');
    expect(result?.situation).toEqual({ kind: 'report_result', deadline: ROUND_DEADLINE });
  });

  it('jogo marcado com remarcação do outro lado pendente vai para "Sua vez", não para "Próximos" (N13)', () => {
    const match = { ...definedRankingMatch(), scheduled_at: '2026-09-14T17:00:00.000Z' };
    const result = rankingAgendaEntry(match, ctx({ history: withHistory([pendingProposal('b')]) }));
    expect(result?.section).toBe('your_turn');
    expect(result?.situation.kind).toBe('answer_proposal');
  });

  it('jogo marcado com remarcação do próprio lado pendente fica em "Próximos jogos" (N13)', () => {
    const match = { ...definedRankingMatch(), scheduled_at: '2026-09-14T17:00:00.000Z' };
    const result = rankingAgendaEntry(match, ctx({ history: withHistory([pendingProposal('a')]) }));
    expect(result?.section).toBe('upcoming');
  });

  it('a rodada fechou sem resultado: "Com o admin", mesmo antes da rotina mover a partida (R40)', () => {
    const result = rankingAgendaEntry(unscheduled(), ctx({ now: '2026-09-16T00:00:00.000Z' }));
    expect(result?.section).toBe('waiting');
    expect(result?.situation.kind).toBe('with_admin');
  });
});

describe('rankingAgendaEntry: depois do lançamento', () => {
  it('lançado pelo outro lado: "Sua vez", confirmar até o prazo de resposta (R14)', () => {
    const result = rankingAgendaEntry(awaiting(PLAYER.b1), ctx());
    expect(result?.section).toBe('your_turn');
    expect(result?.situation).toEqual({ kind: 'confirm_result', deadline: RESPONSE_DEADLINE });
  });

  it('lançado pelo parceiro: "Aguardando", como se fosse o próprio jogador', () => {
    const result = rankingAgendaEntry(awaiting(PLAYER.a2), ctx());
    expect(result?.section).toBe('waiting');
    expect(result?.situation).toEqual({ kind: 'awaiting_confirmation', deadline: RESPONSE_DEADLINE });
  });

  it('em arbitragem e não realizada: "Com o admin"', () => {
    const arbitration: RankingMatch = {
      ...definedRankingMatch(),
      status: 'in_arbitration',
      report: { result: WIN_A, reported_by: PLAYER.b1, reported_at: REPORTED_AT },
      contest: { responded_by: PLAYER.a1, responded_at: REPORTED_AT, reason: 'other' },
    };
    const notPlayed: RankingMatch = { ...definedRankingMatch(), status: 'not_played' };
    expect(rankingAgendaEntry(arbitration, ctx())?.situation.kind).toBe('with_admin');
    expect(rankingAgendaEntry(notPlayed, ctx())?.section).toBe('waiting');
  });

  it('confirmada: "Histórico", com resultado e pontos', () => {
    const match: RankingMatch = {
      ...definedRankingMatch(),
      status: 'confirmed',
      result: WIN_A,
      report: null,
      confirmation: { via: 'admin', admin_id: PLAYER.admin, acted_at: REPORTED_AT },
      correction: null,
      points: { a: 104, b: 46 },
    };
    const result = rankingAgendaEntry(match, ctx());
    expect(result?.section).toBe('history');
    expect(result?.situation).toEqual({ kind: 'confirmed', result: WIN_A, points: { a: 104, b: 46 } });
    expect(result?.played_at).toBe(match.scheduled_at);
  });

  it('cancelada ou anulada: não aparece', () => {
    const match: RankingMatch = {
      ...definedRankingMatch(),
      status: 'cancelled',
      reason: 'annulled',
      cancellation: { admin_id: PLAYER.admin, acted_at: REPORTED_AT },
    };
    expect(rankingAgendaEntry(match, ctx())).toBeNull();
  });
});

describe('tournamentAgendaEntry', () => {
  it('sem horário: "Próximos jogos", horário a definir', () => {
    const result = tournamentAgendaEntry(definedTournamentMatch(), 'a', NOW);
    expect(result?.section).toBe('upcoming');
    expect(result?.situation).toEqual({ kind: 'tournament_scheduled', startsAt: null, venue: null });
  });

  it('com horário no futuro: "Próximos jogos"', () => {
    const match: TournamentMatch = { ...definedTournamentMatch(), scheduled_at: FUTURE, venue: 'Quadra 3' };
    expect(tournamentAgendaEntry(match, 'a', NOW)?.situation).toEqual({
      kind: 'tournament_scheduled',
      startsAt: FUTURE,
      venue: 'Quadra 3',
    });
  });

  it('horário passou sem resultado: "Aguardando", resultado com o admin (R38)', () => {
    const match: TournamentMatch = { ...definedTournamentMatch(), scheduled_at: PAST };
    const result = tournamentAgendaEntry(match, 'a', NOW);
    expect(result?.section).toBe('waiting');
    expect(result?.situation.kind).toBe('tournament_with_admin');
  });
});

describe('friendlyAgendaEntry', () => {
  const base = {
    id: 'friendly-test',
    kind: 'friendly' as const,
    side_a_unit_id: 'unit-a',
    side_b_unit_id: 'unit-b',
    format: 'one_set_of_6' as const,
    played_at: PAST,
    venue: null,
    created_at: REPORTED_AT,
    report: { result: WIN_A, reported_by: PLAYER.a1, reported_at: REPORTED_AT },
  };
  const awaitingFriendly: FriendlyMatch = { ...base, status: 'awaiting_confirmation' };
  const discarded: FriendlyMatch = {
    ...base,
    status: 'discarded',
    response: { responded_by: PLAYER.b1, responded_at: REPORTED_AT },
  };

  it('lançado pelo outro lado: "Sua vez", confirmar amistoso, sem prazo', () => {
    const result = friendlyAgendaEntry(awaitingFriendly, { viewerId: PLAYER.b1, viewerSide: 'b', reporterSide: 'a' });
    expect(result?.section).toBe('your_turn');
    expect(result?.situation).toEqual({ kind: 'confirm_friendly' });
  });

  it('lançado pelo próprio lado: "Aguardando", inclusive para o parceiro', () => {
    const own = friendlyAgendaEntry(awaitingFriendly, { viewerId: PLAYER.a1, viewerSide: 'a', reporterSide: 'a' });
    const partner = friendlyAgendaEntry(awaitingFriendly, { viewerId: PLAYER.a2, viewerSide: 'a', reporterSide: 'a' });
    expect(own?.section).toBe('waiting');
    expect(partner?.situation).toEqual({ kind: 'friendly_awaiting' });
  });

  it('descartado: no histórico só de quem lançou (RESULTS.md §6.2)', () => {
    const reporter = friendlyAgendaEntry(discarded, { viewerId: PLAYER.a1, viewerSide: 'a', reporterSide: 'a' });
    expect(reporter?.section).toBe('history');
    expect(reporter?.situation).toEqual({ kind: 'friendly_discarded' });
    expect(friendlyAgendaEntry(discarded, { viewerId: PLAYER.a2, viewerSide: 'a', reporterSide: 'a' })).toBeNull();
    expect(friendlyAgendaEntry(discarded, { viewerId: PLAYER.b1, viewerSide: 'b', reporterSide: 'a' })).toBeNull();
  });

  it('cancelado: no histórico só de quem lançou', () => {
    const cancelled: FriendlyMatch = { ...base, status: 'cancelled', cancelled_at: REPORTED_AT };
    const result = friendlyAgendaEntry(cancelled, { viewerId: PLAYER.a1, viewerSide: 'a', reporterSide: 'a' });
    expect(result?.situation).toEqual({ kind: 'friendly_cancelled' });
  });
});
