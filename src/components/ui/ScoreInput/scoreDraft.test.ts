import { describe, expect, it } from "vitest";
import {
  EMPTY_SCORE_DRAFT,
  draftToResult,
  gamesSetFrom,
  interruptedBounds,
  isInvalidSuperTiebreak,
  scoreSlots,
  type ScoreDraft,
} from "./scoreDraft";
import { setPreview } from "./scorePreview";

const USER_A = { format: "one_set_of_6", type: "normal", userSide: "a" } as const;

function draft(partial: Partial<ScoreDraft>): ScoreDraft {
  return { ...EMPTY_SCORE_DRAFT, ...partial };
}

function slotKinds(value: ScoreDraft, format: Parameters<typeof scoreSlots>[1], type: Parameters<typeof scoreSlots>[2]) {
  return scoreSlots(value, format, type).map((slot) => `${slot.kind}:${slot.index}`);
}

describe("gamesSetFrom", () => {
  it.each([
    [4, 6, [6, 4]],
    [5, 6, [7, 5]],
    [6, 6, [7, 6]],
    [6, 8, [8, 6]],
    [7, 8, [9, 7]],
    [8, 8, [9, 8]],
  ])("perdedor com %i no set de %i vira %j", (loserGames, target, expected) => {
    const set = gamesSetFrom({ winner: "a", loserGames }, target);
    expect([set?.games_a, set?.games_b]).toEqual(expected);
  });

  it("monta o set do lado B com o vencedor à direita", () => {
    expect(gamesSetFrom({ winner: "b", loserGames: 3 }, 6)).toMatchObject({ games_a: 3, games_b: 6 });
  });

  it("fica nulo até os dois toques", () => {
    expect(gamesSetFrom({ winner: "a", loserGames: null }, 6)).toBeNull();
  });
});

describe("scoreSlots no jogo normal", () => {
  const twoSets = "two_sets_of_6_stb";

  it("mostra só o set 1 no começo", () => {
    expect(slotKinds(EMPTY_SCORE_DRAFT, twoSets, "normal")).toEqual(["games:0"]);
  });

  it("mostra o set 2 quando o set 1 fecha", () => {
    const value = draft({ gamesSets: [{ winner: "a", loserGames: 4 }] });
    expect(slotKinds(value, twoSets, "normal")).toEqual(["games:0", "games:1"]);
  });

  it("não mostra o STB no 2 a 0", () => {
    const value = draft({ gamesSets: [{ winner: "a", loserGames: 4 }, { winner: "a", loserGames: 2 }] });
    expect(slotKinds(value, twoSets, "normal")).toEqual(["games:0", "games:1"]);
  });

  it("mostra o STB no 1 set a 1", () => {
    const value = draft({ gamesSets: [{ winner: "a", loserGames: 4 }, { winner: "b", loserGames: 2 }] });
    expect(slotKinds(value, twoSets, "normal")).toEqual(["games:0", "games:1", "super_tiebreak:2"]);
  });

  it("W.O. não tem set", () => {
    expect(scoreSlots(EMPTY_SCORE_DRAFT, "one_set_of_6", "wo")).toEqual([]);
  });
});

describe("scoreSlots na desistência", () => {
  it("no formato de 1 set, o set 1 é o interrompido", () => {
    expect(slotKinds(EMPTY_SCORE_DRAFT, "one_set_of_8", "retired")).toEqual(["interrupted:0"]);
  });

  it("no formato de 2 sets, espera o jogador dizer em que set foi", () => {
    expect(scoreSlots(EMPTY_SCORE_DRAFT, "two_sets_of_6_stb", "retired")).toEqual([]);
  });

  it("com a desistência no STB, o set 2 não pode ir para quem venceu o set 1", () => {
    const value = draft({ interruptedIndex: 2, gamesSets: [{ winner: "a", loserGames: 4 }] });
    const slots = scoreSlots(value, "two_sets_of_6_stb", "retired");
    expect(slots[1]).toMatchObject({ kind: "games", blockedWinner: "a" });
  });

  it("descarta o vencedor bloqueado que sobrou de uma troca no set 1", () => {
    const value = draft({
      interruptedIndex: 2,
      gamesSets: [{ winner: "a", loserGames: 4 }, { winner: "a", loserGames: 3 }],
    });
    const slots = scoreSlots(value, "two_sets_of_6_stb", "retired");
    expect(slots).toHaveLength(2);
    expect(slots[1]).toMatchObject({ entry: { winner: null, loserGames: null } });
  });
});

describe("interruptedBounds", () => {
  it("no set de 6, um lado só chega a 6 com o outro em 5 ou 6", () => {
    expect(interruptedBounds(4, 6)).toEqual({ min: 0, max: 5 });
    expect(interruptedBounds(5, 6)).toEqual({ min: 0, max: 6 });
  });

  it("com o outro lado em 6, este não desce de 5 (6/4 fecharia o set)", () => {
    expect(interruptedBounds(6, 6)).toEqual({ min: 5, max: 6 });
  });

  it("no STB, o alvo é 10", () => {
    expect(interruptedBounds(8, 10)).toEqual({ min: 0, max: 9 });
    expect(interruptedBounds(10, 10)).toEqual({ min: 9, max: 10 });
  });
});

describe("isInvalidSuperTiebreak", () => {
  it.each([
    ["10", "8", false],
    ["12", "10", false],
    ["10", "9", true],
    ["9", "7", true],
    ["", "8", false],
  ])("%s/%s → inválido: %s", (a, b, expected) => {
    expect(isInvalidSuperTiebreak({ a, b })).toBe(expected);
  });
});

describe("draftToResult", () => {
  it("fica incompleto até o set fechar", () => {
    const value = draft({ gamesSets: [{ winner: "a", loserGames: null }] });
    expect(draftToResult(value, USER_A)).toEqual({ status: "incomplete" });
  });

  it("tira o vencedor do placar (RG5)", () => {
    const value = draft({ gamesSets: [{ winner: "b", loserGames: 4 }] });
    expect(draftToResult(value, USER_A)).toEqual({
      status: "valid",
      result: { type: "normal", winner: "b", sets: [{ games_a: 4, games_b: 6, super_tiebreak: false, interrupted: false }] },
    });
  });

  it("monta os 2 sets + STB", () => {
    const value = draft({
      gamesSets: [{ winner: "a", loserGames: 4 }, { winner: "b", loserGames: 6 }],
      superTiebreak: { a: "12", b: "10" },
    });
    const outcome = draftToResult(value, { ...USER_A, format: "two_sets_of_6_stb" });
    expect(outcome).toMatchObject({ status: "valid", result: { winner: "a" } });
  });

  it("recusa o STB que não fecha, com o code do validateScore", () => {
    const value = draft({
      gamesSets: [{ winner: "a", loserGames: 4 }, { winner: "b", loserGames: 6 }],
      superTiebreak: { a: "10", b: "9" },
    });
    const outcome = draftToResult(value, { ...USER_A, format: "two_sets_of_6_stb" });
    expect(outcome).toMatchObject({ status: "invalid", code: "set_score" });
  });

  it("dá a desistência a quem lança (RG4), com o set interrompido", () => {
    const value = draft({ interruptedIndex: 1, gamesSets: [{ winner: "b", loserGames: 3 }], interrupted: { a: 2, b: 1 } });
    const outcome = draftToResult(value, { format: "two_sets_of_6_stb", type: "retired", userSide: "a" });
    expect(outcome).toMatchObject({
      status: "valid",
      result: { type: "retired", winner: "a", sets: [{ games_a: 3, games_b: 6 }, { games_a: 2, games_b: 1, interrupted: true }] },
    });
  });

  it("aceita a desistência antes do primeiro game (0/0)", () => {
    const outcome = draftToResult(EMPTY_SCORE_DRAFT, { format: "one_set_of_6", type: "retired", userSide: "b" });
    expect(outcome).toMatchObject({ status: "valid", result: { type: "retired", winner: "b" } });
  });

  it("W.O. vai para quem lança, sem placar", () => {
    const outcome = draftToResult(EMPTY_SCORE_DRAFT, { ...USER_A, type: "wo", userSide: "b" });
    expect(outcome).toEqual({ status: "valid", result: { type: "wo", winner: "b" } });
  });
});

describe("setPreview", () => {
  const perspective = { userSide: "b", sideNames: { a: "Lucas e Rafael", b: "Você e Pedro" }, isSingles: false } as const;

  it("escreve o placar do lado de quem lança", () => {
    const set = { games_a: 4, games_b: 6, super_tiebreak: false, interrupted: false };
    expect(setPreview(set, perspective)).toBe("6/4 para vocês");
  });

  it("nomeia o adversário quando ele venceu", () => {
    const set = { games_a: 7, games_b: 5, super_tiebreak: false, interrupted: false };
    expect(setPreview(set, perspective)).toBe("5/7 para Lucas e Rafael");
  });

  it("usa \"você\" em simples", () => {
    const set = { games_a: 2, games_b: 6, super_tiebreak: false, interrupted: false };
    expect(setPreview(set, { ...perspective, isSingles: true })).toBe("6/2 para você");
  });
});
