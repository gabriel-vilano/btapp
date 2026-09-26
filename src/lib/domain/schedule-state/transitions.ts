import type {
  PendingScheduleProposal,
  ReportedScheduleDate,
  ScheduleHistory,
  ScheduleOption,
  ScheduleReplacement,
  ScheduleWithdrawal,
} from '@/src/types/domain';
import {
  assertPlayerOfMatch,
  assertSchedulable,
  assertValidDate,
  assertValidOptions,
  sideOfPlayer,
  type ScheduleActor,
  type ScheduleContext,
} from './guards';
import { expireProposals, isOptionOpen, pendingProposalOf, proposalBase, replaceProposal } from './history';
import { ScheduleError } from './scheduleError';

// Ações da marcação do confronto (docs/SCHEDULING.md §3). Cada uma recebe o
// histórico e devolve o histórico novo, ou lança ScheduleError. A data acordada
// da partida sai do histórico por `agreedScheduleOf`.

/** O que o jogador informa ao propor; o resto vem de quem age. */
export interface ScheduleProposalDraft {
  id: string;
  options: readonly ScheduleOption[];
}

/** O que o jogador informa ao registrar uma data combinada fora do app. */
export type ReportedScheduleDateDraft = Pick<ReportedScheduleDate, 'id' | 'starts_at' | 'venue'>;

/**
 * Qualquer jogador de qualquer lado propõe de 2 a 3 horários (M2, M5, M6). A
 * pendente, se houver, fica substituída: é a contraproposta do outro lado (M9)
 * ou a troca feita pelo próprio lado (M10). Com data acordada, é a remarcação (M13).
 */
export function proposeSchedule(
  history: ScheduleHistory,
  draft: ScheduleProposalDraft,
  actor: ScheduleActor,
  context: ScheduleContext,
): ScheduleHistory {
  assertSchedulable(history, context.match);
  const side = assertPlayerOfMatch(context.sides, actor.playerId);
  const options = assertValidOptions(draft.options, actor.at, context.roundDeadline);
  const proposal: PendingScheduleProposal = {
    id: draft.id,
    match_id: history.match_id,
    side,
    proposed_by: actor.playerId,
    created_at: actor.at,
    options,
    status: 'pending',
  };
  const settled = supersedePending(expireProposals(history, actor.at), { kind: 'proposal', proposal_id: draft.id }, actor.at);
  return { ...settled, proposals: [...settled.proposals, proposal] };
}

/**
 * Qualquer jogador do outro lado aceita uma opção ainda no futuro; vale o
 * primeiro aceite (M3, M4, M11, M12). A opção vira a data acordada.
 */
export function acceptScheduleOption(
  history: ScheduleHistory,
  optionIndex: number,
  actor: ScheduleActor,
  context: ScheduleContext,
): ScheduleHistory {
  assertSchedulable(history, context.match);
  const pending = assertPending(history);
  assertOtherSide(pending, actor.playerId, context);
  const acceptedIndex = assertOpenOption(pending, optionIndex, actor.at);
  return replaceProposal(history, {
    ...proposalBase(pending),
    status: 'accepted',
    accepted_option_index: acceptedIndex,
    responded_by: actor.playerId,
    responded_at: actor.at,
  });
}

/** Qualquer jogador do lado que propôs retira a pendente. Ela fica no histórico (M10, M16). */
export function withdrawScheduleProposal(
  history: ScheduleHistory,
  actor: ScheduleActor,
  context: ScheduleContext,
): ScheduleHistory {
  assertSchedulable(history, context.match);
  const settled = expireProposals(history, actor.at);
  const pending = assertPending(settled);
  if (sideOfPlayer(context.sides, actor.playerId) !== pending.side) {
    throw new ScheduleError(
      'not_allowed',
      `Jogador '${actor.playerId}' não pode retirar a proposta '${pending.id}': esperado alguém do lado '${pending.side}'`,
    );
  }
  const withdrawal: ScheduleWithdrawal = { by: 'player', player_id: actor.playerId };
  return replaceProposal(settled, { ...proposalBase(pending), status: 'withdrawn', withdrawal, closed_at: actor.at });
}

/**
 * Qualquer jogador do confronto informa uma data combinada fora do app, sem
 * aceite (M14). Ela substitui a pendente, se houver (M15), e vira a data acordada.
 */
export function reportScheduleDate(
  history: ScheduleHistory,
  draft: ReportedScheduleDateDraft,
  actor: ScheduleActor,
  context: ScheduleContext,
): ScheduleHistory {
  assertSchedulable(history, context.match);
  assertPlayerOfMatch(context.sides, actor.playerId);
  assertValidDate(draft.starts_at);
  const reported: ReportedScheduleDate = {
    ...draft,
    match_id: history.match_id,
    reported_by: actor.playerId,
    reported_at: actor.at,
  };
  const replacement = { kind: 'reported_date' as const, reported_date_id: draft.id };
  const settled = supersedePending(expireProposals(history, actor.at), replacement, actor.at);
  return { ...settled, reported_dates: [...settled.reported_dates, reported] };
}

/**
 * A partida saiu de "Confronto definido": a pendente é retirada pelo sistema, e
 * a marcação congela como evidência (M1). Recebe o histórico, não a partida,
 * porque roda depois da transição da partida.
 *
 * Com `round_deadline`, a pendente sempre já expirou: toda opção é anterior ao
 * prazo da rodada (M6), e a expiração vem antes da retirada.
 */
export function closeScheduleOnMatchExit(
  history: ScheduleHistory,
  reason: Extract<ScheduleWithdrawal, { by: 'system' }>['reason'],
  at: string,
): ScheduleHistory {
  const settled = expireProposals(history, at);
  const pending = pendingProposalOf(settled);
  if (pending === null) return settled;
  const withdrawal: ScheduleWithdrawal = { by: 'system', reason };
  return replaceProposal(settled, { ...proposalBase(pending), status: 'withdrawn', withdrawal, closed_at: at });
}

function supersedePending(history: ScheduleHistory, replacement: ScheduleReplacement, at: string): ScheduleHistory {
  const pending = pendingProposalOf(history);
  if (pending === null) return history;
  return replaceProposal(history, { ...proposalBase(pending), status: 'superseded', superseded_by: replacement, closed_at: at });
}

function assertPending(history: ScheduleHistory): PendingScheduleProposal {
  const pending = pendingProposalOf(history);
  if (pending !== null) return pending;
  throw new ScheduleError('no_pending_proposal', `Confronto '${history.match_id}' não tem proposta pendente`);
}

// O lado que propôs não aceita a própria proposta, nem o parceiro de quem enviou (M4).
function assertOtherSide(pending: PendingScheduleProposal, playerId: string, context: ScheduleContext): void {
  const side = sideOfPlayer(context.sides, playerId);
  if (side !== null && side !== pending.side) return;
  throw new ScheduleError(
    'not_allowed',
    `Jogador '${playerId}' não pode aceitar a proposta '${pending.id}' do lado '${pending.side}': esperado alguém do outro lado`,
  );
}

function assertOpenOption(pending: PendingScheduleProposal, optionIndex: number, at: string): 0 | 1 | 2 {
  const option = pending.options[optionIndex];
  if (option === undefined || !isOptionIndex(optionIndex)) {
    throw new ScheduleError(
      'invalid_options',
      `Opção ${optionIndex} na proposta '${pending.id}': esperado de 0 a ${pending.options.length - 1}`,
    );
  }
  if (!isOptionOpen(option, at)) {
    throw new ScheduleError('option_passed', `Opção em '${option.starts_at}' já passou; aceite em ${at}`);
  }
  return optionIndex;
}

function isOptionIndex(index: number): index is 0 | 1 | 2 {
  return index === 0 || index === 1 || index === 2;
}
