"use client";

import { Avatar } from "@/src/components/ui/Avatar";
import { Dialog } from "@/src/components/ui/Dialog";
import { List, ListItem } from "@/src/components/ui/ListItem";
import type { RankingPlayer } from "@/src/lib/domain/ranking-screen";
import { formatCompetitorName } from "../RankingRow/rankingRowText";
import { profileHref } from "./rankingScreenText";
import { toRowPlayers } from "./rowProps";

interface PairSheetProps {
  /** A dupla tocada; null fecha a folha. */
  players: RankingPlayer[] | null;
  viewerId: string;
  onClose: () => void;
}

/**
 * Folha com os dois jogadores da dupla, cada um levando ao perfil (RANKING.md, RK14).
 * Não existe página de dupla no MVP.
 */
export function PairSheet({ players, viewerId, onClose }: PairSheetProps) {
  const title = players ? formatCompetitorName(toRowPlayers(players, viewerId)) : "";
  return (
    <Dialog open={players !== null} onClose={onClose} title={title}>
      <List aria-label="Jogadores da dupla">
        {players?.map((player) => (
          <ListItem
            key={player.id}
            href={profileHref(player, viewerId)}
            leading={<Avatar url={player.avatar_url} alt={player.name} size={40} />}
            title={player.name}
            supportingText={player.id === viewerId ? "Você" : `@${player.username}`}
          />
        ))}
      </List>
    </Dialog>
  );
}
