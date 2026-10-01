"use client";

import { useState } from "react";
import {
  confirmRankingResult,
  contestRankingResult,
  MatchTransitionError,
  undoRankingReport,
  type RankingMatchContext,
  type TransitionActor,
} from "@/src/lib/domain/match-state";
import { matchPoints } from "@/src/lib/domain/matchPoints";
import type { RankingMatch } from "@/src/types/domain";
import type { MatchResultActions, ResultDialog } from "../MatchResult";
import type { MatchScreenData } from "./matchScreenData";
import { resultErrorMessage, type ResultAction } from "./resultErrorMessage";

type ResultTransition = (match: RankingMatch, actor: TransitionActor, context: RankingMatchContext) => RankingMatch;

interface MatchResultInput {
  match: RankingMatch;
  setMatch: (match: RankingMatch) => void;
  data: MatchScreenData;
  /** Relógio das ações, em ISO 8601. */
  clock: () => string;
}

/**
 * Respostas ao resultado na tela do confronto (docs/RESULTS.md §4): confirmar,
 * contestar e desfazer, pelas mesmas funções puras que o banco vai usar. A
 * partida fica com quem chama, porque a marcação também depende dela: desfeito
 * o lançamento, a marcação volta a valer.
 */
export function useMatchResult({ match, setMatch, data, clock }: MatchResultInput): MatchResultActions {
  const [dialog, setDialog] = useState<ResultDialog>(null);
  const [error, setError] = useState<string | null>(null);
  const context: RankingMatchContext = {
    sides: data.sides,
    responseDeadlineHours: data.responseDeadlineHours,
    roundDeadline: data.roundDeadline,
    score: (result, format) => matchPoints(result, format, data.scoringRule),
  };

  const apply = (action: ResultAction, transition: ResultTransition) => {
    try {
      setMatch(transition(match, { playerId: data.viewerId, at: clock() }, context));
      setDialog(null);
      setError(null);
    } catch (caught) {
      if (!(caught instanceof MatchTransitionError)) throw caught;
      setError(resultErrorMessage(caught.code, action));
    }
  };

  return {
    dialog,
    error,
    openDialog: (next) => {
      setDialog(next);
      setError(null);
    },
    confirm: () => apply("respond", confirmRankingResult),
    contest: (details) => apply("respond", (m, actor, ctx) => contestRankingResult(m, details, actor, ctx)),
    undo: () => apply("undo", undoRankingReport),
  };
}
