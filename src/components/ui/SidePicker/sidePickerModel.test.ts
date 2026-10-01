import { describe, expect, it } from "vitest";
import {
  areSlotsComplete,
  EMPTY_SIDE_SLOTS,
  MAX_PICKER_RESULTS,
  searchPickablePlayers,
  slotsForModality,
  slotsOf,
  type PickablePlayer,
} from "./sidePickerModel";

function player(id: string, name: string, username: string, isFriend = false): PickablePlayer {
  return { id, name, username, avatarUrl: null, isFriend };
}

const PLAYERS = [
  player("thiago", "Thiago Mendes", "thiagomendes"),
  player("pedro", "Pedro Henrique", "pedrohenrique", true),
  player("andre", "André Lima", "andrelima"),
  player("paulo", "Paulo César Duarte", "paulocesarduarte", true),
  player("pedrinho", "Pedrinho Alves", "pedrinho"),
];

describe("slotsOf", () => {
  it("simples tem só o adversário; duplas, parceiro e dois adversários", () => {
    expect(slotsOf("singles")).toEqual(["opponent1"]);
    expect(slotsOf("doubles")).toEqual(["partner", "opponent1", "opponent2"]);
  });
});

describe("slotsForModality", () => {
  it("trocar para simples solta o parceiro e o segundo adversário", () => {
    const slots = { partner: "pedro", opponent1: "thiago", opponent2: "andre" };
    expect(slotsForModality(slots, "singles")).toEqual({ partner: null, opponent1: "thiago", opponent2: null });
    expect(slotsForModality(slots, "doubles")).toEqual(slots);
  });
});

describe("areSlotsComplete", () => {
  it("exige todas as vagas da modalidade", () => {
    expect(areSlotsComplete(EMPTY_SIDE_SLOTS, "singles")).toBe(false);
    expect(areSlotsComplete({ ...EMPTY_SIDE_SLOTS, opponent1: "thiago" }, "singles")).toBe(true);
    expect(areSlotsComplete({ ...EMPTY_SIDE_SLOTS, opponent1: "thiago" }, "doubles")).toBe(false);
    expect(areSlotsComplete({ partner: "pedro", opponent1: "thiago", opponent2: "andre" }, "doubles")).toBe(true);
  });
});

describe("searchPickablePlayers", () => {
  const ids = (found: PickablePlayer[]) => found.map((p) => p.id);

  it("sem termo, sugere só os amigos (RG17)", () => {
    expect(ids(searchPickablePlayers(PLAYERS, "", []))).toEqual(["paulo", "pedro"]);
  });

  it("com termo, os amigos vêm primeiro e cada grupo em ordem alfabética", () => {
    expect(ids(searchPickablePlayers(PLAYERS, "e", []))).toEqual(["paulo", "pedro", "andre", "pedrinho", "thiago"]);
  });

  it("busca pelo @username e ignora acento e caixa", () => {
    expect(ids(searchPickablePlayers(PLAYERS, "@pedrinho", []))).toEqual(["pedrinho"]);
    expect(ids(searchPickablePlayers(PLAYERS, "ANDRE", []))).toEqual(["andre"]);
    expect(ids(searchPickablePlayers(PLAYERS, "césar", []))).toEqual(["paulo"]);
  });

  it("não mostra quem já está numa vaga", () => {
    expect(ids(searchPickablePlayers(PLAYERS, "ped", ["pedro"]))).toEqual(["pedrinho"]);
  });

  it("só o @ conta como termo vazio", () => {
    expect(ids(searchPickablePlayers(PLAYERS, "@", []))).toEqual(["paulo", "pedro"]);
  });

  it("corta a lista no máximo de resultados", () => {
    const many = Array.from({ length: 30 }, (_, i) => player(`p${i}`, `Jogador ${i}`, `jogador${i}`));
    expect(searchPickablePlayers(many, "jogador", [])).toHaveLength(MAX_PICKER_RESULTS);
  });
});
