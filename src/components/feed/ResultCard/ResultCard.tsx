import { Avatar, AvatarStack } from "@/src/components/feed/Avatar";
import { ScoreBlock } from "@/src/components/feed/ScoreBlock";
import { MetaInfo } from "@/src/components/feed/MetaInfo";
import { H2HButton } from "@/src/components/feed/H2HButton";
import type { ResultCard as ResultCardData, Score, Side } from "@/src/types/feed";
import styles from "./ResultCard.module.css";

interface ResultCardProps {
  data: ResultCardData;
}

export function ResultCard({ data }: ResultCardProps) {
  const { winner, loser, score, date, location, h2h_count } = data;
  const showH2H = h2h_count >= 1 && score.type !== "wo";

  return (
    <>
      <PlayerRow side={winner} resultLabel="VITÓRIA" tone="success" />

      <ScoreBlock score={score} />

      <PlayerRow side={loser} resultLabel={getLoserLabel(score)} tone="attention" />

      <MetaInfo date={date} location={location} note={getClosingNote(score)} />

      {showH2H && <H2HButton count={h2h_count} />}
    </>
  );
}

function PlayerRow({
  side,
  resultLabel,
  tone,
}: {
  side: Side;
  resultLabel: string;
  tone: "success" | "attention";
}) {
  const displayName =
    side.format === "singles"
      ? side.player.name
      : side.players.map((p) => p.name.split(" ")[0]).join(" · ");

  return (
    <div className={styles.row}>
      {side.format === "singles" ? (
        <Avatar url={side.player.avatar_url} alt={side.player.name} size={32} />
      ) : (
        <AvatarStack
          size={32}
          items={side.players.map((p) => ({
            id: p.id,
            url: p.avatar_url,
            alt: p.name,
          }))}
        />
      )}
      <span className={styles.row__name}>{displayName}</span>
      <span className={`${styles.label} ${styles[`label--${tone}`]}`}>
        {resultLabel}
      </span>
    </div>
  );
}

function getLoserLabel(score: Score): string {
  if (score.type === "wo") return "W.O.";
  if (score.type === "retired") return "Desistência";
  return "DERROTA";
}

function getClosingNote(score: Score): string | null {
  if (score.type === "wo") return "Jogo encerrado por W.O.";
  if (score.type === "retired") return "Jogo encerrado por desistência";
  return null;
}
