import type { MatchSidePlayers } from "@/src/lib/domain/match-state";
import type { FriendlyMatch, MatchSideKey } from "@/src/types/domain";

/**
 * O que a tela do amistoso precisa, já resolvido das tabelas (docs/RESULTS.md
 * §6.2). Hoje vem dos mocks (`src/mocks/friendlyScreen.ts`); com o Supabase,
 * vem da consulta da página.
 */
export interface FriendlyScreenData {
  match: FriendlyMatch;
  sides: MatchSidePlayers;
  /** Nome de cada lado, sem "Você". Ex.: `{ a: "Lucas e Rafael", b: "Pedro e Thiago" }`. */
  sideNames: Record<MatchSideKey, string>;
  /** Primeiro nome de cada jogador do amistoso, por player_id. */
  playerNames: Record<string, string>;
  viewerId: string;
}
