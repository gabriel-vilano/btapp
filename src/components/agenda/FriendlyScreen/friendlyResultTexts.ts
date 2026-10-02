import type { MatchTransitionErrorCode } from "@/src/lib/domain/match-state";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import { formatEventMoment, formatTimestamp } from "@/src/lib/formatters";
import type { FriendlyMatch } from "@/src/types/domain";
import type { ResultViewerRole } from "../MatchResult/resultRole";
import { actorName, sideOr } from "../MatchResult/resultTexts";
import type { FriendlyScreenData } from "./friendlyScreenData";

// Textos do amistoso na tela da partida (docs/RESULTS.md §6.2), escritos para
// quem está vendo. Sem prazo (R43): no lugar da contagem, há quanto tempo foi lançado.

type Awaiting = Extract<FriendlyMatch, { status: "awaiting_confirmation" }>;

/** Quem pode confirmar: o lado adversário de quem lançou. Ex.: "Thiago ou André". */
export function friendlyRespondersOf(match: FriendlyMatch, data: FriendlyScreenData): string {
  const responderSide = sideOfPlayer(data.sides, match.report.reported_by) === "a" ? "b" : "a";
  return sideOr(data.sides[responderSide], data.playerNames);
}

/**
 * Título do cartão pendente, conforme o papel de quem vê.
 * @example awaitingFriendlyTitle(match, data, "responder") // "Pedro lançou o amistoso"
 */
export function awaitingFriendlyTitle(match: Awaiting, data: FriendlyScreenData, role: ResultViewerRole): string {
  if (role === "responder") return `${actorName(match.report.reported_by, data.viewerId, data.playerNames)} lançou o amistoso`;
  if (role === "outsider") return "Amistoso lançado";
  return `Aguardando ${friendlyRespondersOf(match, data)}`;
}

/**
 * Há quanto tempo foi lançado, no lugar do prazo que o amistoso não tem (§6.2).
 * @example reportedAgoLine(match, data, "responder", now) // "Lançado há 3 dias."
 */
export function reportedAgoLine(match: Awaiting, data: FriendlyScreenData, role: ResultViewerRole, now: string): string {
  const ago = formatTimestamp(match.report.reported_at, Date.parse(now));
  if (role === "responder") return `Lançado ${ago}.`;
  const reporter = actorName(match.report.reported_by, data.viewerId, data.playerNames);
  if (role === "outsider") return `${reporter} lançou ${ago}. Aguardando ${friendlyRespondersOf(match, data)}.`;
  return `${reporter} lançou ${ago}.`;
}

/** @example confirmedLine("player-pedro", "2026-10-01T12:00:00Z", data) // "Confirmado por Pedro · qui, 01/10, 9h" */
export function confirmedLine(playerId: string, at: string, data: FriendlyScreenData): string {
  const who = actorName(playerId, data.viewerId, data.playerNames);
  return `Confirmado por ${who === "Você" ? "você" : who} · ${formatEventMoment(at)}`;
}

/**
 * A contestação descarta o amistoso, sem admin (R43).
 * @example discardedLine("player-ana", at, data) // "Ana contestou · sex, 25/09, 21h. Para valer, um dos lados lança de novo."
 */
export function discardedLine(playerId: string, at: string, data: FriendlyScreenData): string {
  const who = actorName(playerId, data.viewerId, data.playerNames);
  return `${who} contestou · ${formatEventMoment(at)}. Para valer, um dos lados lança de novo.`;
}

/**
 * Só quem lançou cancela (R43).
 * @example cancelledLine(match, data) // "Você cancelou · dom, 27/09, 19h."
 */
export function cancelledLine(match: Extract<FriendlyMatch, { status: "cancelled" }>, data: FriendlyScreenData): string {
  return `${actorName(match.report.reported_by, data.viewerId, data.playerNames)} cancelou · ${formatEventMoment(match.cancelled_at)}.`;
}

/** O que o jogador tentou fazer: a mesma recusa pede mensagens diferentes. */
export type FriendlyAction = "respond" | "cancel";

/**
 * Mensagem quando o domínio recusa a ação, escolhida pelo `code`. Com os
 * mocks não acontece; com o Supabase, é o outro lado responder primeiro ou
 * quem lançou cancelar com a tela aberta.
 * @example friendlyErrorMessage("not_allowed", "cancel") // "Só quem lançou pode cancelar o amistoso."
 */
export function friendlyErrorMessage(code: MatchTransitionErrorCode, action: FriendlyAction): string {
  switch (code) {
    case "invalid_status":
      return "O amistoso mudou enquanto você estava na tela. Confira o estado dele.";
    case "not_allowed":
      return action === "cancel" ? "Só quem lançou pode cancelar o amistoso." : "Só o outro lado responde ao amistoso.";
    default:
      return "Não deu para fazer isso neste amistoso.";
  }
}
