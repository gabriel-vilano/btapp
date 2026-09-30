import type { ReactNode } from "react";
import { joinFullName } from "@/src/lib/names";
import { Avatar, AvatarStack } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { DeltaIndicator } from "@/src/components/ui/DeltaIndicator";
import { ListItem } from "@/src/components/ui/ListItem";
import {
  formatMatchRecord,
  formatRankingRowLabel,
  formatShortCompetitorName,
  orderPlayersForRow,
  type RankingRowPlayers,
} from "./rankingRowText";
import styles from "./RankingRow.module.css";

interface RankingRowProps {
  position: number;
  /** Um jogador em simples, dois em duplas. */
  players: RankingRowPlayers;
  points: number;
  /** Jogos e vitórias sem W.O. (RANKING.md, RK8). */
  matches: number;
  wins: number;
  /** Posições ganhas (positivo) ou perdidas (negativo). Zero ou ausente: sem delta. */
  delta?: number;
  /** A linha da própria dupla: fundo sutil (RK10). */
  isOwn?: boolean;
  /** Inscrição encerrada por troca de parceiro (R45): texto apagado e Badge "Encerrada". */
  status?: "active" | "closed";
  /** Empate em todos os critérios, à espera do admin (R37): Badge "Empate". */
  awaitingAdmin?: boolean;
  /** Distância da vaga, preenchida pela tela (RK11). Ex.: "Faltam 12 pts para o 8º". */
  cutoffDistance?: string;
  /** Simples: perfil do jogador (RK14). */
  href?: string;
  /** Duplas: abre a folha com os dois jogadores (RK14). A folha é da tela. */
  onClick?: () => void;
}

/**
 * Linha da classificação: posição, jogador ou dupla, pontos, delta, jogos e vitórias.
 * Renderiza um `<li>`: use dentro de `<RankingList>`.
 * Ex.: `<RankingRow position={9} players={[voce, pedro]} points={390} matches={5} wins={3} delta={2} isOwn />`
 */
export function RankingRow(props: RankingRowProps) {
  const { status = "active", awaitingAdmin = false, isOwn = false, href, onClick } = props;
  const closed = status === "closed";
  const label = formatRankingRowLabel({ ...props, closed, awaitingAdmin });

  return (
    <ListItem
      href={href}
      onClick={onClick}
      className={rowClass(isOwn, closed)}
      leading={<RowLeading position={props.position} players={props.players} />}
      title={<RowTitle label={label} {...props} closed={closed} awaitingAdmin={awaitingAdmin} />}
      supportingText={<RowSupporting {...props} />}
      trailing={<RowTrailing points={props.points} delta={props.delta} />}
    />
  );
}

function rowClass(isOwn: boolean, closed: boolean): string {
  return [styles["ranking-row"], isOwn && styles["ranking-row--own"], closed && styles["ranking-row--closed"]]
    .filter(Boolean)
    .join(" ");
}

function RowLeading({ position, players }: Pick<RankingRowProps, "position" | "players">) {
  const ordered = orderPlayersForRow(players);
  const avatars =
    ordered.length === 1 ? (
      <Avatar url={ordered[0].avatarUrl} alt={joinFullName(ordered[0])} size={32} />
    ) : (
      <AvatarStack items={ordered.map((player) => ({ id: player.id, url: player.avatarUrl, alt: joinFullName(player) }))} size={32} />
    );
  return (
    <span className={styles["ranking-row__leading"]}>
      <span className={styles["ranking-row__position"]}>{position}</span>
      {avatars}
    </span>
  );
}

interface RowTitleProps extends RankingRowProps {
  label: string;
  closed: boolean;
  awaitingAdmin: boolean;
}

// O leitor de tela lê só o nome acessível, na ordem da spec; o visual fica fora
// da leitura para a linha não ser anunciada duas vezes, em outra ordem
function RowTitle({ label, players, closed, awaitingAdmin }: RowTitleProps) {
  return (
    <>
      <span className={styles["ranking-row__label"]}>{label}</span>
      <span className={styles["ranking-row__title"]} aria-hidden>
        <span className={styles["ranking-row__name"]}>{formatShortCompetitorName(players)}</span>
        {closed && <Badge tone="neutral">Encerrada</Badge>}
        {awaitingAdmin && <Badge tone="neutral">Empate</Badge>}
      </span>
    </>
  );
}

function RowSupporting({ matches, wins, cutoffDistance }: RankingRowProps) {
  return (
    <span className={styles["ranking-row__supporting"]} aria-hidden>
      <span>{formatMatchRecord(matches, wins)}</span>
      {cutoffDistance && <span>{cutoffDistance}</span>}
    </span>
  );
}

function RowTrailing({ points, delta }: Pick<RankingRowProps, "points" | "delta">) {
  return (
    <span className={styles["ranking-row__trailing"]} aria-hidden>
      <span className={styles["ranking-row__points"]}>{points}</span>
      {delta !== undefined && delta !== 0 && (
        <DeltaIndicator direction={delta > 0 ? "up" : "down"} value={Math.abs(delta)} compact />
      )}
    </span>
  );
}

interface RankingListProps {
  children: ReactNode;
  /** Posição da primeira linha, na lista de depois do `ZoneDivider`. Ex.: 9 com 8 vagas. */
  start?: number;
  /** Nome da lista para leitor de tela, quando não há título visível ligado a ela. */
  "aria-label"?: string;
}

/**
 * `<ol>` da classificação, com os `RankingRow`s. Com linha de corte, são duas listas
 * separadas pelo `ZoneDivider`.
 */
export function RankingList({ children, start, "aria-label": ariaLabel }: RankingListProps) {
  // role="list" explícito: o Safari tira a semântica de lista de <ol> com list-style: none
  return (
    <ol className={styles["ranking-list"]} role="list" start={start} aria-label={ariaLabel}>
      {children}
    </ol>
  );
}
