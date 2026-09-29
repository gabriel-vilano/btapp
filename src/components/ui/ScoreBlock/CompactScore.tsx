import type { Score, SetScore } from "@/src/types/feed";
import styles from "./CompactScore.module.css";
import { hasPlayedGames, isStarted } from "./scoreSets";

/** O lado de quem a linha fala. `Score` é gravado do lado vencedor (`a` = vencedor). */
export type ScorePerspective = "winner" | "loser";

type SetTone = "won" | "lost" | "interrupted";

interface CompactSet {
  own: number;
  opponent: number;
  tone: SetTone;
}

interface CompactScoreProps {
  score: Score;
  perspective: ScorePerspective;
}

// Marcador da desistência depois do set interrompido, na convenção do "ret." do tênis.
// Neutro em gênero (R26): fala do jogo, não de quem desistiu.
const RETIRED_MARKER = "desist.";

/** Placar em uma linha, lido do lado de `perspective`. Ex.: "6/4 3/6 10/7", "4/6 3/2 desist.", "W.O.". */
export function CompactScore({ score, perspective }: CompactScoreProps) {
  const outcome = getCompactOutcome(score);
  if (outcome) {
    return <span className={`${styles.compact} ${styles["compact__outcome"]}`}>{outcome}</span>;
  }
  const sets = getCompactSets(score, perspective);
  return (
    <span className={styles.compact}>
      {sets.map((set, i) => (
        <SetText key={i} set={set} isFirst={i === 0} />
      ))}
      {score.type === "retired" && (
        <>
          {" "}
          <span className={`${styles["compact__item"]} ${styles["compact__outcome"]}`}>{RETIRED_MARKER}</span>
        </>
      )}
    </span>
  );
}

/**
 * Texto que substitui os números quando não houve game: sem placar, como no card (FEED_CARDS §4.3).
 * O Badge ao lado já diz quem venceu, então o texto não repete "Vitória".
 */
function getCompactOutcome(score: Score): string | null {
  if (score.type === "wo") return "W.O.";
  if (score.type === "retired" && !hasPlayedGames(score)) return RETIRED_MARKER;
  return null;
}

/** Sets na ordem em que foram jogados, do lado de `perspective`. Set que não começou não entra. */
function getCompactSets(score: Score, perspective: ScorePerspective): CompactSet[] {
  if (score.type === "wo") return [];
  if (score.type === "normal") return score.sets.map((set) => toCompactSet(set, perspective, false));
  const completed = score.completed_sets.map((set) => toCompactSet(set, perspective, false));
  if (!isStarted(score.interrupted_set)) return completed;
  return [...completed, toCompactSet(score.interrupted_set, perspective, true)];
}

function toCompactSet(set: SetScore, perspective: ScorePerspective, interrupted: boolean): CompactSet {
  const own = perspective === "winner" ? set.a : set.b;
  const opponent = perspective === "winner" ? set.b : set.a;
  // Set interrompido não tem vencedor: fica em secundário, como no card (§4.4)
  if (interrupted) return { own, opponent, tone: "interrupted" };
  return { own, opponent, tone: own > opponent ? "won" : "lost" };
}

// O espaço é texto, não gap de flex: assim o leitor de tela lê "6/4 3/6", não "6/43/6"
function SetText({ set, isFirst }: { set: CompactSet; isFirst: boolean }) {
  const tone = set.tone === "won" ? "compact__set--won" : "compact__set--muted";
  return (
    <>
      {!isFirst && " "}
      <span className={`${styles["compact__item"]} ${styles[tone]}`}>
        {set.own}/{set.opponent}
      </span>
    </>
  );
}
