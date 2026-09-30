"use client";

import { useId } from "react";
import { Button } from "@/src/components/ui/Button";
import { formatRoundLine, type CurrentRound } from "@/src/lib/domain/competition-page";
import styles from "./AdminArea.module.css";

interface RoundDrawStubProps {
  round: CurrentRound | null;
  now: string;
}

/**
 * "Lançar sorteio da rodada" (R7). Stub: o botão ainda não age. O fluxo do
 * sorteio tem spec própria e entra na issue dele.
 */
export function RoundDrawStub({ round, now }: RoundDrawStubProps) {
  const headingId = useId();
  return (
    <section className={styles["admin-area__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["admin-area__section-title"]}>
        Sorteio da rodada
      </h2>
      <div className={styles["admin-area__draw"]}>
        <p className={styles["admin-area__draw-round"]}>{formatRoundLine(round, now)}</p>
        <p className={styles["admin-area__draw-hint"]}>O sorteio gera os confrontos da próxima rodada.</p>
        <Button type="button" variant="secondary" fullWidth>
          Lançar sorteio da rodada
        </Button>
      </div>
    </section>
  );
}
