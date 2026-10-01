import { describe, expect, it } from "vitest";
import type { FriendlyResult } from "@/src/types/domain";
import { reportFriendlyLocally, type FriendlyReportRequest } from "./submitFriendly";

const AT = "2026-10-01T12:00:00.000Z";
const CONTEXT = { viewerId: "lucas", createId: () => "match-new" };

function request(result: FriendlyResult): FriendlyReportRequest {
  return {
    sides: { a: ["lucas", "pedro"], b: ["thiago", "andre"] },
    format: "one_set_of_6",
    played_at: "2026-09-30T15:00:00.000Z",
    venue: "Arena Mangaba",
    result,
    at: AT,
  };
}

const WIN_6_4: FriendlyResult = {
  type: "normal",
  winner: "a",
  sets: [{ games_a: 6, games_b: 4, super_tiebreak: false, interrupted: false }],
};

describe("reportFriendlyLocally", () => {
  it("cria o amistoso já aguardando a confirmação do outro lado (R42, R43)", () => {
    const outcome = reportFriendlyLocally(request(WIN_6_4), CONTEXT);
    expect(outcome).toEqual({
      status: "reported",
      match: {
        id: "match-new",
        kind: "friendly",
        side_a_unit_id: "unit-lucas-pedro",
        side_b_unit_id: "unit-andre-thiago",
        format: "one_set_of_6",
        played_at: "2026-09-30T15:00:00.000Z",
        venue: "Arena Mangaba",
        created_at: AT,
        report: { result: WIN_6_4, reported_by: "lucas", reported_at: AT },
        status: "awaiting_confirmation",
      },
    });
  });

  it("valida o placar de novo, como o servidor (§3.7)", () => {
    const invalid: FriendlyResult = { ...WIN_6_4, sets: [{ ...WIN_6_4.sets[0], games_a: 6, games_b: 5 }] };
    expect(reportFriendlyLocally(request(invalid), CONTEXT)).toEqual({ status: "score_rejected", code: "set_score" });
  });

  it("recusa quem não está nos lados", () => {
    const outcome = reportFriendlyLocally(request(WIN_6_4), { ...CONTEXT, viewerId: "caio" });
    expect(outcome).toEqual({ status: "transition_rejected", code: "not_allowed" });
  });
});
