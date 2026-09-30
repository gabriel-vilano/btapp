import { responseDeadline } from "@/src/lib/domain/match-state";
import { matchPoints } from "@/src/lib/domain/matchPoints";
import { completeRetiredScore } from "@/src/lib/domain/matchScore";
import { formatEventMoment } from "@/src/lib/formatters";
import type {
  MatchFormat,
  MatchSet,
  MatchSideKey,
  ReportableResult,
  RetiredResult,
  ScoringRule,
} from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";
import { otherSide } from "./reportResultModel";

// Textos da revisão do lançamento (docs/RESULTS.md RG6, RG7 e RG14), escritos
// do ponto de vista de quem lança: "+110 para vocês, +40 para Lucas e Rafael".

/** Como a frase se refere aos lados. Sem `userSide` (admin), todo lado é pelo nome. */
export interface SideVoice {
  names: Record<MatchSideKey, string>;
  userSide: MatchSideKey | null;
  isSingles: boolean;
}

function reference(side: MatchSideKey, voice: SideVoice): string {
  if (side !== voice.userSide) return voice.names[side];
  return voice.isSingles ? "você" : "vocês";
}

function firstSide(voice: SideVoice): MatchSideKey {
  return voice.userSide ?? "a";
}

/** @example winnerLine({ type: "wo", winner: "a" }, voice) // "Vitória de vocês" */
export function winnerLine(result: ReportableResult, voice: SideVoice): string {
  return `Vitória de ${reference(result.winner, voice)}`;
}

function signed(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}

/**
 * Pontos previstos, só no ranking (RG14). Na desistência, contam do placar completado (R11).
 * @example pointsPreview(result, "one_set_of_6", rule, voice) // "Se confirmado: +104 para vocês, +46 para Lucas e Rafael."
 */
export function pointsPreview(result: ReportableResult, format: MatchFormat, rule: ScoringRule, voice: SideVoice): string {
  const points = matchPoints(result, format, rule);
  const first = firstSide(voice);
  const second = otherSide(first);
  return `Se confirmado: ${signed(points[first])} para ${reference(first, voice)}, ${signed(points[second])} para ${reference(second, voice)}.`;
}

function setText(set: MatchSet, first: MatchSideKey): string {
  const score = first === "a" ? `${set.games_a}/${set.games_b}` : `${set.games_b}/${set.games_a}`;
  return set.super_tiebreak ? `${score} (STB)` : score;
}

/**
 * Placar completado pelo formato, que é o que pontua na desistência (RG6).
 * @example completedScoreText(result, "two_sets_of_6_stb", voice) // "Para os pontos, o placar vale como 6/4 6/2, completado pelo formato."
 */
export function completedScoreText(result: RetiredResult, format: MatchFormat, voice: SideVoice): string {
  const completed = completeRetiredScore(result, format).map((set) => setText(set, firstSide(voice)));
  return `Para os pontos, o placar vale como ${completed.join(" ")}, completado pelo formato.`;
}

/** Primeiros nomes do lado adversário de quem lança, ligados por "ou". Ex.: "Lucas ou Rafael". */
export function opponentsOr(data: ReportResultData, reporterSide: MatchSideKey): string {
  return data.sides[otherSide(reporterSide)].map((id) => data.playerNames[id]).join(" ou ");
}

/**
 * Prazo de resposta de quem confirma (RG7), contado a partir de agora.
 * @example responseDeadlineText(data, "a", now) // "Caio ou Diego têm até qui, 02/10, 20h, para confirmar. Sem resposta, o resultado vale."
 */
export function responseDeadlineText(data: ReportResultData, reporterSide: MatchSideKey, reportedAt: string): string {
  if (data.ranking === null) return "O resultado vale na hora e aparece no feed.";
  const deadline = responseDeadline(reportedAt, data.ranking.responseDeadlineHours);
  const verb = data.isSingles ? "tem" : "têm";
  return `${opponentsOr(data, reporterSide)} ${verb} até ${formatEventMoment(deadline)}, para confirmar. Sem resposta, o resultado vale.`;
}
