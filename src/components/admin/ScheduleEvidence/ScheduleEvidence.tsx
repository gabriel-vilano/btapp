"use client";

import { useId } from "react";
import { StatusTimeline } from "@/src/components/ui/StatusTimeline";
import {
  scheduleSummaryOf,
  type AgreedSchedule,
  type ScheduleSides,
  type ScheduleSideSummary,
} from "@/src/lib/domain/schedule-state";
import { formatEventMoment } from "@/src/lib/formatters";
import type { MatchSideKey, ScheduleHistory } from "@/src/types/domain";
import { formatOfferedTimes } from "./formatOfferedTimes";
import { formatOptions, nameOf, scheduleTimelineEventsOf, type PlayerNames } from "./scheduleTimelineEvents";
import styles from "./ScheduleEvidence.module.css";

// "use client": os ícones do histórico vêm do Phosphor (ver CLAUDE.md >
// "Phosphor em Server Components").

interface ScheduleEvidenceProps {
  /** Histórico da marcação do confronto, congelado na partida não realizada (M1, M16). */
  history: ScheduleHistory;
  /** Jogadores de cada lado: o resumo precisa saber de que lado é quem informou a data. */
  sides: ScheduleSides;
  /** Nome de cada lado no cabeçalho do resumo. Ex.: `{ a: "Pedro e Thiago", b: "Caio e Diego" }`. */
  sideNames: Record<MatchSideKey, string>;
  /** Nome de exibição por player_id, para o histórico. */
  playerNames: PlayerNames;
  className?: string;
}

interface SummaryRow {
  label: string;
  value: (summary: ScheduleSideSummary) => string;
}

const EMPTY_MOMENT = "Nenhuma";

const SUMMARY_ROWS: SummaryRow[] = [
  { label: "Horários oferecidos", value: formatOfferedTimes },
  { label: "Propostas enviadas", value: (s) => String(s.proposalCount) },
  { label: "Propostas expiradas sem aceite", value: (s) => String(s.unansweredCount) },
  { label: "Propostas do outro lado aceitas", value: (s) => String(s.acceptedCount) },
  { label: "Datas informadas fora do app", value: (s) => String(s.reportedDateCount) },
  { label: "Primeira proposta", value: (s) => formatMoment(s.firstProposedAt) },
  { label: "Última proposta", value: (s) => formatMoment(s.lastProposedAt) },
];

/**
 * Evidência da marcação para o admin decidir a partida não realizada (M17):
 * resumo por lado, data acordada ou informada e histórico completo. Mostra
 * fatos lado a lado, sem destacar nenhum lado e sem sugerir W.O.
 * @example <ScheduleEvidence history={history} sides={sides} sideNames={{ a: "Pedro e Thiago", b: "Caio e Diego" }} playerNames={names} />
 */
export function ScheduleEvidence({ history, sides, sideNames, playerNames, className }: ScheduleEvidenceProps) {
  const summary = scheduleSummaryOf(history, sides);
  const events = scheduleTimelineEventsOf(history, playerNames);
  const summaryHeadingId = useId();
  const rootClasses = [styles["schedule-evidence"], className].filter(Boolean).join(" ");

  return (
    <div className={rootClasses}>
      <h3 id={summaryHeadingId} className={styles["schedule-evidence__heading"]}>
        Resumo por lado
      </h3>
      <table className={styles["schedule-evidence__table"]} aria-labelledby={summaryHeadingId}>
        <thead>
          <tr>
            <td />
            <th scope="col">{sideNames.a}</th>
            <th scope="col">{sideNames.b}</th>
          </tr>
        </thead>
        <tbody>
          {SUMMARY_ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value(summary.a)}</td>
              <td>{row.value(summary.b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles["schedule-evidence__agreed"]}>{agreedSentence(summary.agreed, playerNames)}</p>
      <h3 className={styles["schedule-evidence__heading"]}>Histórico da marcação</h3>
      {events.length > 0 ? (
        <StatusTimeline label="Histórico da marcação" events={events} />
      ) : (
        <p className={styles["schedule-evidence__empty"]}>Nenhum dos lados propôs horário nem informou data no app.</p>
      )}
    </div>
  );
}

function agreedSentence(agreed: AgreedSchedule | null, names: PlayerNames): string {
  if (agreed === null) return "Nenhuma data foi acordada nem informada no app.";
  const when = formatOptions([agreed]);
  if (agreed.source.kind === "proposal") {
    return `Data acordada: ${when}. ${nameOf(agreed.source.accepted_by, names)} aceitou em ${formatEventMoment(agreed.agreed_at)}.`;
  }
  const reporter = nameOf(agreed.source.reported_by, names);
  return `Data informada por ${reporter}, sem aceite do outro lado: ${when}. Informada em ${formatEventMoment(agreed.agreed_at)}.`;
}

function formatMoment(iso: string | null): string {
  return iso === null ? EMPTY_MOMENT : formatEventMoment(iso);
}

export type { ScheduleEvidenceProps };
