"use client";

import { useState } from "react";
import { EMPTY_SIDE_SLOTS, slotsForModality, type SideModality, type SideSlots } from "@/src/components/ui/SidePicker";
import {
  draftToResult,
  EMPTY_SCORE_DRAFT,
  type ScoreDraft,
  type ScoreDraftResult,
} from "@/src/components/ui/ScoreInput";
import { brasiliaToday } from "@/src/lib/brasiliaDateTime";
import type { FriendlyMatch, MatchFormat } from "@/src/types/domain";
import { scoreErrorMessage } from "../ReportResult/scoreErrorMessage";
import type { FriendlyReportData } from "./friendlyReportData";
import { defaultFriendlyFormat, friendlySidesOf, playedAtOf, playedOnError, venueOf } from "./friendlyReportModel";
import {
  reportFriendlyLocally,
  type FriendlyReportOutcome,
  type FriendlyReportRequest,
  type SubmitFriendly,
} from "./submitFriendly";

/** Amistoso só termina em jogo normal ou desistência: não há W.O. (R44). */
export type FriendlyOutcomeType = "normal" | "retired";

export type FriendlySendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "network_error" }
  | { kind: "rejected"; message: string }
  | { kind: "sent"; match: FriendlyMatch };

export interface FriendlyReportOptions {
  /** "Agora" do primeiro render, em ISO 8601: dá o "hoje" padrão da data. */
  initialNow: string;
  /** Relógio das ações. */
  clock: () => string;
  submit?: SubmitFriendly;
  createId: () => string;
}

// Os lados vêm do SidePicker, e o vencedor da desistência é sempre quem lança
// (RG4): sobra só o caso de o domínio recusar algo que a tela não deixou montar
const TRANSITION_REJECTED = "Não conseguimos registrar o amistoso. Confira os lados e o placar e tente de novo.";

/**
 * Estado da tela de registrar o amistoso (docs/RESULTS.md §6.1): modalidade,
 * lados, data e arena, formato, como terminou, o placar e o envio. Uma falha
 * de rede mantém tudo o que foi preenchido (RG8).
 */
export function useFriendlyReport(data: FriendlyReportData, options: FriendlyReportOptions) {
  const { initialNow, clock, submit, createId } = options;
  const [modality, setModality] = useState<SideModality>("doubles");
  const [slots, setSlots] = useState<SideSlots>(EMPTY_SIDE_SLOTS);
  const [playedOn, setPlayedOn] = useState(() => brasiliaToday(new Date(initialNow)));
  const [venue, setVenue] = useState("");
  const [format, setFormat] = useState<MatchFormat>(defaultFriendlyFormat(data.lastFormat));
  const [type, setType] = useState<FriendlyOutcomeType>("normal");
  const [draft, setDraft] = useState<ScoreDraft>(EMPTY_SCORE_DRAFT);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [sendState, setSendState] = useState<FriendlySendState>({ kind: "idle" });

  const sides = friendlySidesOf(data.viewer.id, slots, modality);
  const dateError = playedOnError(playedOn, initialNow);
  const result: ScoreDraftResult = draftToResult(draft, { format, type, userSide: "a" });
  const canReview = sides !== null && dateError === null && result.status === "valid";

  const send = async () => {
    if (sides === null || result.status !== "valid" || result.result.type === "wo" || sendState.kind === "sending") return;
    const request: FriendlyReportRequest = {
      sides,
      format,
      played_at: playedAtOf(playedOn),
      venue: venueOf(venue),
      result: result.result,
      at: clock(),
    };
    setSendState({ kind: "sending" });
    const submitFriendly = submit ?? ((req) => Promise.resolve(reportFriendlyLocally(req, { viewerId: data.viewer.id, createId })));
    try {
      const outcome = await submitFriendly(request);
      setSendState(sendStateOf(outcome, request));
      if (outcome.status === "reported") setReviewOpen(false);
    } catch {
      setSendState({ kind: "network_error" });
    }
  };

  return {
    modality,
    // Simples tem menos vagas: quem sobra sai do lado (SidePicker)
    changeModality: (next: SideModality) => {
      setModality(next);
      setSlots(slotsForModality(slots, next));
    },
    slots,
    setSlots,
    sides,
    playedOn,
    setPlayedOn,
    dateError,
    venue,
    setVenue,
    format,
    // O rascunho de um formato não vale em outro: recomeça
    changeFormat: (next: MatchFormat) => {
      setFormat(next);
      setDraft(EMPTY_SCORE_DRAFT);
    },
    type,
    setType,
    draft,
    setDraft,
    result,
    canReview,
    reviewOpen,
    openReview: () => setReviewOpen(true),
    closeReview: () => {
      setReviewOpen(false);
      if (sendState.kind !== "sending") setSendState({ kind: "idle" });
    },
    send,
    sendState,
  };
}

export type FriendlyReportState = ReturnType<typeof useFriendlyReport>;

// A recusa vira a mensagem da revisão, que continua aberta para corrigir
function sendStateOf(outcome: FriendlyReportOutcome, request: FriendlyReportRequest): FriendlySendState {
  if (outcome.status === "reported") return { kind: "sent", match: outcome.match };
  if (outcome.status === "score_rejected") {
    return { kind: "rejected", message: scoreErrorMessage(outcome.code, request.format, request.result.sets) };
  }
  return { kind: "rejected", message: TRANSITION_REJECTED };
}
