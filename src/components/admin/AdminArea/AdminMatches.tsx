"use client";

import { useId } from "react";
import { Badge } from "@/src/components/ui/Badge";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { adminMatchStatusLabel, matchNeedsAdmin, type AdminMatchRound } from "@/src/lib/domain/admin-area";
import styles from "./AdminArea.module.css";

/**
 * Partidas da competição por rodada, a mais recente primeiro (N31). O toque
 * abre a partida, onde o admin corrige ou anula o placar confirmado (RESULTS §5.4).
 */
export function AdminMatches({ rounds }: { rounds: AdminMatchRound[] }) {
  const headingId = useId();
  return (
    <section className={styles["admin-area__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["admin-area__section-title"]}>
        Partidas da competição
      </h2>
      {rounds.length === 0 ? (
        <p className={styles["admin-area__empty"]}>As partidas aparecem depois do primeiro sorteio.</p>
      ) : (
        rounds.map((round) => <MatchRound key={round.label} round={round} />)
      )}
    </section>
  );
}

function MatchRound({ round }: { round: AdminMatchRound }) {
  return (
    <>
      <h3 className={styles["admin-area__round-title"]}>{round.label}</h3>
      <List aria-label={`Partidas da ${round.label}`}>
        {round.matches.map((match) => (
          <ListItem
            key={match.id}
            href={match.href}
            title={match.sides}
            supportingText={match.category_name}
            trailing={
              <Badge tone={matchNeedsAdmin(match.status) ? "attention" : "neutral"}>
                {adminMatchStatusLabel(match)}
              </Badge>
            }
          />
        ))}
      </List>
    </>
  );
}
