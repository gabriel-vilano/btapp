"use client";

import { Avatar } from "@/src/components/feed/Avatar";
import type { PlayerInfo } from "@/src/types/feed";
import styles from "./ProfileMiniCard.module.css";

interface ProfileMiniCardProps {
  player: PlayerInfo;
  onClick?: () => void;
}

export function ProfileMiniCard({ player, onClick }: ProfileMiniCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      aria-label={`Ver perfil de ${player.name}`}
    >
      <Avatar url={player.avatar_url} alt={player.name} size={40} />
      <span className={styles.card__name}>{player.name}</span>
      <span className={styles.card__username}>@{player.username}</span>
    </button>
  );
}
