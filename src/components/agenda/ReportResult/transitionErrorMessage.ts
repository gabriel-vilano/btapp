import type { MatchTransitionErrorCode } from "@/src/lib/domain/match-state";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import { formatEventMoment } from "@/src/lib/formatters";
import type { CompetitionMatch } from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";

// Mensagem ao jogador quando o servidor recusa o lançamento porque o estado
// mudou enquanto ele preenchia (docs/RESULTS.md §3.7). Escolhida pelo `code`,
// não pelo texto do erro, que é para quem depura.

/**
 * Mensagem de um `code` do `MatchTransitionError`. `current` é a partida como
 * está agora no servidor: é ela que diz quem lançou primeiro.
 * @example transitionErrorMessage("too_late", data, data.match) // "A rodada fechou em dom, 05/10, 23h59. …"
 */
export function transitionErrorMessage(
  code: MatchTransitionErrorCode,
  data: ReportResultData,
  current: CompetitionMatch,
): string {
  switch (code) {
    case "invalid_status":
      return changedStatusMessage(data, current);
    case "too_late":
      return tooLateMessage(data);
    case "not_allowed":
      return notAllowedMessage(data);
    case "invalid_result":
      return "Na desistência e no W.O., a vitória fica com quem lança. Confira como terminou.";
    case "too_early":
      return "Ainda não dá para lançar o resultado desta partida.";
  }
}

/** Mensagem de quem não pode lançar: fora da partida (R45) ou, no torneio, quem não é admin (R38). */
export function notAllowedMessage(data: ReportResultData): string {
  if (data.match.kind === "tournament") return "Só o admin do torneio lança este resultado.";
  return "Você não está nesta partida.";
}

function tooLateMessage(data: ReportResultData): string {
  if (data.ranking === null) return "O prazo para lançar este resultado acabou.";
  return `A rodada fechou em ${formatEventMoment(data.ranking.roundDeadline)}. A partida foi para o admin.`;
}

/**
 * A partida saiu de Confronto definido. O caso comum é outro jogador ter
 * lançado primeiro (R13): o parceiro ou o adversário.
 */
export function changedStatusMessage(data: ReportResultData, current: CompetitionMatch): string {
  switch (current.status) {
    case "awaiting_confirmation":
      return alreadyReportedMessage(data, current.report.reported_by);
    case "in_arbitration":
      return "O resultado desta partida foi contestado e está com o admin.";
    case "confirmed":
      return "O resultado desta partida já foi confirmado.";
    case "not_played":
      return "O prazo da rodada acabou e a partida foi para o admin.";
    case "cancelled":
      return "Esta partida foi cancelada pelo admin.";
    case "defined":
      return "A partida mudou enquanto você preenchia. Confira o estado dela.";
  }
}

function alreadyReportedMessage(data: ReportResultData, reporterId: string): string {
  if (reporterId === data.viewerId) return "Você já lançou este resultado.";
  const name = data.playerNames[reporterId] ?? "Outro jogador";
  const reporterSide = sideOfPlayer(data.sides, reporterId);
  if (reporterSide !== null && reporterSide === sideOfPlayer(data.sides, data.viewerId)) {
    return `${name} já lançou este resultado.`;
  }
  return `${name} já lançou o resultado. Confira e confirme ou conteste.`;
}
