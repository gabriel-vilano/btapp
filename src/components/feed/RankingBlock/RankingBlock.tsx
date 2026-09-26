"use client";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrophyIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import type { RankingCard, RankingMilestone } from "@/src/types/feed";
import styles from "./RankingBlock.module.css";

interface RankingBlockProps {
  data: RankingCard;
}

export function RankingBlock({ data }: RankingBlockProps) {
  const isMilestone = data.movement === "milestone";
  const isDown = data.movement === "down";
  const blockClass = isMilestone
    ? `${styles.block} ${styles["block--milestone"]}`
    : styles.block;
  const deltaToneClass = isDown
    ? styles["delta--down"]
    : styles["delta--up"];

  return (
    <div className={blockClass}>
      <p className={styles.block__name}>{data.ranking_name}</p>

      <p className={styles.position}>{data.position}ª</p>

      <p className={`${styles.delta} ${deltaToneClass}`}>
        <Icon
          icon={isDown ? ArrowDownIcon : ArrowUpIcon}
          size="sm"
          weight="bold"
        />
        <span>
          {data.delta} {data.delta === 1 ? "posição" : "posições"}
        </span>
      </p>

      <p className={styles.points}>
        <Icon icon={TrophyIcon} size="sm" weight="regular" />
        <span>{data.points} pontos</span>
      </p>

      {isMilestone && (
        <p className={styles.badge}>
          <Icon icon={StarIcon} size="sm" weight="fill" />
          <span>{getMilestoneLabel(data.milestone)}</span>
        </p>
      )}
    </div>
  );
}

function getMilestoneLabel(milestone: RankingMilestone): string {
  if (milestone === "leader") return "Assumiu a liderança";
  if (milestone === "top10") return "Top 10";
  return "Finals";
}
