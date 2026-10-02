"use client";

import { useState } from "react";
import {
  cancelFriendly,
  confirmFriendly,
  contestFriendly,
  MatchTransitionError,
  type TransitionActor,
} from "@/src/lib/domain/match-state";
import type { FriendlyMatch } from "@/src/types/domain";
import { friendlyErrorMessage, type FriendlyAction } from "./friendlyResultTexts";
import type { FriendlyScreenData } from "./friendlyScreenData";

/** Folha aberta: contestar, que avisa antes (§6.2), ou o menu de cancelar de quem lançou. */
export type FriendlyDialog = "contest" | "cancel" | null;

type FriendlyTransition = (match: FriendlyMatch, actor: TransitionActor) => FriendlyMatch;

/**
 * Confirmar, contestar e cancelar o amistoso (docs/RESULTS.md §6.2), pelas
 * mesmas funções puras que o banco vai usar. Enquanto os dados são mocks, a
 * ação muda só o amistoso em memória.
 */
export function useFriendlyResult(data: FriendlyScreenData, clock: () => string) {
  const [match, setMatch] = useState<FriendlyMatch>(data.match);
  const [dialog, setDialog] = useState<FriendlyDialog>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = (action: FriendlyAction, transition: FriendlyTransition) => {
    try {
      setMatch(transition(match, { playerId: data.viewerId, at: clock() }));
      setDialog(null);
      setError(null);
    } catch (caught) {
      if (!(caught instanceof MatchTransitionError)) throw caught;
      setError(friendlyErrorMessage(caught.code, action));
    }
  };

  return {
    match,
    dialog,
    error,
    openDialog: (next: FriendlyDialog) => {
      setDialog(next);
      setError(null);
    },
    confirm: () => apply("respond", (m, actor) => confirmFriendly(m, actor, data.sides)),
    contest: () => apply("respond", (m, actor) => contestFriendly(m, actor, data.sides)),
    cancel: () => apply("cancel", cancelFriendly),
  };
}

export type FriendlyResultActions = ReturnType<typeof useFriendlyResult>;
