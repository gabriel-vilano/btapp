"use client";

import { Avatar, AvatarStack } from "@/src/components/ui/Avatar";
import { List, ListItem } from "@/src/components/ui/ListItem";
import type { RankingPlayer, UnrankedEntry } from "@/src/lib/domain/ranking-screen";
import { formatCompetitorName } from "../RankingRow/rankingRowText";
import { profileHref, UNRANKED_NOTE } from "./rankingScreenText";
import { toRowPlayers } from "./rowProps";
import styles from "./RankingScreen.module.css";

interface UnrankedListProps {
  entries: UnrankedEntry[];
  viewerId: string;
  onOpenPair: (players: RankingPlayer[]) => void;
}

/**
 * Temporada aberta sem jogo confirmado (RANKING.md, RK20): as inscrições em ordem
 * alfabética, sem posição e sem pontos. É `<ul>`, não `<ol>`: ainda não há ordem.
 */
export function UnrankedList({ entries, viewerId, onOpenPair }: UnrankedListProps) {
  return (
    <>
      <p className={styles["ranking-screen__note"]}>{UNRANKED_NOTE}</p>
      <List aria-label="Inscritos">
        {entries.map((entry) => (
          <UnrankedItem key={entry.enrollment_id} entry={entry} viewerId={viewerId} onOpenPair={onOpenPair} />
        ))}
      </List>
    </>
  );
}

function UnrankedItem({ entry, viewerId, onOpenPair }: { entry: UnrankedEntry } & Omit<UnrankedListProps, "entries">) {
  const players = toRowPlayers(entry.players, viewerId);
  const singles = entry.players.length === 1;
  const leading = singles ? (
    <Avatar url={players[0].avatarUrl} alt={players[0].name} size={32} />
  ) : (
    <AvatarStack items={players.map((p) => ({ id: p.id, url: p.avatarUrl, alt: p.name }))} size={32} />
  );
  return (
    <ListItem
      leading={leading}
      title={formatCompetitorName(players)}
      href={singles ? profileHref(entry.players[0], viewerId) : undefined}
      onClick={singles ? undefined : () => onOpenPair(entry.players)}
    />
  );
}
