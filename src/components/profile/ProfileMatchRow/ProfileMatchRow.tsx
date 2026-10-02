import type { ReactNode } from "react";
import { Badge } from "@/src/components/ui/Badge";
import { ListItem } from "@/src/components/ui/ListItem";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import { formatTimestamp } from "@/src/lib/formatters";
import type { ProfileMatchItem } from "@/src/lib/domain/profile-page";
import styles from "./ProfileMatchRow.module.css";

// Como no card de resultado (FEED_CARDS.md §3.3): quem perdeu por desistência leva "Desistência"
function outcomeBadge(item: ProfileMatchItem): ReactNode {
  if (item.outcome === "win") return <Badge tone="success">Vitória</Badge>;
  return <Badge tone="attention">{item.result_type === "retired" ? "Desistência" : "Derrota"}</Badge>;
}

/**
 * Uma partida do jogador (PF18): adversários, competição · categoria, data relativa,
 * resultado e placar. A mesma linha em "Partidas recentes" e na lista completa.
 * @example <List><ProfileMatchRow item={item} /></List>
 */
export function ProfileMatchRow({ item }: { item: ProfileMatchItem }) {
  return (
    <ListItem
      href={item.href}
      title={item.opponents}
      supportingText={`${item.context} · ${formatTimestamp(item.played_at)}`}
      trailing={
        <span className={styles["match-row__result"]}>
          {outcomeBadge(item)}
          <ScoreBlock score={item.score} variant="compact" perspective={item.outcome === "win" ? "winner" : "loser"} />
        </span>
      }
    />
  );
}
