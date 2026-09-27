import { expect } from 'vitest';
import type {
  CompetitionResult,
  FriendlyMatch,
  NormalResult,
  RankingMatch,
  SidePoints,
  TournamentMatch,
} from '@/src/types/domain';
import { cancelNotPlayed, type AdminContext } from './adminTransitions';
import { reportFriendly } from './friendlyTransitions';
import type { MatchSidePlayers, TransitionActor } from './guards';
import {
  confirmRankingResult,
  contestRankingResult,
  markRankingNotPlayed,
  reportRankingResult,
  type RankingMatchContext,
} from './rankingTransitions';
import { MatchTransitionError, type MatchTransitionErrorCode } from './transitionError';

// Partidas e contextos mínimos para os testes da máquina de estados. Duplas
// A1+A2 × B1+B2, um admin de fora e um jogador de fora da partida.

export const PLAYER = { a1: 'p-a1', a2: 'p-a2', b1: 'p-b1', b2: 'p-b2', admin: 'p-admin', outsider: 'p-outsider' };

export const SIDES: MatchSidePlayers = { a: [PLAYER.a1, PLAYER.a2], b: [PLAYER.b1, PLAYER.b2] };

export const DRAW_AT = '2026-09-01T12:00:00.000Z';
export const ROUND_DEADLINE = '2026-09-15T23:59:00.000Z';
export const REPORTED_AT = '2026-09-10T20:00:00.000Z';
export const RESPONSE_DEADLINE = '2026-09-12T20:00:00.000Z'; // REPORTED_AT + 48h

/** Pontuação falsa e previsível: a máquina de estados só repassa o que ela devolve. */
export function fakeScore(result: CompetitionResult): SidePoints {
  if (result.type === 'double_wo') return { a: 0, b: 0 };
  return result.winner === 'a' ? { a: 100, b: 50 } : { a: 50, b: 100 };
}

export const RANKING_CONTEXT: RankingMatchContext = {
  sides: SIDES,
  responseDeadlineHours: 48,
  roundDeadline: ROUND_DEADLINE,
  score: fakeScore,
};

export const ADMIN_CONTEXT: AdminContext = { adminIds: [PLAYER.admin], score: fakeScore };

export function act(playerId: string, at: string = REPORTED_AT): TransitionActor {
  return { playerId, at };
}

export const WIN_A: NormalResult = {
  type: 'normal',
  winner: 'a',
  sets: [{ games_a: 6, games_b: 4, super_tiebreak: false, interrupted: false }],
};

export const WIN_B: NormalResult = {
  type: 'normal',
  winner: 'b',
  sets: [{ games_a: 3, games_b: 6, super_tiebreak: false, interrupted: false }],
};

export function definedRankingMatch(): RankingMatch {
  return {
    id: 'match-test',
    kind: 'ranking',
    competition_id: 'ranking-test',
    category_id: 'category-test',
    round_id: 'round-test',
    side_a_enrollment_id: 'enrollment-a',
    side_b_enrollment_id: 'enrollment-b',
    format: 'one_set_of_6',
    scheduled_at: '2026-09-10T18:00:00.000Z',
    venue: 'Arena Teste',
    created_at: DRAW_AT,
    status: 'defined',
  };
}

export function definedTournamentMatch(): TournamentMatch {
  return {
    id: 'match-tournament-test',
    kind: 'tournament',
    competition_id: 'tournament-test',
    category_id: 'category-test',
    side_a_enrollment_id: 'enrollment-a',
    side_b_enrollment_id: 'enrollment-b',
    format: 'one_set_of_6',
    scheduled_at: null,
    venue: null,
    created_at: DRAW_AT,
    stage: 'Final',
    status: 'defined',
  };
}

export function pendingFriendly(): FriendlyMatch {
  const draft = {
    id: 'friendly-test',
    side_a_unit_id: 'unit-a',
    side_b_unit_id: 'unit-b',
    format: 'one_set_of_6' as const,
    played_at: '2026-09-10T18:00:00.000Z',
    venue: null,
  };
  return reportFriendly(draft, WIN_A, act(PLAYER.a1), SIDES);
}

/** Garante que a ação foi recusada com o código esperado. */
export function expectRefusal(action: () => unknown, code: MatchTransitionErrorCode): void {
  let caught: unknown = null;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(MatchTransitionError);
  expect((caught as MatchTransitionError).code).toBe(code);
}

export const AFTER_ROUND_DEADLINE = '2026-09-16T00:00:00.000Z';

/** Partida de ranking em cada estado, montada pelas próprias transições. */
export function rankingMatchIn(status: RankingMatch['status']): RankingMatch {
  const awaiting = reportRankingResult(definedRankingMatch(), WIN_A, act(PLAYER.a1), RANKING_CONTEXT);
  const notPlayed = markRankingNotPlayed(definedRankingMatch(), AFTER_ROUND_DEADLINE, RANKING_CONTEXT);
  const byStatus: { [S in RankingMatch['status']]: () => RankingMatch } = {
    defined: definedRankingMatch,
    awaiting_confirmation: () => awaiting,
    in_arbitration: () => contestRankingResult(awaiting, act(PLAYER.b1), RANKING_CONTEXT),
    not_played: () => notPlayed,
    confirmed: () => confirmRankingResult(awaiting, act(PLAYER.b1), RANKING_CONTEXT),
    cancelled: () => cancelNotPlayed(notPlayed, act(PLAYER.admin, AFTER_ROUND_DEADLINE), ADMIN_CONTEXT),
  };
  return byStatus[status]();
}

export const RANKING_STATUSES: RankingMatch['status'][] = [
  'defined',
  'awaiting_confirmation',
  'in_arbitration',
  'not_played',
  'confirmed',
  'cancelled',
];
