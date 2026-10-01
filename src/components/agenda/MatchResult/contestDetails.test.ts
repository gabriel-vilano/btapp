import { describe, expect, it } from "vitest";
import { EMPTY_SCORE_DRAFT, type ScoreDraft } from "@/src/components/ui/ScoreInput";
import { contestDetailsOf } from "./contestDetails";

const OPTIONS = { format: "one_set_of_6" as const, userSide: "b" as const };

const draftWith = (winner: "a" | "b" | null, loserGames: number | null): ScoreDraft => ({
  ...EMPTY_SCORE_DRAFT,
  gamesSets: [{ winner, loserGames }],
});

describe("o que a contestação envia (RG15)", () => {
  it("sem motivo não envia", () => {
    expect(contestDetailsOf(null, EMPTY_SCORE_DRAFT, OPTIONS)).toBe("Escolha o motivo da contestação.");
  });

  it("motivo sem placar: o placar lembrado só existe no 'placar diferente'", () => {
    expect(contestDetailsOf("not_played", draftWith("a", 4), OPTIONS)).toEqual({ reason: "not_played" });
    expect(contestDetailsOf("different_score", EMPTY_SCORE_DRAFT, OPTIONS)).toEqual({
      reason: "different_score",
      remembered_result: null,
    });
  });

  it("placar lembrado completo vai junto, com o vencedor que sai do placar", () => {
    expect(contestDetailsOf("different_score", draftWith("b", 5), OPTIONS)).toEqual({
      reason: "different_score",
      remembered_result: { type: "normal", winner: "b", sets: [{ games_a: 5, games_b: 7, super_tiebreak: false, interrupted: false }] },
    });
  });

  it("placar lembrado pela metade pede para completar ou limpar", () => {
    expect(contestDetailsOf("different_score", draftWith("b", null), OPTIONS)).toMatch(/Complete os sets ou limpe o placar/);
  });
});
