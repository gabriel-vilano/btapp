import type { FriendlyMatch } from "@/src/types/domain";
import type { FriendlyScreenData } from "./friendlyScreenData";

// Amistoso fictício para as stories da tela. Datas fixas em UTC (a tela
// mostra no fuso de São Paulo, UTC-3), para o texto não mudar com o relógio.

/** Quinta, 1º/10, 9h em Brasília. */
export const FRIENDLY_SCREEN_NOW = "2026-10-01T12:00:00.000Z";

/** Segunda, 28/09, 9h em Brasília: "há 3 dias" no "agora" das stories. */
const REPORTED_AT = "2026-09-28T12:00:00.000Z";

export const FRIENDLY_PLAYER = {
  pedro: "story-pedro",
  thiago: "story-thiago",
  lucas: "story-lucas",
  rafael: "story-rafael",
  caio: "story-caio",
};

const AWAITING: FriendlyMatch = {
  id: "story-friendly",
  kind: "friendly",
  side_a_unit_id: "story-unit-pedro-thiago",
  side_b_unit_id: "story-unit-lucas-rafael",
  format: "one_set_of_6",
  played_at: "2026-09-27T15:00:00.000Z",
  venue: "Arena Mangaba – Beach · Nova Lima/MG",
  created_at: REPORTED_AT,
  report: {
    result: { type: "normal", winner: "a", sets: [{ games_a: 6, games_b: 3, super_tiebreak: false, interrupted: false }] },
    reported_by: FRIENDLY_PLAYER.pedro,
    reported_at: REPORTED_AT,
  },
  status: "awaiting_confirmation",
};

/** Pedro e Thiago × Lucas e Rafael, lançado pelo Pedro. `viewerId` diz quem vê. */
export function friendlyScreenStoryData(viewerId: string, match: FriendlyMatch = AWAITING): FriendlyScreenData {
  return {
    match,
    sides: { a: [FRIENDLY_PLAYER.pedro, FRIENDLY_PLAYER.thiago], b: [FRIENDLY_PLAYER.lucas, FRIENDLY_PLAYER.rafael] },
    sideNames: { a: "Pedro e Thiago", b: "Lucas e Rafael" },
    playerNames: {
      [FRIENDLY_PLAYER.pedro]: "Pedro",
      [FRIENDLY_PLAYER.thiago]: "Thiago",
      [FRIENDLY_PLAYER.lucas]: "Lucas",
      [FRIENDLY_PLAYER.rafael]: "Rafael",
    },
    viewerId,
  };
}

const RESPONDED_AT = "2026-09-29T00:30:00.000Z";

/** O mesmo amistoso, num estado final. */
export function settledFriendly(status: "confirmed" | "discarded" | "cancelled"): FriendlyMatch {
  if (status === "cancelled") return { ...AWAITING, status, cancelled_at: RESPONDED_AT };
  return { ...AWAITING, status, response: { responded_by: FRIENDLY_PLAYER.rafael, responded_at: RESPONDED_AT } };
}
