import { describe, expect, it } from "vitest";
import type { PickablePlayer } from "@/src/components/ui/SidePicker";
import {
  defaultFriendlyFormat,
  friendlyRespondersText,
  friendlySidesOf,
  friendlyVoiceOf,
  pendingFriendlyText,
  playedAtOf,
  playedOnError,
  venueOf,
} from "./friendlyReportModel";

function player(id: string, name: string): PickablePlayer {
  return { id, name, username: id, avatarUrl: null, isFriend: false };
}

const PLAYERS = [player("pedro", "Pedro Henrique"), player("thiago", "Thiago Mendes"), player("andre", "André Lima")];

// Quinta, 1º/10, 9h em Brasília
const NOW = "2026-10-01T12:00:00.000Z";

describe("defaultFriendlyFormat", () => {
  it("repete o formato do último amistoso, ou 1 set de 6 no primeiro (§6.1)", () => {
    expect(defaultFriendlyFormat("two_sets_of_6_stb")).toBe("two_sets_of_6_stb");
    expect(defaultFriendlyFormat(null)).toBe("one_set_of_6");
  });
});

describe("friendlySidesOf", () => {
  it("põe quem lança no lado a, com o parceiro em duplas", () => {
    const slots = { partner: "pedro", opponent1: "thiago", opponent2: "andre" };
    expect(friendlySidesOf("lucas", slots, "doubles")).toEqual({ a: ["lucas", "pedro"], b: ["thiago", "andre"] });
    expect(friendlySidesOf("lucas", slots, "singles")).toEqual({ a: ["lucas"], b: ["thiago"] });
  });

  it("devolve null enquanto falta alguém", () => {
    expect(friendlySidesOf("lucas", { partner: "pedro", opponent1: "thiago", opponent2: null }, "doubles")).toBeNull();
    expect(friendlySidesOf("lucas", { partner: null, opponent1: null, opponent2: null }, "singles")).toBeNull();
  });
});

describe("friendlyVoiceOf", () => {
  it("chama o lado de quem lança de Você, e o outro pelos primeiros nomes", () => {
    expect(friendlyVoiceOf({ a: ["lucas", "pedro"], b: ["thiago", "andre"] }, PLAYERS)).toEqual({
      names: { a: "Você e Pedro", b: "Thiago e André" },
      userSide: "a",
      isSingles: false,
    });
    expect(friendlyVoiceOf({ a: ["lucas"], b: ["thiago"] }, PLAYERS).names).toEqual({ a: "Você", b: "Thiago" });
  });
});

describe("pendingFriendlyText", () => {
  it("diz quem confirma e que não vale ranking, com o verbo concordando (§6.1)", () => {
    const sides = { a: ["lucas", "pedro"], b: ["thiago", "andre"] };
    expect(pendingFriendlyText(friendlyRespondersText(sides, PLAYERS), false)).toBe(
      "Fica pendente até Thiago ou André confirmarem. Não vale ponto de ranking.",
    );
    expect(pendingFriendlyText("Thiago", true)).toBe("Fica pendente até Thiago confirmar. Não vale ponto de ranking.");
  });
});

describe("playedOnError", () => {
  it("aceita hoje e o passado, no dia de Brasília", () => {
    expect(playedOnError("2026-10-01", NOW)).toBeNull();
    expect(playedOnError("2026-09-20", NOW)).toBeNull();
    // 1h da manhã de 1º/10 em UTC ainda é 30/09 em Brasília
    expect(playedOnError("2026-10-01", "2026-10-01T01:00:00.000Z")).toBe("A data do jogo não pode ser depois de hoje.");
  });

  it("recusa data vazia ou no futuro", () => {
    expect(playedOnError("", NOW)).toBe("Informe a data do jogo.");
    expect(playedOnError("2026-10-02", NOW)).toBe("A data do jogo não pode ser depois de hoje.");
  });
});

describe("playedAtOf", () => {
  it("guarda o dia ao meio-dia de Brasília", () => {
    expect(playedAtOf("2026-09-30")).toBe("2026-09-30T15:00:00.000Z");
  });

  it("recusa data inválida dizendo o valor e o formato esperado", () => {
    expect(() => playedAtOf("30/09/2026")).toThrow("recebi '30/09/2026', esperado AAAA-MM-DD");
  });
});

describe("venueOf", () => {
  it("guarda a arena sem espaços nas pontas, e vazia como null", () => {
    expect(venueOf("  Arena Mangaba ")).toBe("Arena Mangaba");
    expect(venueOf("   ")).toBeNull();
  });
});
