"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, type Ref } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Icon } from "@/src/components/ui/Icon";
import { StatusTimeline } from "@/src/components/ui/StatusTimeline";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import type { RankingMatch } from "@/src/types/domain";
import { AwaitingCard } from "./AwaitingCard";
import { ContestDialog } from "./ContestDialog";
import { peopleNamesOf, voiceOf, type MatchResultActions, type MatchResultContext } from "./matchResultContext";
import { resultTimelineOf } from "./resultTimeline";
import { ArbitrationCard, CancelledCard, ConfirmedCard, UndoneCard } from "./SettledCards";
import styles from "./MatchResult.module.css";

type MatchResultProps = {
  match: RankingMatch;
  context: MatchResultContext;
  actions: MatchResultActions;
  /** "Agora", em ISO 8601: conta o prazo de resposta (RG9). */
  now: string;
};

/** Âncora da seção: a pendência "Confirmar" e a notificação abrem a tela já nela (§4.1, `agendaActionOf`). */
export const RESULT_SECTION_ID = "resultado";

/**
 * Seção do resultado na tela do confronto (docs/RESULTS.md §4): o estado,
 * as respostas de quem pode agir e o histórico. Não aparece antes de haver
 * lançamento, nem na partida não realizada, que é da marcação e do admin.
 * @example <MatchResult match={match} context={data} actions={useMatchResult(…)} now={now} />
 */
export function MatchResult({ match, context, actions, now }: MatchResultProps) {
  const headingId = useId();
  const titleRef = useFocusOnStatusChange(match.status);
  if (!hasResultSection(match, context)) return null;
  const viewerSide = sideOfPlayer(context.sides, context.viewerId);
  return (
    <section id={RESULT_SECTION_ID} className={styles["match-result"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["match-result__title"]}>
        Resultado
      </h2>
      {actions.error && actions.dialog === null && <Alert status="attention" title={actions.error} />}
      <StateCard match={match} context={context} actions={actions} now={now} titleRef={titleRef} />
      {viewerSide !== null && <ResultHistory match={match} context={context} />}
      {actions.dialog === "contest" && viewerSide !== null && (
        <ContestDialog
          format={match.format}
          voice={voiceOf(context)}
          userSide={viewerSide}
          competitionName={context.competitionName}
          error={actions.error}
          onClose={() => actions.openDialog(null)}
          onContest={actions.contest}
        />
      )}
    </section>
  );
}

// Quem é de fora não vê o lançamento desfeito: é histórico só dos jogadores
function hasResultSection(match: RankingMatch, context: MatchResultContext): boolean {
  if (match.status === "not_played") return false;
  if (match.status !== "defined") return true;
  return match.undone_reports.length > 0 && sideOfPlayer(context.sides, context.viewerId) !== null;
}

type StateCardProps = MatchResultProps & { titleRef: Ref<HTMLHeadingElement> };

function StateCard({ match, context, actions, now, titleRef }: StateCardProps) {
  switch (match.status) {
    case "awaiting_confirmation":
      return <AwaitingCard match={match} context={context} actions={actions} now={now} titleRef={titleRef} />;
    case "in_arbitration":
      return <ArbitrationCard match={match} context={context} titleRef={titleRef} />;
    case "confirmed":
      return <ConfirmedCard match={match} context={context} titleRef={titleRef} />;
    case "cancelled":
      return <CancelledCard match={match} context={context} titleRef={titleRef} />;
    case "defined":
      return <UndoneCard match={match} context={context} titleRef={titleRef} />;
    case "not_played":
      return null;
  }
}

// Depois de confirmar, contestar ou desfazer, o botão que tinha o foco some
// com o estado antigo: o foco vai para o título do estado novo, que o leitor
// de tela anuncia. No primeiro render, nada muda de lugar.
function useFocusOnStatusChange(status: RankingMatch["status"]) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previous = useRef(status);
  useEffect(() => {
    if (previous.current === status) return;
    previous.current = status;
    titleRef.current?.focus();
  }, [status]);
  return titleRef;
}

function ResultHistory({ match, context }: { match: RankingMatch; context: MatchResultContext }) {
  const events = resultTimelineOf(match, { people: peopleNamesOf(context), sides: context.sideNames, viewerId: context.viewerId });
  if (events.length === 0) return null;
  return (
    <details className={styles["match-result__history"]}>
      <summary className={styles["match-result__summary"]}>
        Histórico do resultado
        <span className={styles["match-result__caret"]}>
          <Icon icon={CaretDownIcon} size="sm" />
        </span>
      </summary>
      <StatusTimeline label="Histórico do resultado" events={events} />
    </details>
  );
}

export type { MatchResultProps };
