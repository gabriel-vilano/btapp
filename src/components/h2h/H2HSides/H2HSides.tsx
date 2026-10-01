import Link from "next/link";
import { Avatar } from "@/src/components/ui/Avatar";
import styles from "./H2HSides.module.css";

/** Um jogador dos lados: o nome mostrado e a rota do perfil. */
interface H2HSidesPlayer {
  id: string;
  /** Nome completo: é o que o leitor de tela ouve no link. */
  name: string;
  /** O que a tela mostra: o primeiro nome em duplas, o nome completo em simples (HH9). */
  shownName: string;
  avatarUrl: string | null;
  href: string;
}

interface H2HSidesProps {
  /** O lado de quem vê, quando ele está num dos lados (HH6). Um jogador ou a dupla. */
  left: readonly H2HSidesPlayer[];
  right: readonly H2HSidesPlayer[];
}

/**
 * Os dois lados do H2H, com avatar e nome de cada jogador. Cada jogador é um link para o perfil (HH9).
 * O título da tela (o confronto por extenso) é da página.
 * @example <H2HSides left={[lucas]} right={[pedro]} />
 */
export function H2HSides({ left, right }: H2HSidesProps) {
  return (
    <div className={styles.sides}>
      <Side players={left} />
      <span className={styles.sides__versus} aria-hidden>
        ×
      </span>
      <Side players={right} />
    </div>
  );
}

function Side({ players }: { players: readonly H2HSidesPlayer[] }) {
  // Em duplas, o primeiro nome é uma palavra só: quebrar no meio dela não se lê
  const singleLine = players.length > 1;
  return (
    <ul className={styles.side}>
      {players.map((player) => (
        <li key={player.id} className={styles.side__item}>
          <PlayerLink player={player} singleLine={singleLine} />
        </li>
      ))}
    </ul>
  );
}

// O avatar sai da leitura: o nome completo vai no texto do link, e o primeiro nome
// visível está contido nele (WCAG 2.5.3)
function PlayerLink({ player, singleLine }: { player: H2HSidesPlayer; singleLine: boolean }) {
  const nameClass = singleLine ? `${styles.player__name} ${styles["player__name--single-line"]}` : styles.player__name;
  return (
    <Link href={player.href} className={styles.player}>
      <span aria-hidden>
        <Avatar url={player.avatarUrl} alt={player.name} size={48} />
      </span>
      <span className={nameClass} aria-hidden>
        {player.shownName}
      </span>
      <span className={styles["visually-hidden"]}>{player.name}</span>
    </Link>
  );
}

export type { H2HSidesPlayer, H2HSidesProps };
