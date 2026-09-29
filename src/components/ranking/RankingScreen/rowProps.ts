import type { RankingLine, RankingPlayer } from "@/src/lib/domain/ranking-screen";
import type { RankingRowPlayers } from "../RankingRow";
import { cutoffDistanceText } from "./rankingScreenText";

// Da linha do domínio para as props do RankingRow, sem o toque, que é da tela.

/** Jogadores da linha, com "Você" no jogador logado. */
export function toRowPlayers(players: RankingPlayer[], viewerId: string): RankingRowPlayers {
  const [first, second] = players.map((player) => ({
    id: player.id,
    name: player.name,
    avatarUrl: player.avatar_url,
    isViewer: player.id === viewerId,
  }));
  if (first === undefined) throw new Error("Linha da classificação sem jogador: esperado 1 (simples) ou 2 (duplas)");
  return second === undefined ? [first] : [first, second];
}

/** Props visuais do RankingRow para uma linha da tabela. */
export function rankingRowProps(line: RankingLine, viewerId: string) {
  return {
    position: line.position,
    players: toRowPlayers(line.players, viewerId),
    points: line.points,
    matches: line.played,
    wins: line.wins,
    delta: line.delta ?? undefined,
    isOwn: line.is_own,
    status: line.status,
    awaitingAdmin: line.awaiting_admin,
    cutoffDistance: line.cutoff_distance ? cutoffDistanceText(line.cutoff_distance) : undefined,
  };
}

export type RankingRowVisualProps = ReturnType<typeof rankingRowProps>;
