"use client";

import type { AdminAreaData } from "@/src/lib/domain/admin-area";
import { AdminDecisions } from "./AdminDecisions";
import { AdminMatches } from "./AdminMatches";
import { RoundDrawStub } from "./RoundDrawStub";
import styles from "./AdminArea.module.css";

interface AdminAreaProps {
  data: AdminAreaData;
  /** Momento da leitura (ISO 8601), para o prazo da rodada. */
  now: string;
}

/**
 * Área "Administrar" da competição (docs/NAVIGATION.md N31, docs/RESULTS.md §5):
 * a fila de decisões, o sorteio da rodada e as partidas da competição. O
 * cabeçalho ("Administrar", com o "Voltar") é da página, que usa o DetailHeader.
 * @example <AdminArea data={mockAdminArea.withDecisions} now={new Date().toISOString()} />
 */
export function AdminArea({ data, now }: AdminAreaProps) {
  return (
    <div className={styles["admin-area"]}>
      <p className={styles["admin-area__competition"]}>{data.competition_name}</p>
      <AdminDecisions decisions={data.decisions} />
      <RoundDrawStub round={data.current_round} now={now} />
      <AdminMatches rounds={data.match_rounds} />
    </div>
  );
}

export type { AdminAreaProps };
