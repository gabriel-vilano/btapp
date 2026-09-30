import {
  MatchTransitionError,
  reportRankingResult,
  reportTournamentResult,
  type MatchTransitionErrorCode,
  type TransitionActor,
} from "@/src/lib/domain/match-state";
import { matchPoints } from "@/src/lib/domain/matchPoints";
import { validateScore, type ScoreErrorCode } from "@/src/lib/domain/matchScore";
import type { CompetitionMatch, MatchFormat, ReportableResult } from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";

// Envio do lançamento. A resposta do servidor é um destes três desfechos; a
// falha de rede é a promessa rejeitada (RG8). Enquanto os dados são mocks, o
// "servidor" é `reportLocally`, com as mesmas funções puras que o banco vai usar.

export interface ReportRequest {
  result: ReportableResult;
  /** No torneio, o admin pode trocar o formato só desta partida (R29). */
  format: MatchFormat;
  at: string; // ISO 8601
}

export type ReportOutcome =
  | { status: "reported"; match: CompetitionMatch }
  | { status: "score_rejected"; code: ScoreErrorCode }
  /** `current` é a partida como está no servidor: diz, por exemplo, quem lançou primeiro. */
  | { status: "transition_rejected"; code: MatchTransitionErrorCode; current: CompetitionMatch };

/** Envia o lançamento de `current`, a partida como a tela a conhece. */
export type SubmitReport = (current: CompetitionMatch, request: ReportRequest) => Promise<ReportOutcome>;

/**
 * O servidor valida o placar de novo (§3.7) e aplica a transição: no ranking,
 * a partida vai para Aguardando confirmação (R13); no torneio, nasce confirmada (R38).
 * @example reportLocally(data.match, { result, format: data.match.format, at: now }, data)
 */
export function reportLocally(current: CompetitionMatch, request: ReportRequest, data: ReportResultData): ReportOutcome {
  if (request.result.type !== "wo") {
    const check = validateScore(request.result, request.format);
    if (!check.valid) return { status: "score_rejected", code: check.code };
  }
  try {
    return { status: "reported", match: applyTransition(current, request, data) };
  } catch (caught) {
    if (!(caught instanceof MatchTransitionError)) throw caught;
    return { status: "transition_rejected", code: caught.code, current };
  }
}

function applyTransition(current: CompetitionMatch, request: ReportRequest, data: ReportResultData): CompetitionMatch {
  const actor: TransitionActor = { playerId: data.viewerId, at: request.at };
  if (current.kind === "tournament") {
    return reportTournamentResult({ ...current, format: request.format }, request.result, actor, data);
  }
  const ranking = data.ranking;
  if (ranking === null) throw new Error(`Partida de ranking '${current.id}' sem o contexto do ranking`);
  return reportRankingResult(current, request.result, actor, {
    sides: data.sides,
    responseDeadlineHours: ranking.responseDeadlineHours,
    roundDeadline: ranking.roundDeadline,
    score: (result, format) => matchPoints(result, format, ranking.scoringRule),
  });
}
