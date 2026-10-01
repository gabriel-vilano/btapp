import type { PlayerNames } from "@/src/components/ui/ScheduleTimeline";
import type { ScheduleSides } from "@/src/lib/domain/schedule-state";
import type { StandingsScope } from "@/src/lib/domain/standingsStats";
import type { MatchSideKey, RankingMatch, ScheduleHistory, ScoringRule } from "@/src/types/domain";

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
  /** Horas que o lado adversário tem para responder ao lançamento (R14). */
  responseDeadlineHours: number;
  /** Regra de pontuação do ranking: os pontos previstos da resposta saem dela (RG14). */
  scoringRule: ScoringRule;
  /** Primeiro nome dos admins da competição, por player_id: os atos deles ficam visíveis (RG11). */
  adminNames: Record<string, string>;
  /** A categoria na temporada da partida: a posição ao vivo depois da confirmação sai dela (RG18). */
  standings: StandingsScope;
  /** Classificação da categoria, aberta na própria linha (RK3). */
  rankingHref: string;
  /**
   * H2H das duas duplas (docs/HEAD_TO_HEAD.md, HH16): o total de confrontos
   * jogados e a página. `null` sem confronto jogado entre elas.
   */
  h2h: MatchScreenH2H | null;
}

export interface MatchScreenH2H {
  count: number;
  href: string;
}
