"use client";

import { useState } from "react";
import {
  acceptScheduleOption,
  expireProposals,
  proposeSchedule,
  reportScheduleDate,
  scheduleViewOf,
  ScheduleError,
  withdrawScheduleProposal,
  type ScheduleActor,
  type ScheduleContext,
  type ScheduleView,
} from "@/src/lib/domain/schedule-state";
import type { ScheduleHistory, ScheduleOption } from "@/src/types/domain";
import type { ScheduleFormMode } from "../ScheduleForm";
import type { MatchScreenData } from "./matchScreenData";
import { scheduleErrorMessage } from "./scheduleErrorMessage";

type Transition = (history: ScheduleHistory, actor: ScheduleActor, context: ScheduleContext) => ScheduleHistory;

export interface MatchSchedulingClock {
  /** "Agora" do primeiro render, em ISO 8601. */
  initialNow: string;
  /** Relógio das ações. */
  clock: () => string;
  /** Id da proposta ou da data nova. */
  createId: () => string;
}

export interface MatchSchedulingState {
  history: ScheduleHistory;
  view: ScheduleView;
  now: string;
  form: ScheduleFormMode | null;
  error: string | null;
  openForm: (mode: ScheduleFormMode | null) => void;
  accept: (optionIndex: number) => void;
  withdraw: () => void;
  submitForm: (options: ScheduleOption[]) => void;
}

/**
 * Estado da marcação na tela do confronto: o histórico em memória, o estado
 * derivado dele e as ações, que passam pelas funções puras do domínio. Uma
 * recusa do domínio (ScheduleError) vira a mensagem de `error`.
 */
export function useMatchScheduling(data: MatchScreenData, { initialNow, clock, createId }: MatchSchedulingClock) {
  const [history, setHistory] = useState(data.history);
  const [now, setNow] = useState(initialNow);
  const [form, setForm] = useState<ScheduleFormMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const context: ScheduleContext = { match: data.match, sides: data.sides, roundDeadline: data.roundDeadline };

  const apply = (transition: Transition) => {
    const at = clock();
    setNow(at);
    try {
      setHistory(transition(history, { playerId: data.viewerId, at }, context));
      setForm(null);
      setError(null);
    } catch (caught) {
      if (!(caught instanceof ScheduleError)) throw caught;
      setError(scheduleErrorMessage(caught.code));
    }
  };

  const submitForm = (options: ScheduleOption[]) =>
    form === "report"
      ? apply((h, actor, ctx) => reportScheduleDate(h, { id: createId(), ...options[0] }, actor, ctx))
      : apply((h, actor, ctx) => proposeSchedule(h, { id: createId(), options }, actor, ctx));

  const state: MatchSchedulingState = {
    // O histórico mostrado já tem expirada a proposta cujas opções passaram (M12)
    history: expireProposals(history, now),
    view: scheduleViewOf({ history, match: data.match, sides: data.sides, viewerId: data.viewerId, now }),
    now,
    form,
    error,
    openForm: (mode) => {
      setForm(mode);
      setError(null);
    },
    accept: (index) => apply((h, actor, ctx) => acceptScheduleOption(h, index, actor, ctx)),
    withdraw: () => apply(withdrawScheduleProposal),
    submitForm,
  };
  return state;
}
