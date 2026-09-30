import type { PlayerNames } from "@/src/components/ui/ScheduleTimeline";
import type { ScheduleSides } from "@/src/lib/domain/schedule-state";
import type { MatchSideKey, RankingMatch, ScheduleHistory } from "@/src/types/domain";

/**
 * O que a tela do confronto precisa, já resolvido das tabelas: a partida, o
 * histórico da marcação, quem está em cada lado e quem está vendo. Hoje vem
 * dos mocks (`src/mocks/matchScreen.ts`); com o Supabase, vem da consulta da página.
 */
export interface MatchScreenData {
  match: RankingMatch;
  history: ScheduleHistory;
  sides: ScheduleSides;
  /** Nome de cada lado. Ex.: `{ a: "Lucas e Rafael", b: "Caio e Diego" }`. */
  sideNames: Record<MatchSideKey, string>;
  /** Nome curto de cada jogador do confronto, por player_id, para o histórico. */
  playerNames: PlayerNames;
  viewerId: string;
  competitionName: string;
  categoryName: string;
  roundNumber: number;
  roundDeadline: string; // ISO 8601
}
