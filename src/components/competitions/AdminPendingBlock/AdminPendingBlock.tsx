"use client";

import { CalendarXIcon, HourglassIcon, ScalesIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { Badge } from "@/src/components/ui/Badge";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import type { AdminPendingItem, AdminPendingKind } from "@/src/lib/domain/competitions-tab";
import styles from "./AdminPendingBlock.module.css";

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

interface AdminPendingBlockProps {
  /** Pendências na ordem de exibição. Lista vazia: o bloco não aparece (N30). */
  pendings: AdminPendingItem[];
}

/**
 * Bloco "Pendências de admin" do topo da aba Competições (docs/NAVIGATION.md, N30).
 * Cada item diz o que espera o admin e em qual competição; o toque abre a decisão.
 * @example <AdminPendingBlock pendings={content.adminPendings} />
 */
export function AdminPendingBlock({ pendings }: AdminPendingBlockProps) {
  const headingId = useId();
  if (pendings.length === 0) return null;
  return (
    <section className={styles["admin-pending"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["admin-pending__title"]}>
        Pendências de admin
        <Badge tone="neutral">{pendings.length}</Badge>
      </h2>
      <List>
        {pendings.map((pending) => (
          <ListItem
            key={pending.id}
            href={pending.href}
            leading={<Icon icon={KIND_ICON[pending.kind]} size="md" />}
            title={KIND_LABEL[pending.kind]}
            supportingText={`${pending.competition_name} · ${pending.category_name} · ${pending.sides}`}
          />
        ))}
      </List>
    </section>
  );
}

export type { AdminPendingBlockProps };
