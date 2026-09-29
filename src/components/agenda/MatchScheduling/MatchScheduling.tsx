"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { ScheduleTimeline } from "@/src/components/ui/ScheduleTimeline";
import type { ScheduleHistory } from "@/src/types/domain";
import { ScheduleStateCard, type ScheduleStateCardProps } from "./ScheduleStateCard";
import styles from "./MatchScheduling.module.css";

type MatchSchedulingProps = ScheduleStateCardProps & {
  history: ScheduleHistory;
  className?: string;
};

/**
 * Marcação do jogo na tela do confronto (docs/SCHEDULING.md §6): o estado
 * atual, com as ações dele, e o histórico recolhido logo abaixo. O estado vem
 * pronto de `scheduleViewOf`; as ações só avisam quem controla os dados.
 * @example <MatchScheduling view={scheduleViewOf(input)} history={history} {...handlers} />
 */
export function MatchScheduling({ history, className, ...cardProps }: MatchSchedulingProps) {
  const headingId = useId();
  const rootClasses = [styles["match-scheduling"], className].filter(Boolean).join(" ");
  return (
    <section className={rootClasses} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["match-scheduling__title"]}>
        Marcação
      </h2>
      <ScheduleStateCard {...cardProps} />
      {cardProps.view.kind !== "public" && (
        <HistoryDisclosure
          history={history}
          playerNames={cardProps.playerNames}
          open={cardProps.view.kind === "frozen"}
        />
      )}
    </section>
  );
}

type HistoryDisclosureProps = Pick<MatchSchedulingProps, "history" | "playerNames"> & { open: boolean };

// Recolhido abaixo do estado atual (§6); aberto quando a marcação congela,
// porque aí o histórico é tudo o que resta (M1). Só os 4 jogadores e o admin o
// veem (M18): quem é de fora nem chega aqui.
function HistoryDisclosure({ history, playerNames, open }: HistoryDisclosureProps) {
  const count = history.proposals.length + history.reported_dates.length;
  if (count === 0) return null;
  return (
    <details className={styles["match-scheduling__history"]} open={open}>
      <summary className={styles["match-scheduling__summary"]}>
        Histórico da marcação
        <span className={styles["match-scheduling__caret"]}>
          <Icon icon={CaretDownIcon} size="sm" />
        </span>
      </summary>
      <ScheduleTimeline history={history} playerNames={playerNames} />
    </details>
  );
}

export type { MatchSchedulingProps };
