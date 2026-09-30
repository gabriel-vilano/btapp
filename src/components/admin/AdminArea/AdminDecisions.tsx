"use client";

import { CalendarXIcon, HourglassIcon, ScalesIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { Badge } from "@/src/components/ui/Badge";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { sortDecisionsOldestFirst, type AdminDecisionItem } from "@/src/lib/domain/admin-area";
import type { AdminPendingKind } from "@/src/lib/domain/competitions-tab";
import styles from "./AdminArea.module.css";

// Rótulos e ícones do bloco "Pendências de admin" da aba Competições (N30):
// o admin reconhece aqui o item em que tocou lá
const KIND_LABEL: Record<AdminPendingKind, string> = {
  contested: "Contestação para arbitrar",
  not_played: "Partida não realizada",
  tournament_no_result: "Confronto sem resultado",
};

const KIND_ICON: Record<AdminPendingKind, React.ElementType> = {
  contested: ScalesIcon,
  not_played: CalendarXIcon,
  tournament_no_result: HourglassIcon,
};

/**
 * Fila de decisões do admin, a mais antiga primeiro (RESULTS §5). Stub: os
 * itens ainda não abrem a decisão, que é a issue "Decisões do admin".
 */
export function AdminDecisions({ decisions }: { decisions: AdminDecisionItem[] }) {
  const headingId = useId();
  return (
    <section className={styles["admin-area__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["admin-area__section-title"]}>
        Decisões pendentes
        {decisions.length > 0 && <Badge tone="neutral">{decisions.length}</Badge>}
      </h2>
      {decisions.length === 0 ? (
        <p className={styles["admin-area__empty"]}>Nenhuma decisão esperando você.</p>
      ) : (
        <List>
          {sortDecisionsOldestFirst(decisions).map((decision) => (
            <ListItem
              key={decision.id}
              leading={<Icon icon={KIND_ICON[decision.kind]} size="md" />}
              title={KIND_LABEL[decision.kind]}
              supportingText={`${decision.category_name} · ${decision.round_label} · ${decision.sides}`}
            />
          ))}
        </List>
      )}
    </section>
  );
}
