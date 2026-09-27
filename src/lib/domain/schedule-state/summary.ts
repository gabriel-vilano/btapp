import type { MatchSideKey, ScheduleHistory, ScheduleProposal } from '@/src/types/domain';
import { sideOfPlayer, type ScheduleSides } from './guards';
import { agreedScheduleOf, type AgreedSchedule } from './history';

// Resumo da marcação por lado, para o admin decidir a partida não realizada
// (R40, M17). É evidência, não veredito: o resumo só conta fatos e não diz
// qual lado "ganha" o W.O.

/** O que um lado fez na marcação do confronto. */
export interface ScheduleSideSummary {
  side: MatchSideKey;
  /** Propostas enviadas pelo lado, incluindo contrapropostas e remarcações. */
  proposalCount: number;
  /**
   * Horários distintos oferecidos em todas as propostas do lado. O mesmo
   * horário repetido em duas propostas conta uma vez (a PESQ-RV dá o W.O. a
   * quem "ofereceu mais datas", e repetir não é oferecer de novo).
   */
  offeredTimeCount: number;
  /** Propostas do lado que expiraram sem aceite nem contraproposta do outro lado (M12). */
  unansweredCount: number;
  /** Propostas do outro lado que este lado aceitou (M11). */
  acceptedCount: number;
  /** Datas combinadas fora do app que alguém do lado informou (M14). */
  reportedDateCount: number;
  /** Quando o lado ofereceu horários pela primeira e pela última vez. `null` se nunca propôs. */
  firstProposedAt: string | null;
  lastProposedAt: string | null;
}

export interface ScheduleSummary {
  a: ScheduleSideSummary;
  b: ScheduleSideSummary;
  /** A data que valia por último: proposta aceita ou data informada (M11, M14). */
  agreed: AgreedSchedule | null;
}

/**
 * Resumo por lado do histórico da marcação (M17). Recebe os lados porque a
 * data informada guarda só o jogador, não o lado.
 * @example scheduleSummaryOf(history, { a: ['p-1', 'p-2'], b: ['p-3', 'p-4'] }).a.offeredTimeCount
 */
export function scheduleSummaryOf(history: ScheduleHistory, sides: ScheduleSides): ScheduleSummary {
  return {
    a: sideSummaryOf(history, sides, 'a'),
    b: sideSummaryOf(history, sides, 'b'),
    agreed: agreedScheduleOf(history),
  };
}

function sideSummaryOf(history: ScheduleHistory, sides: ScheduleSides, side: MatchSideKey): ScheduleSideSummary {
  const own = history.proposals.filter((proposal) => proposal.side === side);
  const proposedAt = own.map((proposal) => proposal.created_at).sort(byTime);
  return {
    side,
    proposalCount: own.length,
    offeredTimeCount: distinctOfferedTimes(own),
    unansweredCount: own.filter((proposal) => proposal.status === 'expired').length,
    acceptedCount: history.proposals.filter((proposal) => acceptedBySide(proposal, sides, side)).length,
    reportedDateCount: history.reported_dates.filter((reported) => sideOfPlayer(sides, reported.reported_by) === side)
      .length,
    firstProposedAt: proposedAt[0] ?? null,
    lastProposedAt: proposedAt[proposedAt.length - 1] ?? null,
  };
}

function distinctOfferedTimes(proposals: ScheduleProposal[]): number {
  const times = proposals.flatMap((proposal) => proposal.options.map((option) => Date.parse(option.starts_at)));
  return new Set(times).size;
}

function acceptedBySide(proposal: ScheduleProposal, sides: ScheduleSides, side: MatchSideKey): boolean {
  return proposal.status === 'accepted' && sideOfPlayer(sides, proposal.responded_by) === side;
}

function byTime(a: string, b: string): number {
  return Date.parse(a) - Date.parse(b);
}
