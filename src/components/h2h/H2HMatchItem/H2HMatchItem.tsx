import type { ReactNode } from "react";
import { Badge } from "@/src/components/ui/Badge";
import { ListItem } from "@/src/components/ui/ListItem";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import type { Score } from "@/src/types/feed";
import { formatH2HDate, formatH2HSpokenDate, type H2HOutcome } from "../h2hText";
import styles from "./H2HMatchItem.module.css";

/** Quem jogou com quem, na página de jogadores em duplas (HH14). */
interface H2HMatchLineup {
  /** Parceiro do jogador da esquerda ("Rafael"). */
  partnerName: string;
  /** A dupla do outro lado ("Pedro e Thiago"). */
  opponentNames: string;
}

interface H2HMatchItemProps {
  /** Resultado do lado esquerdo da página. */
  outcome: H2HOutcome;
  score: Score;
  /** Data da partida, em ISO 8601. */
  playedAt: string;
  /** De onde veio a partida: "Ranking Rankin · Masculino B · Rodada 3", "Open de Verão · Mista C" ou "Amistoso". */
  context: string;
  /** Só na página de jogadores, quando a partida foi em duplas. */
  lineup?: H2HMatchLineup;
  /** A tela da partida (N10). */
  href: string;
}

/**
 * Uma linha da lista de confrontos: resultado, placar, data, contexto e, em duplas, os parceiros.
 * Renderiza um `<li>`: use dentro de `<List>`.
 * @example <H2HMatchItem outcome="win" score={score} playedAt="2026-09-12T13:00:00Z" context="Amistoso" href="/partidas/m1" />
 */
export function H2HMatchItem({ outcome, score, playedAt, context, lineup, href }: H2HMatchItemProps) {
  return (
    <ListItem
      href={href}
      title={
        <span className={styles["match-item__headline"]}>
          {outcomeBadge(outcome, score)}
          <Pause />
          <ScoreBlock score={score} variant="compact" perspective={outcome === "win" ? "winner" : "loser"} />
          <Pause />
          <span className={styles["match-item__date"]}>
            <span aria-hidden>{formatH2HDate(playedAt)}</span>
            <span className={styles["visually-hidden"]}>{formatH2HSpokenDate(playedAt)}</span>
          </span>
          <Pause />
        </span>
      }
      supportingText={
        <>
          <span className={styles["match-item__line"]}>{context}</span>
          {lineup && (
            <span className={styles["match-item__line"]}>
              com {lineup.partnerName}, contra {lineup.opponentNames}
            </span>
          )}
        </>
      }
    />
  );
}

// Como no perfil e no card (FEED_CARDS.md §3.3): quem perdeu por desistência leva "Desistência"
function outcomeBadge(outcome: H2HOutcome, score: Score): ReactNode {
  if (outcome === "win") return <Badge tone="success">Vitória</Badge>;
  return <Badge tone="attention">{score.type === "retired" ? "Desistência" : "Derrota"}</Badge>;
}

// Vírgula só para o leitor de tela: a linha é lida como uma frase (HEAD_TO_HEAD.md, seção 7),
// "Vitória, 6/4 3/6, 12 de setembro de 2026, Amistoso"
function Pause() {
  return <span className={styles["visually-hidden"]}>, </span>;
}

export type { H2HMatchItemProps, H2HMatchLineup };
