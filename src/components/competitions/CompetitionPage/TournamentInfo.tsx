"use client";

import { useId } from "react";
import type { TournamentPageData } from "@/src/lib/domain/competition-page";
import { formatTournamentDates, hasTournamentEnded } from "@/src/lib/tournamentDates";
import styles from "./CompetitionPage.module.css";

interface TournamentInfoProps {
  tournament: Pick<TournamentPageData, "starts_on" | "ends_on" | "venue">;
  now: string; // ISO 8601
}

/**
 * Bloco "Data e local" do torneio (docs/EXPLORE.md, EX34): a data no formato
 * da vitrine (EX10) e o local, que é texto (EX25). O torneio que já aconteceu
 * diz isso aqui, porque a página tira os blocos de inscrição.
 */
export function TournamentInfo({ tournament, now }: TournamentInfoProps) {
  const headingId = useId();
  const facts = [
    { label: "Data", value: formatTournamentDates(tournament.starts_on, tournament.ends_on) },
    { label: "Local", value: tournament.venue },
  ];
  return (
    <section className={styles["competition-page__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["competition-page__section-title"]}>
        Data e local
      </h2>
      <div className={styles["competition-page__body"]}>
        <dl className={styles["competition-page__facts"]}>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className={styles["competition-page__fact-label"]}>{fact.label}</dt>
              <dd className={styles["competition-page__fact-value"]}>{fact.value}</dd>
            </div>
          ))}
        </dl>
        {hasTournamentEnded(tournament.ends_on, now) && (
          <p className={`${styles["competition-page__text"]} ${styles["competition-page__text--secondary"]}`}>
            Este torneio já aconteceu.
          </p>
        )}
      </div>
    </section>
  );
}
