"use client";

import { useId, type ReactNode } from "react";
import {
  confirmationDeadlineText,
  formatMatchFormatRule,
  formatPoints,
  NOT_PLAYED_TEXT,
  scoringExample,
  scoringLines,
  superTiebreakNote,
  TIEBREAK_ORDER,
  TIEBREAK_WO_NOTE,
  type CompetitionPageData,
} from "@/src/lib/domain/competition-page";
import styles from "./CompetitionPage.module.css";

/** Âncora da pontuação: o "Como funciona a pontuação" da classificação leva até ela (RK5). */
export const SCORING_ANCHOR = "pontuacao";

type RulesData = Pick<CompetitionPageData, "match_format" | "scoring_rule" | "response_deadline_hours">;

/**
 * Bloco Regras (docs/RANKING.md, RK17 e RK18): formato, pontuação com o
 * exemplo calculado pela regra do ranking, desempate e prazos.
 */
export function CompetitionRules({ data }: { data: RulesData }) {
  const headingId = useId();
  return (
    <section className={styles["competition-page__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["competition-page__section-title"]}>
        Regras
      </h2>
      <RulesSubsection title="Formato da partida">
        <p className={styles["competition-page__text"]}>{formatMatchFormatRule(data.match_format)}</p>
      </RulesSubsection>
      <RulesSubsection title="Pontuação" id={SCORING_ANCHOR}>
        <ScoringTable data={data} />
      </RulesSubsection>
      <RulesSubsection title="Desempate">
        <Tiebreak />
      </RulesSubsection>
      <RulesSubsection title="Prazos">
        <p className={styles["competition-page__text"]}>{confirmationDeadlineText(data.response_deadline_hours)}</p>
        <p className={styles["competition-page__text"]}>{NOT_PLAYED_TEXT}</p>
      </RulesSubsection>
    </section>
  );
}

function RulesSubsection({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section id={id} className={styles["competition-page__subsection"]} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles["competition-page__subsection-title"]}>
        {title}
      </h3>
      <div className={styles["competition-page__facts"]}>{children}</div>
    </section>
  );
}

function ScoringTable({ data }: { data: RulesData }) {
  const example = scoringExample(data.match_format, data.scoring_rule);
  const stbNote = superTiebreakNote(data.match_format, data.scoring_rule);
  return (
    <>
      <dl className={styles["competition-page__facts"]}>
        {scoringLines(data.scoring_rule).map((line) => (
          <div key={line.label}>
            <dt className={styles["competition-page__fact-label"]}>{line.label}</dt>
            <dd className={styles["competition-page__fact-value"]}>{line.text}</dd>
          </div>
        ))}
      </dl>
      {stbNote && <p className={styles["competition-page__text"]}>{stbNote}</p>}
      <p className={`${styles["competition-page__text"]} ${styles["competition-page__example"]}`}>
        Exemplo: vitória por {example.score} dá {formatPoints(example.winner_points)} para quem vence e{" "}
        {formatPoints(example.loser_points)} para quem perde.
      </p>
    </>
  );
}

function Tiebreak() {
  return (
    <>
      <p className={styles["competition-page__text"]}>Empate na classificação se decide nesta ordem:</p>
      <ol className={styles["competition-page__list"]}>
        {TIEBREAK_ORDER.map((criterion) => (
          <li key={criterion}>{criterion}</li>
        ))}
      </ol>
      <p className={`${styles["competition-page__text"]} ${styles["competition-page__text--secondary"]}`}>
        {TIEBREAK_WO_NOTE}
      </p>
    </>
  );
}
