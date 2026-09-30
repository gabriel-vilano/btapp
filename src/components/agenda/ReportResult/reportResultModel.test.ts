import { describe, expect, it } from "vitest";
import { displaySideNames, matchContextLine, reporterRoleOf, sidesInDisplayOrder } from "./reportResultModel";
import { STORY_PLAYER, rankingStoryData, tournamentStoryData } from "./storyFixtures";

describe("quem lança e como a tela chama os lados", () => {
  it("no ranking lança o jogador da partida; quem está fora, não (R13)", () => {
    expect(reporterRoleOf(rankingStoryData())).toBe("player");
    expect(reporterRoleOf(rankingStoryData({}, STORY_PLAYER.fabio))).toBeNull();
  });

  it("no torneio lança só o admin (R38)", () => {
    expect(reporterRoleOf(tournamentStoryData())).toBe("admin");
    expect(reporterRoleOf(tournamentStoryData(STORY_PLAYER.pedro))).toBeNull();
  });

  it("o lado do jogador vira \"Você e parceiro\" e vem em cima (RG3)", () => {
    const data = rankingStoryData({}, STORY_PLAYER.diego);
    expect(displaySideNames(data, "player")).toEqual({ a: "Pedro e Thiago", b: "Você e Caio" });
    expect(sidesInDisplayOrder(data)).toEqual(["b", "a"]);
  });

  it("o admin vê os nomes dos dois lados", () => {
    expect(displaySideNames(tournamentStoryData(), "admin")).toEqual({ a: "Pedro e Thiago", b: "Caio e Diego" });
  });

  it("contexto com a rodada no ranking e a fase no torneio", () => {
    expect(matchContextLine(rankingStoryData())).toBe("Ranking da Arena · Masculino B · Rodada 3");
    expect(matchContextLine(tournamentStoryData())).toBe("Copa da Arena · Masculino B · Final");
  });
});
