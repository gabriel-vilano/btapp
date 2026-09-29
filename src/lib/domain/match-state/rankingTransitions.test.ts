import { describe, expect, it } from 'vitest';
import type { RetiredResult, WoResult } from '@/src/types/domain';
import {
  confirmRankingByDeadline,
  confirmRankingResult,
  contestRankingResult,
  markRankingNotPlayed,
  reportRankingResult,
  undoRankingReport,
} from './rankingTransitions';
import {
  AFTER_ROUND_DEADLINE,
  CONTEST,
  PLAYER,
  RANKING_CONTEXT,
  REPORTED_AT,
  RESPONSE_DEADLINE,
  ROUND_DEADLINE,
  WIN_A,
  act,
  definedRankingMatch,
  expectRefusal,
  rankingMatchIn,
} from './matchState.test-utils';

const AFTER_RESPONSE_DEADLINE = '2026-09-12T20:00:01.000Z';

const retiredWinA: RetiredResult = {
  type: 'retired',
  winner: 'a',
  sets: [{ games_a: 4, games_b: 2, super_tiebreak: false, interrupted: true }],
};

describe('lançar o resultado no ranking (R13, R40)', () => {
  it.each([PLAYER.a1, PLAYER.a2, PLAYER.b1, PLAYER.b2])('qualquer jogador da partida lança: %s', (playerId) => {
    const match = reportRankingResult(definedRankingMatch(), WIN_A, act(playerId), RANKING_CONTEXT);
    expect(match).toEqual({
      ...definedRankingMatch(),
      status: 'awaiting_confirmation',
      report: { result: WIN_A, reported_by: playerId, reported_at: REPORTED_AT },
    });
  });

  it.each([PLAYER.outsider, PLAYER.admin])('quem não joga a partida não lança: %s', (playerId) => {
    expectRefusal(() => reportRankingResult(definedRankingMatch(), WIN_A, act(playerId), RANKING_CONTEXT), 'not_allowed');
  });

  it('desistência: o lado vencedor lança, o de quem desistiu não (R11)', () => {
    const match = reportRankingResult(definedRankingMatch(), retiredWinA, act(PLAYER.a2), RANKING_CONTEXT);
    expect(match.status).toBe('awaiting_confirmation');
    expectRefusal(
      () => reportRankingResult(definedRankingMatch(), retiredWinA, act(PLAYER.b1), RANKING_CONTEXT),
      'invalid_result',
    );
  });

  it('W.O.: só a favor de quem lança; "eu não fui" não se lança (R50)', () => {
    const woForA: WoResult = { type: 'wo', winner: 'a' };
    const match = reportRankingResult(definedRankingMatch(), woForA, act(PLAYER.a1), RANKING_CONTEXT);
    expect(match.status).toBe('awaiting_confirmation');
    expectRefusal(() => reportRankingResult(definedRankingMatch(), woForA, act(PLAYER.b2), RANKING_CONTEXT), 'invalid_result');
  });

  it('lança até o prazo da rodada, inclusive; depois, a partida é do admin', () => {
    const atDeadline = reportRankingResult(definedRankingMatch(), WIN_A, act(PLAYER.a1, ROUND_DEADLINE), RANKING_CONTEXT);
    expect(atDeadline.status).toBe('awaiting_confirmation');
    expectRefusal(
      () => reportRankingResult(definedRankingMatch(), WIN_A, act(PLAYER.a1, AFTER_ROUND_DEADLINE), RANKING_CONTEXT),
      'too_late',
    );
  });
});

describe('responder ao resultado no ranking (R13, R14)', () => {
  it.each([PLAYER.b1, PLAYER.b2])('o adversário confirma, e a partida pontua: %s', (playerId) => {
    const match = confirmRankingResult(rankingMatchIn('awaiting_confirmation'), act(playerId), RANKING_CONTEXT);
    expect(match).toEqual({
      ...definedRankingMatch(),
      status: 'confirmed',
      result: WIN_A,
      report: { result: WIN_A, reported_by: PLAYER.a1, reported_at: REPORTED_AT },
      confirmation: { via: 'opponent', responded_by: playerId, responded_at: REPORTED_AT },
      correction: null,
      points: { a: 100, b: 50 },
    });
  });

  it.each([PLAYER.b1, PLAYER.b2])('o adversário contesta, e a partida vai para o admin: %s', (playerId) => {
    const match = contestRankingResult(rankingMatchIn('awaiting_confirmation'), CONTEST, act(playerId), RANKING_CONTEXT);
    expect(match).toEqual({
      ...definedRankingMatch(),
      status: 'in_arbitration',
      report: { result: WIN_A, reported_by: PLAYER.a1, reported_at: REPORTED_AT },
      contest: { responded_by: playerId, responded_at: REPORTED_AT, reason: 'different_winner' },
    });
  });

  it.each([PLAYER.a1, PLAYER.a2, PLAYER.outsider, PLAYER.admin])(
    'quem lançou, o parceiro dele e quem está de fora não respondem: %s',
    (playerId) => {
      const awaiting = rankingMatchIn('awaiting_confirmation');
      expectRefusal(() => confirmRankingResult(awaiting, act(playerId), RANKING_CONTEXT), 'not_allowed');
      expectRefusal(() => contestRankingResult(awaiting, CONTEST, act(playerId), RANKING_CONTEXT), 'not_allowed');
    },
  );

  it('responde até o fim do prazo, inclusive; depois, quem calou consentiu', () => {
    const awaiting = rankingMatchIn('awaiting_confirmation');
    const atDeadline = contestRankingResult(awaiting, CONTEST, act(PLAYER.b1, RESPONSE_DEADLINE), RANKING_CONTEXT);
    expect(atDeadline.status).toBe('in_arbitration');
    const late = act(PLAYER.b1, AFTER_RESPONSE_DEADLINE);
    expectRefusal(() => confirmRankingResult(awaiting, late, RANKING_CONTEXT), 'too_late');
    expectRefusal(() => contestRankingResult(awaiting, CONTEST, late, RANKING_CONTEXT), 'too_late');
  });

  it('vale a primeira resposta: depois de confirmada, ninguém mais contesta', () => {
    const confirmed = confirmRankingResult(rankingMatchIn('awaiting_confirmation'), act(PLAYER.b1), RANKING_CONTEXT);
    expectRefusal(() => contestRankingResult(confirmed, CONTEST, act(PLAYER.b2), RANKING_CONTEXT), 'invalid_status');
  });

  it('o prazo de resposta é o do ranking', () => {
    const context = { ...RANKING_CONTEXT, responseDeadlineHours: 72 };
    const match = confirmRankingResult(rankingMatchIn('awaiting_confirmation'), act(PLAYER.b1, AFTER_RESPONSE_DEADLINE), context);
    expect(match.status).toBe('confirmed');
  });
});

describe('confirmação automática pelo prazo (R14)', () => {
  it('passado o prazo, confirma com a data do fim do prazo', () => {
    const match = confirmRankingByDeadline(rankingMatchIn('awaiting_confirmation'), AFTER_ROUND_DEADLINE, RANKING_CONTEXT);
    expect(match).toMatchObject({
      status: 'confirmed',
      result: WIN_A,
      confirmation: { via: 'deadline', confirmed_at: RESPONSE_DEADLINE },
      correction: null,
      points: { a: 100, b: 50 },
    });
  });

  it.each([REPORTED_AT, RESPONSE_DEADLINE])('antes do fim do prazo, não confirma: %s', (at) => {
    expectRefusal(() => confirmRankingByDeadline(rankingMatchIn('awaiting_confirmation'), at, RANKING_CONTEXT), 'too_early');
  });
});

describe('partida não realizada no prazo da rodada (R40)', () => {
  it('passado o prazo sem resultado, vai para o admin, sem W.O. automático', () => {
    const match = markRankingNotPlayed(definedRankingMatch(), AFTER_ROUND_DEADLINE, RANKING_CONTEXT);
    expect(match).toEqual({ ...definedRankingMatch(), status: 'not_played' });
  });

  it('no prazo da rodada, ainda não', () => {
    expectRefusal(() => markRankingNotPlayed(definedRankingMatch(), ROUND_DEADLINE, RANKING_CONTEXT), 'too_early');
  });

  it('partida com resultado lançado segue o prazo de resposta, não vira não realizada', () => {
    expectRefusal(
      () => markRankingNotPlayed(rankingMatchIn('awaiting_confirmation'), AFTER_ROUND_DEADLINE, RANKING_CONTEXT),
      'invalid_status',
    );
  });
});

describe('motivo da contestação (R49)', () => {
  const rememberedWinA = { type: 'normal' as const, winner: 'a' as const, sets: [{ games_a: 7, games_b: 5, super_tiebreak: false, interrupted: false }] };

  it.each(['different_winner', 'not_played', 'other'] as const)('guarda o motivo: %s', (reason) => {
    const match = contestRankingResult(rankingMatchIn('awaiting_confirmation'), { reason }, act(PLAYER.b1), RANKING_CONTEXT);
    expect(match).toMatchObject({ status: 'in_arbitration', contest: { responded_by: PLAYER.b1, reason } });
  });

  it('com "placar diferente", guarda o placar que o jogador lembra, ou nenhum', () => {
    const awaiting = rankingMatchIn('awaiting_confirmation');
    const withScore = { reason: 'different_score' as const, remembered_result: rememberedWinA };
    expect(contestRankingResult(awaiting, withScore, act(PLAYER.b1), RANKING_CONTEXT)).toMatchObject({ contest: withScore });
    const withoutScore = { reason: 'different_score' as const, remembered_result: null };
    expect(contestRankingResult(awaiting, withoutScore, act(PLAYER.b1), RANKING_CONTEXT)).toMatchObject({ contest: withoutScore });
  });

  it('o placar lembrado precisa valer no formato da partida', () => {
    const notClosing = { ...rememberedWinA, sets: [{ games_a: 5, games_b: 4, super_tiebreak: false, interrupted: false }] };
    const details = { reason: 'different_score' as const, remembered_result: notClosing };
    expectRefusal(
      () => contestRankingResult(rankingMatchIn('awaiting_confirmation'), details, act(PLAYER.b1), RANKING_CONTEXT),
      'invalid_result',
    );
  });
});

describe('desfazer o lançamento (R48)', () => {
  it('quem lançou desfaz: a partida volta a Confronto definido e o lançamento fica no histórico', () => {
    const at = '2026-09-10T21:00:00.000Z';
    const match = undoRankingReport(rankingMatchIn('awaiting_confirmation'), act(PLAYER.a1, at), RANKING_CONTEXT);
    expect(match).toEqual({
      ...definedRankingMatch(),
      undone_reports: [{ result: WIN_A, reported_by: PLAYER.a1, reported_at: REPORTED_AT, undone_at: at }],
    });
  });

  it('depois de desfeito, qualquer jogador lança de novo, e o histórico continua', () => {
    const undone = undoRankingReport(rankingMatchIn('awaiting_confirmation'), act(PLAYER.a1), RANKING_CONTEXT);
    const reported = reportRankingResult(undone, WIN_A, act(PLAYER.b1), RANKING_CONTEXT);
    const confirmed = confirmRankingResult(reported, act(PLAYER.a2), RANKING_CONTEXT);
    expect(confirmed.status).toBe('confirmed');
    expect(confirmed.undone_reports).toHaveLength(1);
  });

  it.each([PLAYER.a2, PLAYER.b1, PLAYER.b2, PLAYER.outsider, PLAYER.admin])(
    'só quem lançou desfaz, nem o parceiro: %s',
    (playerId) => {
      expectRefusal(() => undoRankingReport(rankingMatchIn('awaiting_confirmation'), act(playerId), RANKING_CONTEXT), 'not_allowed');
    },
  );

  it('desfaz até o fim do prazo de resposta, inclusive; depois, quem calou consentiu (R14)', () => {
    const awaiting = rankingMatchIn('awaiting_confirmation');
    expect(undoRankingReport(awaiting, act(PLAYER.a1, RESPONSE_DEADLINE), RANKING_CONTEXT).status).toBe('defined');
    expectRefusal(() => undoRankingReport(awaiting, act(PLAYER.a1, AFTER_RESPONSE_DEADLINE), RANKING_CONTEXT), 'too_late');
  });

  it('depois da primeira resposta, não desfaz mais: o caminho é a contestação ou o admin', () => {
    expectRefusal(() => undoRankingReport(rankingMatchIn('confirmed'), act(PLAYER.a1), RANKING_CONTEXT), 'invalid_status');
    expectRefusal(() => undoRankingReport(rankingMatchIn('in_arbitration'), act(PLAYER.a1), RANKING_CONTEXT), 'invalid_status');
  });
});
