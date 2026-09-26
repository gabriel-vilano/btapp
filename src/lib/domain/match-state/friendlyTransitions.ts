import type { FriendlyMatch, FriendlyResult } from '@/src/types/domain';
import {
  assertOpponentOfReporter,
  assertPlayerOfMatch,
  assertRetirementReportedByWinner,
  assertStatus,
  type MatchSidePlayers,
  type TransitionActor,
} from './guards';
import { friendlyBase } from './matchBase';
import { MatchTransitionError } from './transitionError';

// Transições do amistoso (docs/DOMAIN.md §3, "Amistoso"). Sem competição não há
// admin nem prazo: o amistoso fica pendente até o outro lado responder (R43).

/** O que o jogador informa ao registrar o amistoso; o resto vem do lançamento. */
export type FriendlyMatchDraft = Pick<
  FriendlyMatch,
  'id' | 'side_a_unit_id' | 'side_b_unit_id' | 'format' | 'played_at' | 'venue'
>;

/** O amistoso nasce do lançamento do resultado, por um jogador de um dos lados (R42, R43). */
export function reportFriendly(
  draft: FriendlyMatchDraft,
  result: FriendlyResult,
  actor: TransitionActor,
  sides: MatchSidePlayers,
): FriendlyMatch {
  const reporterSide = assertPlayerOfMatch(sides, actor.playerId);
  assertRetirementReportedByWinner(result, reporterSide);
  const report = { result, reported_by: actor.playerId, reported_at: actor.at };
  return { ...draft, kind: 'friendly', created_at: actor.at, report, status: 'awaiting_confirmation' };
}

/** O outro lado confirma, e o amistoso passa a contar no H2H e no `total_matches` (R42). */
export function confirmFriendly(match: FriendlyMatch, actor: TransitionActor, sides: MatchSidePlayers): FriendlyMatch {
  assertStatus(match, 'awaiting_confirmation', 'confirmar o amistoso');
  assertOpponentOfReporter(sides, actor.playerId, match.report.reported_by);
  const response = { responded_by: actor.playerId, responded_at: actor.at };
  return { ...friendlyBase(match), status: 'confirmed', response };
}

/** Sem admin para arbitrar, a contestação descarta o resultado. Para valer, alguém lança de novo (R43). */
export function contestFriendly(match: FriendlyMatch, actor: TransitionActor, sides: MatchSidePlayers): FriendlyMatch {
  assertStatus(match, 'awaiting_confirmation', 'contestar o amistoso');
  assertOpponentOfReporter(sides, actor.playerId, match.report.reported_by);
  const response = { responded_by: actor.playerId, responded_at: actor.at };
  return { ...friendlyBase(match), status: 'discarded', response };
}

/** Enquanto está pendente, só quem lançou cancela (R43). O parceiro dele não. */
export function cancelFriendly(match: FriendlyMatch, actor: TransitionActor): FriendlyMatch {
  assertStatus(match, 'awaiting_confirmation', 'cancelar o amistoso');
  if (actor.playerId !== match.report.reported_by) {
    throw new MatchTransitionError(
      'not_allowed',
      `Jogador '${actor.playerId}' não pode cancelar o amistoso '${match.id}': só quem lançou ('${match.report.reported_by}')`,
    );
  }
  return { ...friendlyBase(match), status: 'cancelled', cancelled_at: actor.at };
}
