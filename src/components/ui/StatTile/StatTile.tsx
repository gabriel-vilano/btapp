import Link, { type LinkProps } from "next/link";
import { formatCount, formatCountValue } from "@/src/lib/formatters";
import styles from "./StatTile.module.css";

interface StatTileProps {
  value: number;
  /** Rótulo no plural, como aparece na tela: "jogos". */
  label: string;
  /** Rótulo quando o valor é 1: "jogo". */
  singularLabel: string;
  /** Com `href`, o tile vira link (ex.: a lista de amigos). */
  href?: LinkProps["href"];
  className?: string;
}

/**
 * Um número com rótulo, para contagens do perfil.
 * @example <StatTile value={38} label="amigos" singularLabel="amigo" href="/jogadores/lucas/amigos" />
 */
export function StatTile({ value, label, singularLabel, href, className }: StatTileProps) {
  const rootClasses = [styles.tile, href && styles["tile--link"], className]
    .filter(Boolean)
    .join(" ");
  const content = (
    <StatTileContent
      value={value}
      label={value === 1 ? singularLabel : label}
      spoken={formatCount(value, singularLabel, label)}
    />
  );

  if (href) {
    return (
      <Link href={href} className={rootClasses}>
        {content}
      </Link>
    );
  }
  return <div className={rootClasses}>{content}</div>;
}

interface StatTileContentProps {
  value: number;
  label: string;
  spoken: string;
}

// Valor e rótulo em blocos separados seriam lidos soltos ("274", "jogos"):
// o leitor de tela recebe a frase inteira, e a parte visual fica oculta para ele
function StatTileContent({ value, label, spoken }: StatTileContentProps) {
  return (
    <>
      <span className={styles["tile__sr-only"]}>{spoken}</span>
      <span className={styles.tile__visual} aria-hidden="true">
        <span className={styles.tile__value}>{formatCountValue(value)}</span>
        <span className={styles.tile__label}>{label}</span>
      </span>
    </>
  );
}

export type { StatTileProps };
