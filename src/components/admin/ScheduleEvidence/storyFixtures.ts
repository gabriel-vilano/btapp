import type { ScheduleSides } from "@/src/lib/domain/schedule-state";
import type { ScheduleHistory, ScheduleOption } from "@/src/types/domain";
import type { PlayerNames } from "./scheduleTimelineEvents";

// Confrontos fictícios da rodada 2 do Masculino B, só para stories. Datas fixas
// em UTC (a tela mostra no fuso de São Paulo, UTC-3): o texto não muda com o
// relógio. O prazo da rodada foi 20/09.

export const STORY_SIDES: ScheduleSides = {
  a: ["story-pedro", "story-thiago"],
  b: ["story-caio", "story-diego"],
};

export const STORY_SIDE_NAMES = { a: "Pedro e Thiago", b: "Caio e Diego" };

export const STORY_LONG_SIDE_NAMES = {
  a: "Maria Eduarda Albuquerque e Ana Beatriz Vasconcelos",
  b: "Caio e Diego",
};

export const STORY_PLAYER_NAMES: PlayerNames = {
  "story-pedro": "Pedro",
  "story-thiago": "Thiago",
  "story-caio": "Caio",
  "story-diego": "Diego",
};

const MATCH_ID = "story-match-r2-4";
const VENUE = "Arena RM – Beach · Nova Lima/MG";

const at = (startsAt: string, venue: string | null = VENUE): ScheduleOption => ({ starts_at: startsAt, venue });

export const EMPTY_HISTORY: ScheduleHistory = { match_id: MATCH_ID, proposals: [], reported_dates: [] };

/** Só um lado propôs: duas propostas da dupla A, as duas expiraram sem aceite. */
export const ONE_SIDE_HISTORY: ScheduleHistory = {
  match_id: MATCH_ID,
  proposals: [
    {
      id: "story-proposal-1",
      match_id: MATCH_ID,
      side: "a",
      proposed_by: "story-thiago",
      created_at: "2026-09-07T13:10:00Z",
      options: [at("2026-09-09T22:00:00Z"), at("2026-09-11T22:00:00Z"), at("2026-09-13T12:00:00Z", null)],
      status: "expired",
      closed_at: "2026-09-13T12:00:00Z",
    },
    {
      id: "story-proposal-2",
      match_id: MATCH_ID,
      side: "a",
      proposed_by: "story-pedro",
      created_at: "2026-09-14T11:30:00Z",
      options: [at("2026-09-16T22:00:00Z"), at("2026-09-18T22:00:00Z")],
      status: "expired",
      closed_at: "2026-09-18T22:00:00Z",
    },
  ],
  reported_dates: [],
};

/** Os dois lados propuseram: contraproposta, retirada e uma data aceita que não saiu. */
export const BOTH_SIDES_HISTORY: ScheduleHistory = {
  match_id: MATCH_ID,
  proposals: [
    {
      id: "story-proposal-1",
      match_id: MATCH_ID,
      side: "a",
      proposed_by: "story-pedro",
      created_at: "2026-09-07T13:10:00Z",
      options: [at("2026-09-09T22:00:00Z"), at("2026-09-10T22:00:00Z")],
      status: "superseded",
      superseded_by: { kind: "proposal", proposal_id: "story-proposal-2" },
      closed_at: "2026-09-08T00:20:00Z",
    },
    {
      id: "story-proposal-2",
      match_id: MATCH_ID,
      side: "b",
      proposed_by: "story-caio",
      created_at: "2026-09-08T00:20:00Z",
      options: [at("2026-09-12T12:00:00Z"), at("2026-09-13T12:00:00Z"), at("2026-09-13T18:00:00Z")],
      status: "withdrawn",
      withdrawal: { by: "player", player_id: "story-diego" },
      closed_at: "2026-09-09T15:00:00Z",
    },
    {
      id: "story-proposal-3",
      match_id: MATCH_ID,
      side: "b",
      proposed_by: "story-diego",
      created_at: "2026-09-09T15:05:00Z",
      options: [at("2026-09-15T22:00:00Z"), at("2026-09-17T22:00:00Z", "Arena Sunset · Belo Horizonte/MG")],
      status: "accepted",
      accepted_option_index: 0,
      responded_by: "story-thiago",
      responded_at: "2026-09-10T01:40:00Z",
    },
  ],
  reported_dates: [],
};

/** A data foi combinada no WhatsApp e informada por um lado só (M14), substituindo a proposta pendente (M15). */
export const REPORTED_DATE_HISTORY: ScheduleHistory = {
  match_id: MATCH_ID,
  proposals: [
    {
      id: "story-proposal-1",
      match_id: MATCH_ID,
      side: "a",
      proposed_by: "story-pedro",
      created_at: "2026-09-07T13:10:00Z",
      options: [at("2026-09-09T22:00:00Z"), at("2026-09-10T22:00:00Z"), at("2026-09-12T12:00:00Z")],
      status: "superseded",
      superseded_by: { kind: "reported_date", reported_date_id: "story-reported-1" },
      closed_at: "2026-09-08T19:00:00Z",
    },
  ],
  reported_dates: [
    {
      id: "story-reported-1",
      match_id: MATCH_ID,
      reported_by: "story-diego",
      reported_at: "2026-09-08T19:00:00Z",
      starts_at: "2026-09-14T22:00:00Z",
      venue: VENUE,
    },
  ],
};
