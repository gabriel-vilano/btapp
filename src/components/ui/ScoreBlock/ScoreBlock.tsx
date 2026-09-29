import type { RetiredScore, Score, SetScore } from "@/src/types/feed";
import styles from "./ScoreBlock.module.css";

interface ScoreBlockProps {
  score: Score;
}

/** Uma coluna da grade: um set. `interrupted` é o set da desistência (R11). */
interface ScoreColumn {
  set: SetScore;
  label: string;
  interrupted: boolean;
}

export function ScoreBlock({ score }: ScoreBlockProps) {
  const outcomeLabel = getOutcomeLabel(score);
  if (outcomeLabel) {
    return <p className={styles.score__outcome}>{outcomeLabel}</p>;
  }
  return <SetGrid columns={getColumns(score)} />;
}

/**
 * Rótulo que substitui o placar quando não houve game jogado.
 * O card de resultado é sempre lido do lado vencedor (vencedor em cima),
 * por isso "Vitória por…". Placar 0 × 0 aqui seria um jogo que não houve
 * (FEED_CARDS.md §4.3).
 */
export function getOutcomeLabel(score: Score): string | null {
  if (score.type === "wo") return "Vitória por W.O.";
  if (score.type === "retired" && !hasPlayedGames(score)) {
    return "Vitória por desistência";
  }
  return null;
}

/**
 * Nome do set em que houve a desistência, para o texto do card.
 * Ex.: "2º set", ou "super tiebreak" quando foi no 3º set do formato de 2 sets.
 */
export function getInterruptedSetName(score: RetiredScore): string {
  const index = score.completed_sets.length;
  return index === 2 ? "super tiebreak" : `${index + 1}º set`;
}

function hasPlayedGames(score: RetiredScore): boolean {
  return score.completed_sets.length > 0 || isStarted(score.interrupted_set);
}

function isStarted(set: SetScore): boolean {
  return set.a + set.b > 0;
}

function getColumns(score: Score): ScoreColumn[] {
  if (score.type === "normal") return toColumns(score.sets);
  if (score.type === "wo") return [];
  const completed = toColumns(score.completed_sets);
  // Desistência entre sets: o set seguinte não começou, então não vira coluna
  if (!isStarted(score.interrupted_set)) return completed;
  const interrupted = { set: score.interrupted_set, label: "Interrompido", interrupted: true };
  return [...completed, interrupted];
}

// Em 3 colunas, a terceira é o super tiebreak (NormalScore em types/feed)
function toColumns(sets: SetScore[]): ScoreColumn[] {
  return sets.map((set, i) => ({ set, label: i === 2 ? "STB" : `Set ${i + 1}`, interrupted: false }));
}

function SetGrid({ columns }: { columns: ScoreColumn[] }) {
  // O set interrompido sempre leva o rótulo: é o texto, não a cor, que o marca (WCAG 1.4.1)
  const showLabels = columns.length >= 2 || columns.some((column) => column.interrupted);

  return (
    <div className={`${styles.score} ${styles[`score--cols-${columns.length}`]}`}>
      {showLabels &&
        columns.map((column, i) => (
          <span key={`label-${i}`} className={styles.score__label}>
            {column.label}
          </span>
        ))}
      {columns.map((column, i) => (
        <SetNumber key={`top-${i}`} value={column.set.a} isWinner={isSetWinner(column, "a")} />
      ))}
      {columns.map((column, i) => (
        <SetNumber key={`bot-${i}`} value={column.set.b} isWinner={isSetWinner(column, "b")} />
      ))}
    </div>
  );
}

// Set interrompido não tem vencedor: os dois números ficam em secundário
function isSetWinner({ set, interrupted }: ScoreColumn, side: "a" | "b"): boolean {
  if (interrupted) return false;
  return side === "a" ? set.a > set.b : set.b > set.a;
}

function SetNumber({ value, isWinner }: { value: number; isWinner: boolean }) {
  const tone = isWinner ? "score__number--winner" : "score__number--loser";
  return <span className={`${styles.score__number} ${styles[tone]}`}>{value}</span>;
}
