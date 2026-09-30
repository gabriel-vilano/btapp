import type { MatchSidePlayers } from "@/src/lib/domain/match-state";
import type { CompetitionMatch, MatchSideKey, ScoringRule } from "@/src/types/domain";

/** O que só o ranking tem: rodada com prazo, prazo de resposta e pontuação (R14, R40, R9). */
export interface ReportRankingContext {
  roundNumber: number;
  roundDeadline: string; // ISO 8601
  responseDeadlineHours: number;
  scoringRule: ScoringRule;
}

/**
 * O que o fluxo de lançar o resultado precisa, já resolvido das tabelas
 * (docs/RESULTS.md §3 e §5.3). Hoje vem dos mocks (`src/mocks/reportResult.ts`);
 * com o Supabase, vem da consulta da página.
 */
export interface ReportResultData {
  match: CompetitionMatch;
  sides: MatchSidePlayers;
  /** Nome de cada lado, sem "Você". Ex.: `{ a: "Lucas e Rafael", b: "Caio e Diego" }`. */
  sideNames: Record<MatchSideKey, string>;
  /** Primeiro nome de cada jogador da partida, por player_id. */
  playerNames: Record<string, string>;
  viewerId: string;
  /** Admins da competição: no torneio, só eles lançam (R38). */
  adminIds: readonly string[];
  competitionName: string;
  categoryName: string;
  isSingles: boolean;
  /** `null` no torneio. */
  ranking: ReportRankingContext | null;
}
