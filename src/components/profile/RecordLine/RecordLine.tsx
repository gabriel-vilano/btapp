import { formatCount, formatCountValue } from "@/src/lib/formatters";
import styles from "./RecordLine.module.css";

interface RecordLineProps {
  wins: number;
  losses: number;
  className?: string;
}

/**
 * Cartel do jogador em uma linha: "182 vitórias · 92 derrotas" (PROFILE.md PF6).
 * W.O. fica fora: vitórias + derrotas = jogos.
 * @example <RecordLine wins={182} losses={92} />
 */
export function RecordLine({ wins, losses, className }: RecordLineProps) {
  const isEmpty = wins + losses === 0;
  const rootClasses = [styles.record, isEmpty && styles["record--empty"], className]
    .filter(Boolean)
    .join(" ");
  if (isEmpty) return <p className={rootClasses}>Nenhuma partida ainda</p>;

  const spoken = `${formatCount(wins, "vitória", "vitórias")} e ${formatCount(losses, "derrota", "derrotas")}`;
  // O leitor de tela recebe uma frase só; o "·" e os negritos são só visuais
  return (
    <p className={rootClasses}>
      <span className={styles["record__sr-only"]}>{spoken}</span>
      <span aria-hidden="true">
        <RecordCount count={wins} singular="vitória" plural="vitórias" />
        <span className={styles.record__separator}> · </span>
        <RecordCount count={losses} singular="derrota" plural="derrotas" />
      </span>
    </p>
  );
}

interface RecordCountProps {
  count: number;
  singular: string;
  plural: string;
}

function RecordCount({ count, singular, plural }: RecordCountProps) {
  return (
    <>
      <span className={styles.record__number}>{formatCountValue(count)}</span> {count === 1 ? singular : plural}
    </>
  );
}

export type { RecordLineProps };
