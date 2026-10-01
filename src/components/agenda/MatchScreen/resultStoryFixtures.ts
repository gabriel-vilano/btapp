import {
  annulResult,
  arbitrateRankingResult,
  confirmRankingByDeadline,
  confirmRankingResult,
  contestRankingResult,
  correctResult,
  reportRankingResult,
  undoRankingReport,
  type AdminContext,
  type RankingMatchContext,
} from "@/src/lib/domain/match-state";
import { matchPoints } from "@/src/lib/domain/matchPoints";
import {
  DEFAULT_SCORING_RULE,
  type CompetitionResult,
  type MatchFormat,
  type MatchSet,
  type NormalResult,
  type RankingMatch,
} from "@/src/types/domain";
import { ADMIN_ID, MATCH, PLAYER, SIDES } from "./storyFixtures";

// Partidas das stories do resultado (docs/RESULTS.md §4), vistas pelo Pedro
// (lado A) no "agora" das stories, quinta 1º/10, 9h. Cada uma sai das funções
// puras do domínio: todo estado aqui é um que a regra consegue produzir.

const score = (result: CompetitionResult, format: MatchFormat) => matchPoints(result, format, DEFAULT_SCORING_RULE);

const CONTEXT: RankingMatchContext = {
  sides: SIDES,
  responseDeadlineHours: 48,
  roundDeadline: "2026-10-07T02:59:00.000Z",
  score,
};

const ADMIN: AdminContext = { adminIds: [ADMIN_ID], score };

const set = (gamesA: number, gamesB: number): MatchSet => ({
  games_a: gamesA,
  games_b: gamesB,
  super_tiebreak: false,
  interrupted: false,
});

const normal = (winner: "a" | "b", games: [number, number]): NormalResult => ({ type: "normal", winner, sets: [set(...games)] });

/** Quarta, 30/09, 21h10 em Brasília: o prazo de resposta fecha sexta, 21h10 (36h depois do "agora"). */
const REPORTED_AT = "2026-10-01T00:10:00.000Z";

/** Terça, 29/09, 22h: o prazo fecha hoje, 22h, nas últimas 24h (RG9). */
const REPORTED_EARLY = "2026-09-30T01:00:00.000Z";

const reportedBy = (playerId: string, result: NormalResult, at = REPORTED_AT) =>
  reportRankingResult(MATCH, result, { playerId, at }, CONTEXT);

const CAIO_WON = normal("b", [4, 6]);
const PEDRO_WON = normal("a", [6, 3]);

const reportedByPedro = reportedBy(PLAYER.pedro, PEDRO_WON);
const contestedByPedro = contestRankingResult(
  reportedBy(PLAYER.caio, CAIO_WON),
  { reason: "different_score", remembered_result: normal("a", [7, 5]) },
  { playerId: PLAYER.pedro, at: "2026-10-01T02:00:00.000Z" },
  CONTEXT,
);
const confirmedByDiego = confirmRankingResult(reportedByPedro, { playerId: PLAYER.diego, at: "2026-10-01T01:30:00.000Z" }, CONTEXT);

export const RESULT_MATCHES = {
  /** Caio lançou a vitória do lado B: o Pedro responde (§4.1). */
  awaitingYou: reportedBy(PLAYER.caio, CAIO_WON),
  /** Mesmo lançamento, com o prazo nas últimas 24h. */
  awaitingYouUrgent: reportedBy(PLAYER.caio, CAIO_WON, REPORTED_EARLY),
  /** O prazo passou e a confirmação automática ainda não rodou: ninguém responde mais (R14). */
  awaitingExpired: reportedBy(PLAYER.caio, CAIO_WON, "2026-09-29T10:00:00.000Z"),
  /** O Pedro lançou: acompanha e pode desfazer (RG16). */
  awaitingOtherSide: reportedByPedro,
  /** O Thiago, parceiro do Pedro, lançou: o Pedro só acompanha (R13). */
  awaitingPartner: reportedBy(PLAYER.thiago, PEDRO_WON),
  inArbitration: contestedByPedro,
  confirmedByOpponent: confirmedByDiego,
  confirmedByDeadline: confirmRankingByDeadline(
    reportedBy(PLAYER.caio, CAIO_WON, "2026-09-27T12:00:00.000Z"),
    "2026-10-01T11:00:00.000Z",
    CONTEXT,
  ),
  /** A Ana arbitrou a contestação e, depois, corrigiu o placar (RG11). */
  confirmedByAdminCorrected: correctResult(
    arbitrateRankingResult(contestedByPedro, normal("a", [7, 5]), { playerId: ADMIN_ID, at: "2026-10-01T10:00:00.000Z" }, ADMIN),
    normal("a", [7, 6]),
    { playerId: ADMIN_ID, at: "2026-10-01T11:30:00.000Z" },
    ADMIN,
  ),
  annulled: annulResult(confirmedByDiego, { playerId: ADMIN_ID, at: "2026-10-01T11:00:00.000Z" }, ADMIN),
  /** O Pedro lançou e desfez: a partida volta a Confronto definido (R48). */
  undone: undoRankingReport(reportedByPedro, { playerId: PLAYER.pedro, at: "2026-10-01T01:00:00.000Z" }, CONTEXT),
} satisfies Record<string, RankingMatch>;
