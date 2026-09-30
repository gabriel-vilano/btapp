import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import type { MatchFormat, MatchSideKey } from "@/src/types/domain";
import type { ScoreInputType } from "@/src/components/ui/ScoreInput";
import type { ReportResultData } from "./reportResultData";

// Quem lança e como a tela se refere a cada lado (docs/RESULTS.md §3.1, §3.2 e §5.3).

/** Jogador no ranking (R13); admin no torneio (R38). */
export type ReporterRole = "player" | "admin";

/**
 * Papel de quem vê no lançamento, ou `null` quando ele não pode lançar.
 * @example reporterRoleOf(data) // "player" para o Lucas na partida dele do ranking
 */
export function reporterRoleOf(data: ReportResultData): ReporterRole | null {
  if (data.match.kind === "tournament") return data.adminIds.includes(data.viewerId) ? "admin" : null;
  return sideOfPlayer(data.sides, data.viewerId) === null ? null : "player";
}

/** Lado de quem vê, se ele joga a partida. */
export function viewerSideOf(data: ReportResultData): MatchSideKey | null {
  return sideOfPlayer(data.sides, data.viewerId);
}

export function otherSide(side: MatchSideKey): MatchSideKey {
  return side === "a" ? "b" : "a";
}

/**
 * Nome dos lados como a tela escreve: o do jogador vira "Você e Pedro" (RG3).
 * O admin vê os nomes dos dois lados.
 * @example displaySideNames(data, "player") // { a: "Você e Rafael", b: "Caio e Diego" }
 */
export function displaySideNames(data: ReportResultData, role: ReporterRole): Record<MatchSideKey, string> {
  const viewerSide = viewerSideOf(data);
  if (role === "admin" || viewerSide === null) return data.sideNames;
  const partners = data.sides[viewerSide].filter((id) => id !== data.viewerId).map((id) => data.playerNames[id]);
  return { ...data.sideNames, [viewerSide]: ["Você", ...partners].join(" e ") };
}

/** Os dois lados na ordem da tela: o do jogador em cima (RG3). */
export function sidesInDisplayOrder(data: ReportResultData): MatchSideKey[] {
  return viewerSideOf(data) === "b" ? ["b", "a"] : ["a", "b"];
}

const FORMAT_LABELS: Record<MatchFormat, string> = {
  one_set_of_6: "1 set de 6",
  one_set_of_8: "1 set de 8",
  two_sets_of_6_stb: "2 sets de 6 + super tiebreak",
};

export const MATCH_FORMATS = Object.keys(FORMAT_LABELS) as MatchFormat[];

/** @example formatLabel("one_set_of_6") // "1 set de 6" */
export function formatLabel(format: MatchFormat): string {
  return FORMAT_LABELS[format];
}

/**
 * Linha de contexto do cabeçalho: competição, categoria e rodada ou fase.
 * @example matchContextLine(data) // "Ranking Arena Mangaba · Masculino B · Rodada 3"
 */
export function matchContextLine(data: ReportResultData): string {
  return [data.competitionName, data.categoryName, stageLabel(data)].filter(Boolean).join(" · ");
}

function stageLabel(data: ReportResultData): string | null {
  if (data.ranking) return `Rodada ${data.ranking.roundNumber}`;
  return data.match.kind === "tournament" ? data.match.stage : null;
}

// Do ponto de vista de quem lança: desistência e W.O. são sempre a favor dele
// (RG4). O admin escolhe o vencedor, então as opções não falam por um lado.
const OUTCOME_LABELS: Record<ReporterRole, Record<ScoreInputType, string>> = {
  player: { normal: "Jogamos até o fim", retired: "Adversário desistiu", wo: "Adversário não veio" },
  admin: { normal: "Jogaram até o fim", retired: "Desistência", wo: "W.O." },
};

export const OUTCOME_TYPES: ScoreInputType[] = ["normal", "retired", "wo"];

/** @example outcomeLabel("retired", "player") // "Adversário desistiu" */
export function outcomeLabel(type: ScoreInputType, role: ReporterRole): string {
  return OUTCOME_LABELS[role][type];
}

/**
 * Pergunta do vencedor para o admin, que não passa pela RG4 (§5.3).
 * @example adminWinnerQuestion("wo") // "Quem compareceu?"
 */
export function adminWinnerQuestion(type: Exclude<ScoreInputType, "normal">): string {
  return type === "wo" ? "Quem compareceu?" : "Quem venceu? O outro lado desistiu.";
}
