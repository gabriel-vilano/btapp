import styles from "./CountBadge.module.css";

type CountBadgeProps = {
  /** Quantidade. Sem `count`, o badge é um ponto; com `0`, não renderiza nada. */
  count?: number;
  /** Acima deste número, mostra "9+". */
  max?: number;
  className?: string;
};

/** O badge de um controle: a contagem e o que ela diz ao leitor de tela ("2 pendências", "há novas"). */
type CountBadgeInfo = {
  count?: number;
  description: string;
};

const DEFAULT_MAX = 9;

function isBadgeVisible(count: number | undefined): boolean {
  return count === undefined || count > 0;
}

/**
 * Nome acessível do controle que carrega o badge: o rótulo, mais a descrição quando o badge aparece.
 * @example badgeAccessibleName("Jogos", { count: 2, description: "2 pendências" }) // "Jogos, 2 pendências"
 */
export function badgeAccessibleName(label: string, badge?: CountBadgeInfo): string {
  if (!badge || !isBadgeVisible(badge.count)) return label;
  return `${label}, ${badge.description}`;
}

/**
 * Contador ou ponto sobre um ícone de navegação. Só visual: o controle pai leva a
 * descrição no nome acessível, via `badgeAccessibleName`.
 * @example <CountBadge count={2} />
 */
export function CountBadge({ count, max = DEFAULT_MAX, className }: CountBadgeProps) {
  if (!isBadgeVisible(count)) return null;

  const isDot = count === undefined;
  const classes = [styles.badge, isDot ? styles["badge--dot"] : styles["badge--count"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {!isDot && count !== undefined && (count > max ? `${max}+` : count)}
    </span>
  );
}

export type { CountBadgeProps, CountBadgeInfo };
