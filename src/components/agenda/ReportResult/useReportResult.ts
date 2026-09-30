"use client";

import { useState } from "react";
import {
  draftToResult,
  EMPTY_SCORE_DRAFT,
  type ScoreDraft,
  type ScoreDraftResult,
  type ScoreInputType,
} from "@/src/components/ui/ScoreInput";
import type { CompetitionMatch, MatchFormat, MatchSideKey, ReportableResult } from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";
import { viewerSideOf, type ReporterRole } from "./reportResultModel";
import { scoreErrorMessage } from "./scoreErrorMessage";
import { reportLocally, type ReportOutcome, type ReportRequest, type SubmitReport } from "./submitReport";
import { transitionErrorMessage } from "./transitionErrorMessage";

export type SendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "network_error" }
  /** `canFix`: o placar foi recusado e o jogador corrige; sem ele, a partida mudou e não adianta reenviar. */
  | { kind: "rejected"; message: string; canFix: boolean }
  | { kind: "sent"; match: CompetitionMatch; at: string };

export interface ReportResultOptions {
  /** "Agora" do primeiro render, em ISO 8601. */
  initialNow: string;
  /** Relógio das ações. */
  clock: () => string;
  submit?: SubmitReport;
}

/**
 * Estado do fluxo de lançar (docs/RESULTS.md §3): como terminou, o rascunho do
 * placar, a revisão e o envio. Uma falha de rede mantém tudo o que foi
 * preenchido (RG8); uma recusa do servidor vira a mensagem da §3.7.
 */
export function useReportResult(data: ReportResultData, role: ReporterRole, { initialNow, clock, submit }: ReportResultOptions) {
  const [type, setType] = useState<ScoreInputType>("normal");
  const [draft, setDraft] = useState<ScoreDraft>(EMPTY_SCORE_DRAFT);
  const [format, setFormat] = useState<MatchFormat>(data.match.format);
  const [adminWinner, setAdminWinner] = useState<MatchSideKey | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  // Momento da revisão: o prazo de resposta que ela mostra conta a partir dele (RG7)
  const [reviewAt, setReviewAt] = useState(initialNow);
  const [sendState, setSendState] = useState<SendState>({ kind: "idle" });
  const [current, setCurrent] = useState<CompetitionMatch>(data.match);

  const userSide = role === "player" ? (viewerSideOf(data) ?? "a") : (adminWinner ?? "a");
  const needsAdminWinner = role === "admin" && type !== "normal" && adminWinner === null;
  const result: ScoreDraftResult = needsAdminWinner ? { status: "incomplete" } : draftToResult(draft, { format, type, userSide });

  const applyOutcome = (outcome: ReportOutcome, request: ReportRequest) => {
    if (outcome.status === "reported") {
      setCurrent(outcome.match);
      setReviewOpen(false);
      setSendState({ kind: "sent", match: outcome.match, at: request.at });
      return;
    }
    if (outcome.status === "transition_rejected") setCurrent(outcome.current);
    setSendState(rejectionOf(outcome, request, data));
  };

  const send = async () => {
    if (result.status !== "valid" || sendState.kind === "sending") return;
    const request: ReportRequest = { result: result.result, format, at: clock() };
    setSendState({ kind: "sending" });
    const submitReport = submit ?? ((match, req) => Promise.resolve(reportLocally(match, req, data)));
    try {
      applyOutcome(await submitReport(current, request), request);
    } catch {
      setSendState({ kind: "network_error" });
    }
  };

  return {
    type,
    setType,
    draft,
    setDraft,
    format,
    // O rascunho de um formato não vale em outro: recomeça
    changeFormat: (next: MatchFormat) => {
      setFormat(next);
      setDraft(EMPTY_SCORE_DRAFT);
    },
    adminWinner,
    setAdminWinner,
    userSide,
    result,
    reviewOpen,
    reviewAt,
    openReview: () => {
      setReviewAt(clock());
      setReviewOpen(true);
    },
    closeReview: () => {
      setReviewOpen(false);
      if (sendState.kind !== "sending") setSendState({ kind: "idle" });
    },
    send,
    sendState,
  };
}

export type ReportResultState = ReturnType<typeof useReportResult>;

function rejectionOf(outcome: Exclude<ReportOutcome, { status: "reported" }>, request: ReportRequest, data: ReportResultData): SendState {
  if (outcome.status === "score_rejected") {
    const sets = scoredSets(request.result);
    return { kind: "rejected", message: scoreErrorMessage(outcome.code, request.format, sets), canFix: true };
  }
  return { kind: "rejected", message: transitionErrorMessage(outcome.code, data, outcome.current), canFix: false };
}

function scoredSets(result: ReportableResult) {
  return result.type === "wo" ? [] : result.sets;
}
