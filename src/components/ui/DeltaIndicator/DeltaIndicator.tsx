"use client";

import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./DeltaIndicator.module.css";

type DeltaIndicatorProps =
  | {
      direction: "up" | "down";
      /** Posições movidas, sempre positivo: o sentido vem de `direction`. */
      value: number;
      className?: string;
    }
  | { direction: "none"; className?: string };

type DeltaDirection = DeltaIndicatorProps["direction"];

const DIRECTION_ICONS: Record<DeltaDirection, React.ElementType> = {
  up: ArrowUpIcon,
  down: ArrowDownIcon,
  none: MinusIcon,
};

// O ícone é decorativo: o sentido chega ao leitor de tela por este prefixo oculto
const DIRECTION_LABELS = { up: "Subiu", down: "Caiu" } as const;

/**
 * Variação de posição no ranking: seta, número e cor. A cor nunca é a única pista (WCAG 1.4.1).
 * @example <DeltaIndicator direction="up" value={2} />
 */
export function DeltaIndicator(props: DeltaIndicatorProps) {
  const { direction, className } = props;
  const rootClasses = [styles.delta, styles[`delta--${direction}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootClasses}>
      <Icon icon={DIRECTION_ICONS[direction]} size="sm" weight="bold" />
      <DeltaText {...props} />
    </span>
  );
}

function DeltaText(props: DeltaIndicatorProps) {
  if (props.direction === "none") return <span>Manteve a posição</span>;

  // Número e palavra em nós de texto separados, como no RankingBlock original:
  // juntar numa string só muda a largura medida em frações de pixel
  return (
    <span>
      <span className={styles.delta__direction}>{DIRECTION_LABELS[props.direction]} </span>
      {props.value} {props.value === 1 ? "posição" : "posições"}
    </span>
  );
}

export type { DeltaDirection, DeltaIndicatorProps };
