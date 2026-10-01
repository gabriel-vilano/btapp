import { formatGamesCount, formatSummaryLine, formatSummarySentence, type H2HSideKind } from "../h2hText";
import styles from "./H2HSummary.module.css";

interface H2HSummaryProps {
  /** Vitórias do lado esquerdo da página: quem vê, quando é um dos lados. */
  leftWins: number;
  rightWins: number;
  /** Data do último confronto jogado, em ISO 8601. */
  lastPlayedAt: string;
  /** Nome curto do lado esquerdo ("Você", "Vocês", "Lucas", "Lucas e Rafael"). */
  leftLabel: string;
  rightLabel: string;
  /** Jogador ou dupla: decide a concordância ("venceu" ou "venceram"). */
  sideKind?: H2HSideKind;
}

/**
 * O placar do confronto entre dois lados: vitórias nas pontas, total no meio e a barra proporcional.
 * Conta só partidas jogadas; W.O. não chega aqui (HH11).
 * @example <H2HSummary leftWins={3} rightWins={1} lastPlayedAt="2026-09-12T13:00:00Z" leftLabel="Você" rightLabel="Pedro" />
 */
export function H2HSummary({ sideKind = "player", ...counts }: H2HSummaryProps) {
  const summary = { ...counts, sideKind };
  const total = counts.leftWins + counts.rightWins;
  return (
    <div className={styles.summary}>
      {/* O leitor de tela ouve uma frase; números, barra e linha de apoio são a versão visual dela */}
      <p className={styles["visually-hidden"]}>{formatSummarySentence(summary)}</p>
      <div className={styles.summary__visual} aria-hidden>
        <div className={styles.summary__counts}>
          <span className={styles.summary__wins}>{counts.leftWins}</span>
          <span className={styles.summary__total}>{formatGamesCount(total)}</span>
          <span className={styles.summary__wins}>{counts.rightWins}</span>
        </div>
        {/* Com um confronto, a barra seria 100% de um lado e só repetiria o número (seção 6.1) */}
        {total > 1 && <ProportionBar leftWins={counts.leftWins} total={total} />}
        <p className={styles.summary__line}>{formatSummaryLine(summary)}</p>
      </div>
    </div>
  );
}

// SVG, e não largura em style=: o DS não usa CSS inline (mesmo recurso do CheerBar)
function ProportionBar({ leftWins, total }: { leftWins: number; total: number }) {
  const leftPercent = (leftWins / total) * 100;
  return (
    <svg className={styles.bar} viewBox="0 0 100 4" preserveAspectRatio="none">
      <rect className={styles.bar__right} x="0" y="0" width="100" height="4" />
      <rect className={styles.bar__left} x="0" y="0" width={leftPercent} height="4" />
    </svg>
  );
}

export type { H2HSummaryProps };
