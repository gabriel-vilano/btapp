import { describe, expect, it } from "vitest";
import { gameSet, interruptedSet } from "@/src/mocks/domain/builders";
import { STORY_NOW, STORY_PLAYER, rankingStoryData, tournamentStoryData } from "./storyFixtures";
import { reportLocally } from "./submitReport";

const normal64 = { type: "normal" as const, winner: "a" as const, sets: [gameSet(6, 4)] };

describe("reportLocally", () => {
  it("no ranking, o lançamento leva a Aguardando confirmação (R13)", () => {
    const data = rankingStoryData();
    const outcome = reportLocally(data.match, { result: normal64, format: "one_set_of_6", at: STORY_NOW }, data);
    expect(outcome.status).toBe("reported");
    if (outcome.status !== "reported") return;
    expect(outcome.match.status).toBe("awaiting_confirmation");
  });

  it("no torneio, nasce confirmado no formato escolhido pelo admin (R38, R29)", () => {
    const data = tournamentStoryData();
    const result = { type: "retired" as const, winner: "b" as const, sets: [gameSet(4, 6), interruptedSet(1, 2)] };
    const outcome = reportLocally(data.match, { result, format: "two_sets_of_6_stb", at: STORY_NOW }, data);
    if (outcome.status !== "reported") throw new Error(`esperado reported, recebi ${outcome.status}`);
    expect(outcome.match).toMatchObject({ status: "confirmed", format: "two_sets_of_6_stb", points: null });
  });

  it("valida o placar de novo, como o servidor (§3.7)", () => {
    const data = rankingStoryData();
    const result = { type: "normal" as const, winner: "a" as const, sets: [gameSet(6, 5)] };
    expect(reportLocally(data.match, { result, format: "one_set_of_6", at: STORY_NOW }, data)).toEqual({
      status: "score_rejected",
      code: "set_score",
    });
  });

  it("recusa com o código da transição e devolve a partida atual", () => {
    const data = rankingStoryData({}, STORY_PLAYER.fabio);
    const outcome = reportLocally(data.match, { result: normal64, format: "one_set_of_6", at: STORY_NOW }, data);
    expect(outcome).toEqual({ status: "transition_rejected", code: "not_allowed", current: data.match });
  });

  it("depois do prazo da rodada, too_late (R40)", () => {
    const data = rankingStoryData();
    const outcome = reportLocally(data.match, { result: normal64, format: "one_set_of_6", at: "2026-10-08T12:00:00.000Z" }, data);
    expect(outcome.status === "transition_rejected" && outcome.code).toBe("too_late");
  });
});
