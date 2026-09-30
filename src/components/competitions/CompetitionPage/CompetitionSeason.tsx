"use client";

import { useId } from "react";
import { formatCount } from "@/src/lib/formatters";
import {
  formatFinalLine,
  formatRoundLine,
  formatSeasonDates,
  type CompetitionSeasonInfo,
} from "@/src/lib/domain/competition-page";
import styles from "./CompetitionPage.module.css";

interface CompetitionSeasonProps {
  competitionName: string;
  season: CompetitionSeasonInfo | null;
  matchesPerRound: number;
  now: string; // ISO 8601
}

/**
 * Bloco Temporada (docs/RANKING.md, RK17): datas, rodada com o prazo, jogos
 * por rodada e a final. Sem temporada, o vazio da RK19.
 */
export function CompetitionSeason({ competitionName, season, matchesPerRound, now }: CompetitionSeasonProps) {
  const headingId = useId();
  return (
    <section className={styles["competition-page__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["competition-page__section-title"]}>
        Temporada
      </h2>
      <div className={styles["competition-page__body"]}>
        {season ? (
          <SeasonFacts season={season} matchesPerRound={matchesPerRound} now={now} />
        ) : (
          <NoSeason competitionName={competitionName} />
        )}
      </div>
    </section>
  );
}

function SeasonFacts({ season, matchesPerRound, now }: Omit<CompetitionSeasonProps, "competitionName"> & { season: CompetitionSeasonInfo }) {
  const facts = [
    { label: season.name, value: formatSeasonDates(season.starts_on, season.ends_on) },
    { label: "Rodada atual", value: formatRoundLine(season.current_round, now) },
    { label: "Jogos por rodada", value: formatCount(matchesPerRound, "jogo", "jogos") },
    { label: "Final", value: season.final ? formatFinalLine(season.final, now) : "Esta temporada não tem final" },
  ];
  return (
    <dl className={styles["competition-page__facts"]}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className={styles["competition-page__fact-label"]}>{fact.label}</dt>
          <dd className={styles["competition-page__fact-value"]}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// RK19: a página já tem as regras logo abaixo, então o vazio não precisa de ação
function NoSeason({ competitionName }: { competitionName: string }) {
  return (
    <>
      <p className={styles["competition-page__text"]}>Nenhuma temporada em andamento.</p>
      <p className={`${styles["competition-page__text"]} ${styles["competition-page__text--secondary"]}`}>
        A próxima temporada do {competitionName} ainda não começou.
      </p>
    </>
  );
}
