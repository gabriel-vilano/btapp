import type { StatusTimelineEvent } from "@/src/components/ui/StatusTimeline";
import type { MatchSideKey, RankingMatch, ResultReport } from "@/src/types/domain";
import { actorName, CONTEST_REASON_LABEL, resultLine } from "./resultTexts";

// Histórico do resultado na tela do confronto (docs/RESULTS.md §4.3): quem
// lançou, desfez, contestou, confirmou e, do admin, quem agiu e quando (RG11).

/** Nomes que o histórico usa: os jogadores e os admins, por player_id, e os lados. */
export interface ResultTimelineNames {
  people: Record<string, string>;
  sides: Record<MatchSideKey, string>;
  viewerId: string;
}

/**
 * Eventos do resultado em ordem cronológica, do lançamento ao ato mais recente.
 * @example resultTimelineOf(match, { people, sides, viewerId })[0].action // "lançou o resultado"
 */
export function resultTimelineOf(match: RankingMatch, names: ResultTimelineNames): StatusTimelineEvent[] {
  const events = [...undoneEvents(match, names), ...currentEvents(match, names)];
  return events.sort((first, second) => Date.parse(first.at) - Date.parse(second.at));
}

function undoneEvents(match: RankingMatch, names: ResultTimelineNames): StatusTimelineEvent[] {
  return match.undone_reports.flatMap((undone, index) => [
    reportEvent(undone, names, `undone-${index}`),
    { id: `undo-${index}`, actor: who(undone.reported_by, names), action: "desfez o lançamento", at: undone.undone_at },
  ]);
}

function currentEvents(match: RankingMatch, names: ResultTimelineNames): StatusTimelineEvent[] {
  switch (match.status) {
    case "awaiting_confirmation":
      return [reportEvent(match.report, names, "report")];
    case "in_arbitration":
      return [reportEvent(match.report, names, "report"), contestEvent(match, names)];
    case "confirmed":
      return confirmedEvents(match, names);
    case "cancelled":
      return [cancelledEvent(match, names)];
    case "defined":
    case "not_played":
      return [];
  }
}

function reportEvent(report: ResultReport, names: ResultTimelineNames, id: string): StatusTimelineEvent {
  return {
    id,
    actor: who(report.reported_by, names),
    action: "lançou o resultado",
    detail: resultLine(report.result, names.sides),
    at: report.reported_at,
  };
}

function contestEvent(match: Extract<RankingMatch, { status: "in_arbitration" }>, names: ResultTimelineNames) {
  const { contest } = match;
  const remembered =
    contest.reason === "different_score" && contest.remembered_result !== null
      ? `. Lembra ${resultLine(contest.remembered_result, names.sides)}`
      : "";
  return {
    id: "contest",
    actor: who(contest.responded_by, names),
    action: "contestou o resultado",
    detail: `${CONTEST_REASON_LABEL[contest.reason]}${remembered}`,
    at: contest.responded_at,
  };
}

function confirmedEvents(match: Extract<RankingMatch, { status: "confirmed" }>, names: ResultTimelineNames) {
  const events: StatusTimelineEvent[] = match.report ? [reportEvent(match.report, names, "report")] : [];
  events.push(confirmationEvent(match, names));
  if (match.correction) {
    events.push({
      id: "correction",
      actor: who(match.correction.admin_id, names),
      actorRole: "admin",
      action: "corrigiu o placar",
      detail: resultLine(match.result, names.sides),
      at: match.correction.acted_at,
    });
  }
  return events;
}

function confirmationEvent(match: Extract<RankingMatch, { status: "confirmed" }>, names: ResultTimelineNames) {
  const { confirmation } = match;
  if (confirmation.via === "opponent") {
    return { id: "confirmation", actor: who(confirmation.responded_by, names), action: "confirmou o resultado", at: confirmation.responded_at };
  }
  if (confirmation.via === "deadline") {
    return { id: "confirmation", action: "O prazo de resposta acabou e o resultado foi confirmado.", at: confirmation.confirmed_at };
  }
  // Sem lançamento, o admin decidiu a partida não realizada (R40); com ele, arbitrou a contestação
  return {
    id: "confirmation",
    actor: who(confirmation.admin_id, names),
    actorRole: "admin",
    action: match.report ? "definiu o resultado" : "decidiu a partida não realizada",
    detail: resultLine(match.result, names.sides),
    at: confirmation.acted_at,
  };
}

function cancelledEvent(match: Extract<RankingMatch, { status: "cancelled" }>, names: ResultTimelineNames) {
  return {
    id: "cancellation",
    actor: who(match.cancellation.admin_id, names),
    actorRole: "admin",
    action: match.reason === "annulled" ? "anulou o resultado" : "cancelou a partida",
    at: match.cancellation.acted_at,
  };
}

function who(playerId: string, names: ResultTimelineNames): string {
  return actorName(playerId, names.viewerId, names.people);
}
