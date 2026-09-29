import { type ReactNode } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatTile } from "@/src/components/ui/StatTile";
import { RecordLine } from "@/src/components/profile/RecordLine";
import type { Player } from "@/src/types/domain/people";
import styles from "./ProfileHeader.module.css";

type ProfileHeaderPlayer = Pick<Player, "name" | "username" | "avatar_url" | "total_matches">;

interface ProfileHeaderProps {
  player: ProfileHeaderPlayer;
  /** Amizades aceitas (R24). */
  friendsCount: number;
  wins: number;
  losses: number;
  /** A ação do estado da amizade ou "Editar perfil" (PROFILE.md PF7). O consumidor decide. */
  action: ReactNode;
}

/**
 * Cabeçalho do perfil: quem é e que tipo de jogador é, antes de qualquer rolagem (PROFILE.md §3).
 * Não tem categoria nem posição: a categoria é da inscrição, não do jogador (PF11).
 * @example <ProfileHeader player={player} friendsCount={38} wins={182} losses={92} action={<Button>…</Button>} />
 */
export function ProfileHeader({ player, friendsCount, wins, losses, action }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <Avatar url={player.avatar_url} alt={player.name} size={96} />
      <div className={styles.header__identity}>
        <h1 className={styles.header__name}>{player.name}</h1>
        <p className={styles.header__username}>@{player.username}</p>
      </div>
      <div className={styles.header__stats}>
        <StatTile value={player.total_matches} label="jogos" singularLabel="jogo" />
        <StatTile
          value={friendsCount}
          label="amigos"
          singularLabel="amigo"
          href={friendsListPath(player.username)}
        />
      </div>
      <RecordLine wins={wins} losses={losses} />
      <div className={styles.header__action}>{action}</div>
    </div>
  );
}

// "jogos" não é link: a lista de partidas já está logo abaixo no perfil (PF5)
function friendsListPath(username: string): string {
  return `/jogadores/${encodeURIComponent(username)}/amigos`;
}

/** Carregando: o mesmo formato do cabeçalho, para o layout não pular quando os dados chegam (PF21). */
export function ProfileHeaderSkeleton() {
  return (
    <div className={styles.header} aria-busy="true">
      <span className={styles["header__sr-only"]}>Carregando perfil</span>
      <Skeleton shape="circle" size={96} />
      <div className={`${styles.header__identity} ${styles["header__identity--loading"]}`}>
        <Skeleton shape="text" textScale="title-md" />
        <span className={styles["header__username-skeleton"]}>
          <Skeleton shape="text" textScale="label-md" />
        </span>
      </div>
      <div className={styles.header__stats}>
        <Skeleton shape="rect" className={styles["header__tile-skeleton"]} />
        <Skeleton shape="rect" className={styles["header__tile-skeleton"]} />
      </div>
      <span className={styles["header__record-skeleton"]}>
        <Skeleton shape="text" textScale="body-md" />
      </span>
      <Skeleton shape="rect" className={styles["header__action-skeleton"]} />
    </div>
  );
}

export type { ProfileHeaderPlayer, ProfileHeaderProps };
