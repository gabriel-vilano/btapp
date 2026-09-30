import { DEFAULT_RESPONSE_DEADLINE_HOURS, DEFAULT_SCORING_RULE } from "@/src/types/domain";
import type { CompetitionMatch, RankingMatch, TournamentMatch } from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";

// Partidas fictícias para as stories e os testes do lançamento. Datas fixas em
// UTC (a tela mostra no fuso de São Paulo, UTC-3), para o texto não mudar com o relógio.

/** Quinta, 1º/10, 9h em Brasília. */
export const STORY_NOW = "2026-10-01T12:00:00.000Z";

/** Terça, 6/10, 23h59 em Brasília. */
export const STORY_ROUND_DEADLINE = "2026-10-07T02:59:00.000Z";

export const STORY_PLAYER = {
  pedro: "story-pedro",
  thiago: "story-thiago",
  caio: "story-caio",
  diego: "story-diego",
  fabio: "story-fabio",
};

const NAMES: Record<string, string> = {
  [STORY_PLAYER.pedro]: "Pedro",
  [STORY_PLAYER.thiago]: "Thiago",
  [STORY_PLAYER.caio]: "Caio",
  [STORY_PLAYER.diego]: "Diego",
};

const COMPETITION_FIELDS = {
  category_id: "story-masculino-b",
  side_a_enrollment_id: "story-enrollment-a",
  side_b_enrollment_id: "story-enrollment-b",
  scheduled_at: "2026-09-30T22:00:00.000Z",
  venue: null,
  created_at: "2026-09-24T15:00:00.000Z",
};

const RANKING_MATCH: RankingMatch = {
  ...COMPETITION_FIELDS,
  id: "story-match-r3",
  kind: "ranking",
  competition_id: "story-ranking",
  round_id: "story-round-3",
  undone_reports: [],
  format: "one_set_of_6",
  status: "defined",
};

const TOURNAMENT_MATCH: TournamentMatch = {
  ...COMPETITION_FIELDS,
  id: "story-match-final",
  kind: "tournament",
  competition_id: "story-tournament",
  stage: "Final",
  format: "one_set_of_6",
  status: "defined",
};

function dataFor(match: CompetitionMatch, viewerId: string): ReportResultData {
  return {
    match,
    sides: { a: [STORY_PLAYER.pedro, STORY_PLAYER.thiago], b: [STORY_PLAYER.caio, STORY_PLAYER.diego] },
    sideNames: { a: "Pedro e Thiago", b: "Caio e Diego" },
    playerNames: NAMES,
    viewerId,
    adminIds: [STORY_PLAYER.fabio],
    competitionName: match.kind === "ranking" ? "Ranking da Arena" : "Copa da Arena",
    categoryName: "Masculino B",
    isSingles: false,
    ranking: null,
  };
}

/**
 * Partida do ranking da rodada 3, vista pelo Pedro (lado A) por padrão.
 * @example rankingStoryData({ format: "two_sets_of_6_stb" })
 */
export function rankingStoryData(overrides: Partial<RankingMatch> = {}, viewerId = STORY_PLAYER.pedro): ReportResultData {
  return {
    ...dataFor({ ...RANKING_MATCH, ...overrides } as RankingMatch, viewerId),
    ranking: {
      roundNumber: 3,
      roundDeadline: STORY_ROUND_DEADLINE,
      responseDeadlineHours: DEFAULT_RESPONSE_DEADLINE_HOURS,
      scoringRule: DEFAULT_SCORING_RULE,
    },
  };
}

/** Final do torneio, vista pelo Fábio, o admin, por padrão. */
export function tournamentStoryData(viewerId = STORY_PLAYER.fabio): ReportResultData {
  return dataFor(TOURNAMENT_MATCH, viewerId);
}
