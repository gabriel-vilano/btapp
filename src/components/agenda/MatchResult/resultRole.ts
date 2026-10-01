import type { MatchSidePlayers } from "@/src/lib/domain/match-state";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import type { ResultReport } from "@/src/types/domain";

/**
 * Papel de quem vê diante de um lançamento (R13, docs/RESULTS.md §4):
 * - `reporter`: lançou, e só ele desfaz (RG16);
 * - `reporter_partner`: parceiro de quem lançou, só acompanha;
 * - `responder`: lado adversário, confirma ou contesta;
 * - `outsider`: não está na partida, vê sem ações.
 */
export type ResultViewerRole = "reporter" | "reporter_partner" | "responder" | "outsider";

/** @example resultRoleOf(match.report, sides, viewerId) // "responder" */
export function resultRoleOf(report: ResultReport, sides: MatchSidePlayers, viewerId: string): ResultViewerRole {
  const viewerSide = sideOfPlayer(sides, viewerId);
  if (viewerSide === null) return "outsider";
  if (viewerId === report.reported_by) return "reporter";
  return viewerSide === sideOfPlayer(sides, report.reported_by) ? "reporter_partner" : "responder";
}
