import { h2hPath } from "@/src/lib/domain/h2h";
import type { MatchCard, MatchSide, ResultCard, Side } from "@/src/types/feed";

// Botão H2H dos cards (docs/HEAD_TO_HEAD.md, HH16, HH17). O card de duplas
// abre a página de duplas; o de simples, a de jogadores: o lado vira um ou
// dois @usernames, e a rota diz o tipo da página.

// No card de resultado o total inclui a partida do card: com 1, a página
// mostraria só a partida que o jogador acabou de ver (HH17)
export const RESULT_CARD_H2H_MIN = 2;
// No card de confronto a partida ainda não foi jogada, e 1 basta
export const MATCH_CARD_H2H_MIN = 1;

function sideUsernames(side: Side | MatchSide): string[] {
  return side.format === "singles" ? [side.player.username] : side.players.map((player) => player.username);
}

/** Link do H2H do card de resultado, ou null: menos de 2 confrontos ou W.O. (HH17). */
export function resultCardH2HHref(card: ResultCard): string | null {
  if (card.score.type === "wo" || card.h2h_count < RESULT_CARD_H2H_MIN) return null;
  return h2hPath(sideUsernames(card.winner), sideUsernames(card.loser));
}

/** Link do H2H do card de confronto, ou null sem confronto jogado entre os lados (HH16). */
export function matchCardH2HHref(card: MatchCard): string | null {
  if (card.h2h_count < MATCH_CARD_H2H_MIN) return null;
  return h2hPath(sideUsernames(card.side_a), sideUsernames(card.side_b));
}
