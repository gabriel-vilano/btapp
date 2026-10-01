import { describe, expect, it } from "vitest";
import { RESULT_MATCHES } from "../MatchScreen/resultStoryFixtures";
import { PLAYER, storyData } from "../MatchScreen/storyFixtures";
import { peopleNamesOf } from "./matchResultContext";
import { resultTimelineOf } from "./resultTimeline";

const data = storyData({ match_id: "story-match-r3", proposals: [], reported_dates: [] });
const names = { people: peopleNamesOf(data), sides: data.sideNames, viewerId: PLAYER.pedro };

const summaryOf = (match: Parameters<typeof resultTimelineOf>[0]) =>
  resultTimelineOf(match, names).map((event) => [event.actor ?? null, event.actorRole ?? null, event.action]);

describe("histórico do resultado (§4.3, RG11)", () => {
  it("lançamento desfeito continua no histórico (R48)", () => {
    expect(summaryOf(RESULT_MATCHES.undone)).toEqual([
      ["Você", null, "lançou o resultado"],
      ["Você", null, "desfez o lançamento"],
    ]);
  });

  it("contestação com o motivo e o placar lembrado", () => {
    const events = resultTimelineOf(RESULT_MATCHES.inArbitration, names);
    expect(events.map((event) => event.action)).toEqual(["lançou o resultado", "contestou o resultado"]);
    expect(events[1].detail).toBe("Placar diferente. Lembra 7/5 para Pedro e Thiago");
  });

  it("atos do admin aparecem com nome e papel, em ordem", () => {
    expect(summaryOf(RESULT_MATCHES.confirmedByAdminCorrected)).toEqual([
      ["Caio", null, "lançou o resultado"],
      ["Ana", "admin", "definiu o resultado"],
      ["Ana", "admin", "corrigiu o placar"],
    ]);
    expect(summaryOf(RESULT_MATCHES.annulled)).toEqual([["Ana", "admin", "anulou o resultado"]]);
  });

  it("a confirmação pelo prazo é do sistema, sem autor", () => {
    expect(summaryOf(RESULT_MATCHES.confirmedByDeadline).at(-1)).toEqual([
      null,
      null,
      "O prazo de resposta acabou e o resultado foi confirmado.",
    ]);
  });
});
