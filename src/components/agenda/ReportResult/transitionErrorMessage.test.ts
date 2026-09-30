import { describe, expect, it } from "vitest";
import { gameSet } from "@/src/mocks/domain/builders";
import type { RankingMatch } from "@/src/types/domain";
import { STORY_NOW, STORY_PLAYER, rankingStoryData, tournamentStoryData } from "./storyFixtures";
import { transitionErrorMessage } from "./transitionErrorMessage";

const data = rankingStoryData();

function reportedBy(playerId: string): RankingMatch {
  const report = { result: { type: "normal" as const, winner: "a" as const, sets: [gameSet(6, 4)] }, reported_by: playerId, reported_at: STORY_NOW };
  return { ...(data.match as RankingMatch), status: "awaiting_confirmation", report } as RankingMatch;
}

describe("transitionErrorMessage", () => {
  it("invalid_status: o parceiro lançou primeiro", () => {
    expect(transitionErrorMessage("invalid_status", data, reportedBy(STORY_PLAYER.thiago))).toBe(
      "Thiago já lançou este resultado.",
    );
  });

  it("invalid_status: o adversário lançou primeiro e o jogador confere", () => {
    expect(transitionErrorMessage("invalid_status", data, reportedBy(STORY_PLAYER.caio))).toBe(
      "Caio já lançou o resultado. Confira e confirme ou conteste.",
    );
  });

  it("too_late: a rodada fechou, com a data em Brasília", () => {
    expect(transitionErrorMessage("too_late", data, data.match)).toBe(
      "A rodada fechou em ter, 06/10, 23h59. A partida foi para o admin.",
    );
  });

  it("not_allowed: fora da partida no ranking, não admin no torneio", () => {
    expect(transitionErrorMessage("not_allowed", data, data.match)).toBe("Você não está nesta partida.");
    const tournament = tournamentStoryData(STORY_PLAYER.pedro);
    expect(transitionErrorMessage("not_allowed", tournament, tournament.match)).toBe(
      "Só o admin do torneio lança este resultado.",
    );
  });
});
