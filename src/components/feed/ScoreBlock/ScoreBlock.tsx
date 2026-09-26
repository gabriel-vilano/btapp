import type { Score, SetScore } from "@/src/types/feed";
import styles from "./ScoreBlock.module.css";

interface ScoreBlockProps {
  score: Score;
}

export function ScoreBlock({ score }: ScoreBlockProps) {
  const outcomeLabel = getOutcomeLabel(score);
  if (outcomeLabel) {
    return <p className={styles.score__outcome}>{outcomeLabel}</p>;
  }
  return <SetGrid sets={getPlayedSets(score)} />;
}

/**
 * Rótulo que substitui o placar quando não houve set jogado.
 * O card de resultado é sempre lido do lado vencedor (vencedor em cima),
 * por isso "Vitória por…". Placar 0 × 0 aqui seria um jogo que não houve
 * (FEED_CARDS.md §4.3).
 */
export function getOutcomeLabel(score: Score): string | null {
  if (score.type === "wo") return "Vitória por W.O.";
  if (score.type === "retired" && score.completed_sets.length === 0) {
    return "Vitória por desistência";
  }
  return null;
}

function getPlayedSets(score: Score): SetScore[] {
  if (score.type === "normal") return score.sets;
  if (score.type === "retired") return score.completed_sets;
  return [];
}

function SetGrid({ sets }: { sets: SetScore[] }) {
  const cols = sets.length;
  const labels = cols >= 2 ? buildLabels(cols) : [];

  return (
    <div className={`${styles.score} ${styles[`score--cols-${cols}`]}`}>
      {labels.map((label, i) => (
        <span key={`label-${i}`} className={styles.score__label}>
          {label}
        </span>
      ))}
      {sets.map((set, i) => (
        <SetNumber key={`top-${i}`} value={set.a} isWinner={set.a > set.b} />
      ))}
      {sets.map((set, i) => (
        <SetNumber key={`bot-${i}`} value={set.b} isWinner={set.b > set.a} />
      ))}
    </div>
  );
}

function SetNumber({ value, isWinner }: { value: number; isWinner: boolean }) {
  const tone = isWinner ? "score__number--winner" : "score__number--loser";
  return <span className={`${styles.score__number} ${styles[tone]}`}>{value}</span>;
}

function buildLabels(cols: number): string[] {
  if (cols === 3) return ["Set 1", "Set 2", "STB"];
  return Array.from({ length: cols }, (_, i) => `Set ${i + 1}`);
}
