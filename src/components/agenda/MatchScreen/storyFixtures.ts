import {
  acceptScheduleOption,
  proposeSchedule,
  reportScheduleDate,
  type ScheduleContext,
} from "@/src/lib/domain/schedule-state";
import { DEFAULT_SCORING_RULE, type RankingMatch, type ScheduleHistory, type ScheduleOption } from "@/src/types/domain";
import type { MatchScreenData } from "./matchScreenData";

// Confronto fictício da rodada 3, só para stories. Datas fixas em UTC (a tela
// mostra no fuso de São Paulo, UTC-3), para o texto não mudar com o relógio.
// Os históricos saem das funções puras do domínio: todo estado aqui é um que
// a marcação de verdade consegue produzir.

/** Quinta, 1º/10, 9h em Brasília. */
export const STORY_NOW = "2026-10-01T12:00:00.000Z";

/** Terça, 6/10, 23h59 em Brasília. */
const ROUND_DEADLINE = "2026-10-07T02:59:00.000Z";

export const PLAYER = { pedro: "story-pedro", thiago: "story-thiago", caio: "story-caio", diego: "story-diego" };

/** Admin do ranking das stories: os atos dela aparecem com o nome (RG11). */
export const ADMIN_ID = "story-ana";

const VENUE = "Arena Tucum";

export const MATCH: RankingMatch = {
  id: "story-match-r3",
  kind: "ranking",
  round_id: "story-round-3",
  undone_reports: [],
  competition_id: "story-ranking",
  category_id: "story-masculino-b",
  side_a_enrollment_id: "story-enrollment-a",
  side_b_enrollment_id: "story-enrollment-b",
  format: "one_set_of_6",
  scheduled_at: null,
  venue: null,
  created_at: "2026-09-24T15:00:00.000Z",
  status: "defined",
};

export const SIDES = { a: [PLAYER.pedro, PLAYER.thiago], b: [PLAYER.caio, PLAYER.diego] };

const CONTEXT: ScheduleContext = { match: MATCH, sides: SIDES, roundDeadline: ROUND_DEADLINE };

const EMPTY: ScheduleHistory = { match_id: MATCH.id, proposals: [], reported_dates: [] };

const at = (startsAt: string, venue: string | null = VENUE): ScheduleOption => ({ starts_at: startsAt, venue });

/** Sábado 14h, domingo 10h e quarta 19h30. */
const OPTIONS = [at("2026-10-03T17:00:00.000Z"), at("2026-10-04T13:00:00.000Z"), at("2026-10-06T22:30:00.000Z", null)];

const proposedBy = (history: ScheduleHistory, id: string, playerId: string, when: string, options = OPTIONS) =>
  proposeSchedule(history, { id, options }, { playerId, at: when }, CONTEXT);

const acceptedBy = (history: ScheduleHistory, playerId: string, when: string, index = 0) =>
  acceptScheduleOption(history, index, { playerId, at: when }, CONTEXT);

const CAIO_PROPOSED = proposedBy(EMPTY, "story-p1", PLAYER.caio, "2026-09-30T23:00:00.000Z");
const PEDRO_PROPOSED = proposedBy(EMPTY, "story-p1", PLAYER.pedro, "2026-09-30T23:00:00.000Z");
const AGREED = acceptedBy(PEDRO_PROPOSED, PLAYER.diego, "2026-10-01T01:10:00.000Z");

export const STORY_HISTORIES = {
  empty: EMPTY,
  awaitingYou: CAIO_PROPOSED,
  awaitingOtherSide: PEDRO_PROPOSED,
  agreed: AGREED,
  rescheduleReceived: proposedBy(AGREED, "story-p2", PLAYER.diego, "2026-10-01T11:00:00.000Z", [
    at("2026-10-04T12:00:00.000Z"),
    at("2026-10-05T22:00:00.000Z"),
  ]),
  reported: reportScheduleDate(
    CAIO_PROPOSED,
    { id: "story-rd1", starts_at: "2026-10-02T22:00:00.000Z", venue: "Arena Mangaba – Beach · Nova Lima/MG" },
    { playerId: PLAYER.thiago, at: "2026-10-01T10:30:00.000Z" },
    CONTEXT,
  ),
  // O jogo aceito era ontem, quarta às 19h
  datePassed: acceptedBy(
    proposedBy(EMPTY, "story-p1", PLAYER.caio, "2026-09-26T14:00:00.000Z", [
      at("2026-09-30T22:00:00.000Z"),
      at("2026-10-02T22:00:00.000Z"),
    ]),
    PLAYER.thiago,
    "2026-09-26T20:00:00.000Z",
  ),
};

/** Tela vista pelo Pedro (lado A). */
export function storyData(history: ScheduleHistory, overrides: Partial<MatchScreenData> = {}): MatchScreenData {
  return {
    match: MATCH,
    history,
    sides: SIDES,
    sideNames: { a: "Pedro e Thiago", b: "Caio e Diego" },
    playerNames: { [PLAYER.pedro]: "Pedro", [PLAYER.thiago]: "Thiago", [PLAYER.caio]: "Caio", [PLAYER.diego]: "Diego" },
    viewerId: PLAYER.pedro,
    competitionName: "Ranking Arena Mangaba 2026",
    categoryName: "Masculino B",
    roundNumber: 3,
    roundDeadline: ROUND_DEADLINE,
    responseDeadlineHours: 48,
    scoringRule: DEFAULT_SCORING_RULE,
    adminNames: { [ADMIN_ID]: "Ana" },
    ...overrides,
  };
}

/** A partida saiu de "Confronto definido": o prazo da rodada venceu sem resultado (R40). */
export const NOT_PLAYED_MATCH: RankingMatch = { ...MATCH, status: "not_played" };

export const OUTSIDER_ID = "story-outsider";
