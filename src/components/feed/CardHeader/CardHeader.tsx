"use client";

import { HandshakeIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { Avatar, AvatarStack } from "@/src/components/ui/Avatar";
import { formatCategoryLabel, formatTimestamp } from "@/src/lib/formatters";
import type { CardHeader as CardHeaderData } from "@/src/types/feed";
import styles from "./CardHeader.module.css";

interface CardHeaderProps {
  data: CardHeaderData;
  createdAt: string;
  /** Exibe ícone de aperto de mão no lugar do avatar — usado pelo FriendshipCard */
  showHandshake?: boolean;
}

export function CardHeader({
  data,
  createdAt,
  showHandshake = false,
}: CardHeaderProps) {
  const timestamp = formatTimestamp(createdAt);

  if (data.header_type === "org") {
    return (
      <div className={styles.header}>
        <div className={styles.header__avatar}>
          <Avatar url={data.org.avatar_url} alt={data.org.name} size={40} />
        </div>

        <div className={styles.header__info}>
          <p className={styles.header__line1}>
            <span className={styles.header__phase}>{data.phase}</span>
            <span className={styles.header__competition}>
              {data.competition_name} — {formatCategoryLabel(data.category)}
            </span>
          </p>
          <p className={styles.header__line2}>
            <span>@{data.org.username}</span>
            <span className={styles.header__dot}>·</span>
            <span>{timestamp}</span>
          </p>
        </div>
      </div>
    );
  }

  // Padrão B — jogador
  const avatarSlotClass = data.partner
    ? `${styles.header__avatar} ${styles["header__avatar--stack"]}`
    : styles.header__avatar;

  return (
    <div className={styles.header}>
      <div className={avatarSlotClass}>
        {showHandshake ? (
          <div className={styles.header__handshake} aria-hidden>
            <Icon icon={HandshakeIcon} size="md" weight="regular" />
          </div>
        ) : data.partner ? (
          <AvatarStack
            size={40}
            items={[data.player, data.partner].map((p) => ({ id: p.id, url: p.avatar_url, alt: p.name }))}
          />
        ) : (
          <Avatar url={data.player.avatar_url} alt={data.player.name} size={40} />
        )}
      </div>

      <div className={styles.header__info}>
        <p className={styles.header__action}>{data.action_text}</p>
        <p className={styles.header__line2}>
          <span>@{data.player.username}</span>
          <span className={styles.header__dot}>·</span>
          <span>{timestamp}</span>
          {data.private_to && <PrivateIndicator audience={data.private_to} />}
        </p>
      </div>
    </div>
  );
}

// Discreto de propósito: responde "meus amigos viram?" sem destacar a queda
function PrivateIndicator({ audience }: { audience: "player" | "pair" }) {
  return (
    <>
      <span className={styles.header__dot}>·</span>
      <span className={styles.header__private}>
        <Icon icon={LockSimpleIcon} size="xs" weight="regular" />
        {audience === "player" ? "só você" : "só a dupla"}
      </span>
    </>
  );
}
