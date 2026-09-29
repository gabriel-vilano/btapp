import type { ReactNode } from "react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./Badge.module.css";

type BadgeTone = "neutral" | "accent" | "success" | "attention";

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
  /** Ícone decorativo antes do texto. Recebe o componente do Phosphor, como no `<Icon />`. */
  icon?: React.ElementType;
  className?: string;
};

/**
 * Selo curto de status ou categoria: texto `label-md` em negrito sobre fundo sutil do tom.
 * @example <Badge tone="success">VITÓRIA</Badge>
 */
export function Badge({ tone, children, icon, className }: BadgeProps) {
  const rootClasses = [styles.badge, styles[`badge--${tone}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootClasses}>
      {icon && <Icon icon={icon} size="sm" weight="fill" />}
      {children}
    </span>
  );
}

export type { BadgeTone, BadgeProps };
