"use client";

import Image from "next/image";
import { HandshakeIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { formatCategoryLabel } from "@/src/lib/formatters";
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
          {data.org.avatar_url ? (
            <Image
              src={data.org.avatar_url}
              alt={data.org.name}
              width={40}
              height={40}
              className={styles.header__img}
            />
          ) : (
            <div className={styles.header__img_placeholder} aria-hidden />
          )}
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
  return (
    <div className={styles.header}>
      <div className={styles.header__avatar}>
        {showHandshake ? (
          <div className={styles.header__handshake} aria-hidden>
            <Icon icon={HandshakeIcon} size="md" weight="regular" />
          </div>
        ) : data.player.avatar_url ? (
          <Image
            src={data.player.avatar_url}
            alt={data.player.name}
            width={40}
            height={40}
            className={styles.header__img}
          />
        ) : (
          <div className={styles.header__img_placeholder} aria-hidden />
        )}
      </div>

      <div className={styles.header__info}>
        <p className={styles.header__action}>{data.action_text}</p>
        <p className={styles.header__line2}>
          <span>@{data.player.username}</span>
          <span className={styles.header__dot}>·</span>
          <span>{timestamp}</span>
        </p>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  return `há ${days} dia${days > 1 ? "s" : ""}`;
}
