"use client";

import { TrophyIcon, StarIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { Badge } from "@/src/components/ui/Badge";
import { DeltaIndicator } from "@/src/components/ui/DeltaIndicator";
import { milestoneLabel } from "@/src/components/feed/RankingCard/rankingTexts";
import type { RankingCard } from "@/src/types/feed";
import styles from "./RankingBlock.module.css";

interface RankingBlockProps {
  data: RankingCard;
}

export function RankingBlock({ data }: RankingBlockProps) {
  // Marco e classificação para a final são conquistas: ganham fundo de destaque
  const isHighlight = data.movement === "milestone" || data.movement === "final_qualification";
  const blockClass = isHighlight
    ? `${styles.block} ${styles["block--milestone"]}`
    : styles.block;

  return (
    <div className={blockClass}>
      <p className={styles.block__name}>{data.ranking_name}</p>

      <p className={styles.position}>{data.position}ª</p>

      <RankingDelta data={data} />

      <p className={styles.points}>
        <Icon icon={TrophyIcon} size="sm" weight="regular" />
        <span>{data.points} pontos</span>
      </p>

      <RankingBadge data={data} />
    </div>
  );
}

function RankingDelta({ data }: RankingBlockProps) {
  // Classificação é a posição na data de corte, não uma movimentação (R28)
  if (data.movement === "final_qualification" || data.delta === null) return null;

  // Marco só acontece subindo: a seta é a mesma do "up"
  const direction = data.movement === "down" ? "down" : "up";
  return <DeltaIndicator direction={direction} value={data.delta} />;
}

function RankingBadge({ data }: RankingBlockProps) {
  if (data.movement !== "milestone" && data.movement !== "final_qualification") return null;

  const label =
    data.movement === "milestone"
      ? milestoneLabel(data.milestone, data.competitor)
      : data.final_name;
  return (
    <Badge tone="accent" icon={StarIcon} className={styles.badge}>
      {label}
    </Badge>
  );
}
