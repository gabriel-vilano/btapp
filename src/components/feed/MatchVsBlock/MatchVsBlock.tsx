import { Avatar, AvatarStack } from "@/src/components/feed/Avatar";
import type { MatchSide } from "@/src/types/feed";
import styles from "./MatchVsBlock.module.css";

interface MatchVsBlockProps {
  sideA: MatchSide;
  sideB: MatchSide;
}

export function MatchVsBlock({ sideA, sideB }: MatchVsBlockProps) {
  return (
    <div className={styles.vs}>
      <Side side={sideA} />
      <span className={styles.vs__center} aria-hidden>
        VS
      </span>
      <Side side={sideB} />
    </div>
  );
}

function Side({ side }: { side: MatchSide }) {
  const name =
    side.format === "singles"
      ? side.player.name.split(" ")[0]
      : side.players.map((p) => p.name.split(" ")[0]).join(" · ");

  const stats =
    side.format === "singles"
      ? `${side.player.total_matches} jogos`
      : side.players.map((p) => `${p.total_matches} jogos`).join(" · ");

  return (
    <div className={styles.side}>
      {side.format === "singles" ? (
        <Avatar url={side.player.avatar_url} alt={side.player.name} size={48} />
      ) : (
        <AvatarStack
          size={48}
          items={side.players.map((p) => ({
            id: p.id,
            url: p.avatar_url,
            alt: p.name,
          }))}
        />
      )}
      <span className={styles.side__name}>{name}</span>
      <span className={styles.side__stats}>{stats}</span>
    </div>
  );
}
