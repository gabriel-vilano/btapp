import { describe, expect, it } from "vitest";
import { gameSet, interruptedSet } from "@/src/mocks/domain/builders";
import { DEFAULT_SCORING_RULE } from "@/src/types/domain";
import { completedScoreText, pointsPreview, responseDeadlineText, winnerLine, type SideVoice } from "./reportSummary";
import { STORY_NOW, rankingStoryData, tournamentStoryData } from "./storyFixtures";

// Pedro e Thiago estão no lado B: o texto fala com eles mesmo assim
const voice: SideVoice = { names: { a: "Caio e Diego", b: "Você e Thiago" }, userSide: "b", isSingles: false };

describe("textos da revisão", () => {
  it("vencedor do ponto de vista de quem lança", () => {
    expect(winnerLine({ type: "normal", winner: "b", sets: [gameSet(4, 6)] }, voice)).toBe("Vitória de vocês");
    expect(winnerLine({ type: "normal", winner: "a", sets: [gameSet(6, 4)] }, voice)).toBe("Vitória de Caio e Diego");
  });

  it("pontos previstos com o lado de quem lança primeiro (RG14)", () => {
    const result = { type: "normal" as const, winner: "b" as const, sets: [gameSet(4, 6)] };
    expect(pointsPreview(result, "one_set_of_6", DEFAULT_SCORING_RULE, voice)).toBe(
      "Se confirmado: +104 para vocês, +46 para Caio e Diego.",
    );
  });

  it("W.O. escreve o zero sem sinal", () => {
    expect(pointsPreview({ type: "wo", winner: "b" }, "one_set_of_6", DEFAULT_SCORING_RULE, voice)).toBe(
      "Se confirmado: +100 para vocês, 0 para Caio e Diego.",
    );
  });

  it("placar completado da desistência, com o STB marcado (RG6)", () => {
    const result = { type: "retired" as const, winner: "b" as const, sets: [gameSet(6, 4), interruptedSet(2, 1)] };
    // 1 set para cada lado depois de completar o 2º: o STB vai para quem ficou
    expect(completedScoreText(result, "two_sets_of_6_stb", voice)).toBe(
      "Para os pontos, o placar vale como 4/6 6/2 10/0 (STB), completado pelo formato.",
    );
  });

  it("prazo de resposta do outro lado, a partir do envio (RG7)", () => {
    expect(responseDeadlineText(rankingStoryData(), "a", STORY_NOW)).toBe(
      "Caio ou Diego têm até sáb, 03/10, 9h, para confirmar. Sem resposta, o resultado vale.",
    );
  });

  it("no torneio, o resultado vale na hora (§5.3)", () => {
    expect(responseDeadlineText(tournamentStoryData(), "a", STORY_NOW)).toBe(
      "O resultado vale na hora e aparece no feed.",
    );
  });
});
