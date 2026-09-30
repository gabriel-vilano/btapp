import {
  ArrowUUpLeftIcon,
  CalendarCheckIcon,
  CalendarPlusIcon,
  ClockCountdownIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import type { StatusTimelineEvent } from "@/src/components/ui/StatusTimeline";
import { formatEventMoment } from "@/src/lib/formatters";
import type { ReportedScheduleDate, ScheduleHistory, ScheduleOption, ScheduleProposal } from "@/src/types/domain";

// Histórico da marcação em eventos do StatusTimeline (M16, M17). Cada fato vira
// uma linha com autor e momento. A proposta substituída não ganha linha
// própria: o substituto (contraproposta ou data informada) já é o evento.

/** Nome de exibição por player_id. */
export type PlayerNames = Readonly<Record<string, string>>;

const FALLBACK_NAME = "Jogador";

/**
 * Eventos do histórico da marcação, do mais antigo para o mais recente.
 * @example <StatusTimeline label="Histórico da marcação" events={scheduleTimelineEventsOf(history, names)} />
 */
export function scheduleTimelineEventsOf(history: ScheduleHistory, names: PlayerNames): StatusTimelineEvent[] {
  const events = [
    ...history.proposals.flatMap((proposal) => proposalEvents(proposal, names)),
    ...history.reported_dates.map((reported) => reportedDateEvent(reported, names)),
  ];
  return events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

function proposalEvents(proposal: ScheduleProposal, names: PlayerNames): StatusTimelineEvent[] {
  const created: StatusTimelineEvent = {
    id: `${proposal.id}:created`,
    actor: nameOf(proposal.proposed_by, names),
    action: `propôs ${proposal.options.length} horários`,
    detail: formatOptions(proposal.options),
    at: proposal.created_at,
    icon: CalendarPlusIcon,
  };
  const closing = closingEvent(proposal, names);
  return closing === null ? [created] : [created, closing];
}

function closingEvent(proposal: ScheduleProposal, names: PlayerNames): StatusTimelineEvent | null {
  const id = `${proposal.id}:${proposal.status}`;
  const proposer = nameOf(proposal.proposed_by, names);
  switch (proposal.status) {
    case "accepted": {
      const option = proposal.options[proposal.accepted_option_index];
      if (option === undefined) return null;
      const actor = nameOf(proposal.responded_by, names);
      return {
        id,
        actor,
        action: `aceitou ${formatEventMoment(option.starts_at)}`,
        detail: option.venue ?? undefined,
        at: proposal.responded_at,
        icon: CalendarCheckIcon,
      };
    }
    case "withdrawn":
      return withdrawnEvent(proposal, id, proposer, names);
    case "expired":
      return { id, action: `A proposta de ${proposer} expirou sem aceite.`, at: proposal.closed_at, icon: ClockCountdownIcon };
    default:
      return null;
  }
}

function withdrawnEvent(
  proposal: Extract<ScheduleProposal, { status: "withdrawn" }>,
  id: string,
  proposer: string,
  names: PlayerNames,
): StatusTimelineEvent {
  const { withdrawal, closed_at: at } = proposal;
  if (withdrawal.by === "player") {
    return { id, actor: nameOf(withdrawal.player_id, names), action: "retirou a proposta", at, icon: ArrowUUpLeftIcon };
  }
  const reason = withdrawal.reason === "result_reported" ? "com o lançamento do resultado" : "no prazo da rodada";
  return { id, action: `A proposta de ${proposer} foi encerrada ${reason}.`, at, icon: LockSimpleIcon };
}

function reportedDateEvent(reported: ReportedScheduleDate, names: PlayerNames): StatusTimelineEvent {
  return {
    id: `${reported.id}:reported`,
    actor: nameOf(reported.reported_by, names),
    action: "informou a data combinada fora do app",
    detail: formatOptions([reported]),
    at: reported.reported_at,
    icon: PencilSimpleIcon,
  };
}

/**
 * Horários separados por "ou". A arena comum a todos vai uma vez no fim; se
 * variar, cada horário leva a sua entre parênteses.
 * Ex.: "sáb, 05/09, 11h ou dom, 06/09, 7h · Arena Tucum".
 */
export function formatOptions(options: readonly ScheduleOption[]): string {
  const venues = new Set(options.map((option) => option.venue));
  const [sharedVenue] = venues;
  if (venues.size === 1) {
    const times = options.map((option) => formatEventMoment(option.starts_at)).join(" ou ");
    return sharedVenue ? `${times} · ${sharedVenue}` : times;
  }
  return options
    .map((option) => formatEventMoment(option.starts_at) + (option.venue ? ` (${option.venue})` : ""))
    .join(" ou ");
}

export function nameOf(playerId: string, names: PlayerNames): string {
  return names[playerId] ?? FALLBACK_NAME;
}
