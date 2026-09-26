import { describe, expect, it } from 'vitest';
import type { DoubleWoResult, WoResult } from '@/src/types/domain';
import {
  annulResult,
  arbitrateRankingResult,
  cancelNotPlayed,
  correctResult,
  decideNotPlayed,
  reportTournamentResult,
} from './adminTransitions';
import {
  ADMIN_CONTEXT,
  PLAYER,
  REPORTED_AT,
  WIN_A,
  WIN_B,
  act,
  definedRankingMatch,
  definedTournamentMatch,
  expectRefusal,
  rankingMatchIn,
} from './matchState.test-utils';

const ADMIN_AT = '2026-09-20T15:00:00.000Z';
const admin = act(PLAYER.admin, ADMIN_AT);
const adminAction = { admin_id: PLAYER.admin, acted_at: ADMIN_AT };
const woForB: WoResult = { type: 'wo', winner: 'b' };
const doubleWo: DoubleWoResult = { type: 'double_wo' };
const launchedReport = { result: WIN_A, reported_by: PLAYER.a1, reported_at: REPORTED_AT };

describe('arbitragem da contestação (R15, R39)', () => {
  it('o admin define o resultado, que pode ser outro, e a partida pontua por ele', () => {
    const match = arbitrateRankingResult(rankingMatchIn('in_arbitration'), WIN_B, admin, ADMIN_CONTEXT);
    expect(match).toEqual({
      ...definedRankingMatch(),
      status: 'confirmed',
      result: WIN_B,
      report: launchedReport,
      confirmation: { via: 'admin', ...adminAction },
      correction: null,
      points: { a: 50, b: 100 },
    });
  });

  it('quem não é admin não arbitra, nem o adversário que contestou', () => {
    expectRefusal(
      () => arbitrateRankingResult(rankingMatchIn('in_arbitration'), WIN_B, act(PLAYER.b1), ADMIN_CONTEXT),
      'not_allowed',
    );
  });

  it('o admin arbitra a própria partida, e fica registrado quem arbitrou (R39)', () => {
    const context = { ...ADMIN_CONTEXT, adminIds: [PLAYER.b1] };
    const match = arbitrateRankingResult(rankingMatchIn('in_arbitration'), WIN_B, act(PLAYER.b1, ADMIN_AT), context);
    expect(match).toMatchObject({ confirmation: { via: 'admin', admin_id: PLAYER.b1 } });
  });
});

describe('decisão da partida não realizada (R36, R40)', () => {
  it('W.O. para um lado: confirmada sem lançamento de jogador', () => {
    const match = decideNotPlayed(rankingMatchIn('not_played'), woForB, admin, ADMIN_CONTEXT);
    expect(match).toEqual({
      ...definedRankingMatch(),
      status: 'confirmed',
      result: woForB,
      report: null,
      confirmation: { via: 'admin', ...adminAction },
      correction: null,
      points: { a: 50, b: 100 },
    });
  });

  it('W.O. duplo: confirmada com 0 e 0', () => {
    const match = decideNotPlayed(rankingMatchIn('not_played'), doubleWo, admin, ADMIN_CONTEXT);
    expect(match).toMatchObject({ status: 'confirmed', result: doubleWo, points: { a: 0, b: 0 } });
  });

  it('cancelamento: ninguém pontua', () => {
    const match = cancelNotPlayed(rankingMatchIn('not_played'), admin, ADMIN_CONTEXT);
    expect(match).toEqual({
      ...definedRankingMatch(),
      status: 'cancelled',
      reason: 'not_played',
      cancellation: adminAction,
    });
  });

  it('só o admin decide', () => {
    const notPlayed = rankingMatchIn('not_played');
    expectRefusal(() => decideNotPlayed(notPlayed, woForB, act(PLAYER.b1), ADMIN_CONTEXT), 'not_allowed');
    expectRefusal(() => cancelNotPlayed(notPlayed, act(PLAYER.b1), ADMIN_CONTEXT), 'not_allowed');
  });
});

describe('resultado do torneio (R38)', () => {
  it('o admin lança, e o resultado nasce confirmado, sem pontos', () => {
    const match = reportTournamentResult(definedTournamentMatch(), WIN_A, admin, ADMIN_CONTEXT);
    expect(match).toEqual({
      ...definedTournamentMatch(),
      status: 'confirmed',
      result: WIN_A,
      report: { result: WIN_A, reported_by: PLAYER.admin, reported_at: ADMIN_AT },
      confirmation: { via: 'admin', ...adminAction },
      correction: null,
      points: null,
    });
  });

  it('jogador que não é admin não lança no torneio', () => {
    expectRefusal(() => reportTournamentResult(definedTournamentMatch(), WIN_A, act(PLAYER.a1), ADMIN_CONTEXT), 'not_allowed');
  });

  it('não lança duas vezes', () => {
    const confirmed = reportTournamentResult(definedTournamentMatch(), WIN_A, admin, ADMIN_CONTEXT);
    expectRefusal(() => reportTournamentResult(confirmed, WIN_B, admin, ADMIN_CONTEXT), 'invalid_status');
  });
});

describe('correção depois da confirmação (R15, R41)', () => {
  it('no ranking, troca o resultado, recalcula os pontos e mantém a confirmação original', () => {
    const confirmed = rankingMatchIn('confirmed');
    const match = correctResult(confirmed, WIN_B, admin, ADMIN_CONTEXT);
    expect(match).toMatchObject({
      status: 'confirmed',
      result: WIN_B,
      report: launchedReport,
      confirmation: confirmed.status === 'confirmed' ? confirmed.confirmation : null,
      correction: adminAction,
      points: { a: 50, b: 100 },
    });
  });

  it('no torneio, corrige sem pontos', () => {
    const confirmed = reportTournamentResult(definedTournamentMatch(), WIN_A, admin, ADMIN_CONTEXT);
    const match = correctResult(confirmed, WIN_B, admin, ADMIN_CONTEXT);
    expect(match).toMatchObject({ status: 'confirmed', result: WIN_B, correction: adminAction, points: null });
  });

  it('W.O. duplo só na partida que o admin decidiu como não realizada (R36)', () => {
    expectRefusal(() => correctResult(rankingMatchIn('confirmed'), doubleWo, admin, ADMIN_CONTEXT), 'invalid_result');
    const decided = decideNotPlayed(rankingMatchIn('not_played'), woForB, admin, ADMIN_CONTEXT);
    expect(correctResult(decided, doubleWo, admin, ADMIN_CONTEXT)).toMatchObject({ result: doubleWo, points: { a: 0, b: 0 } });
  });

  it('só o admin corrige', () => {
    expectRefusal(() => correctResult(rankingMatchIn('confirmed'), WIN_B, act(PLAYER.b1), ADMIN_CONTEXT), 'not_allowed');
  });
});

describe('anulação depois da confirmação (R41)', () => {
  it('no ranking, a partida confirmada vira cancelada', () => {
    const match = annulResult(rankingMatchIn('confirmed'), admin, ADMIN_CONTEXT);
    expect(match).toEqual({ ...definedRankingMatch(), status: 'cancelled', reason: 'annulled', cancellation: adminAction });
  });

  it('no torneio também', () => {
    const confirmed = reportTournamentResult(definedTournamentMatch(), WIN_A, admin, ADMIN_CONTEXT);
    expect(annulResult(confirmed, admin, ADMIN_CONTEXT)).toEqual({
      ...definedTournamentMatch(),
      status: 'cancelled',
      reason: 'annulled',
      cancellation: adminAction,
    });
  });

  it('só o admin anula', () => {
    expectRefusal(() => annulResult(rankingMatchIn('confirmed'), act(PLAYER.a1), ADMIN_CONTEXT), 'not_allowed');
  });
});
