import { describe, expect, it } from "vitest";
import type { FriendlyMatch } from "@/src/types/domain";
import {
  awaitingFriendlyTitle,
  cancelledLine,
  confirmedLine,
  discardedLine,
  friendlyErrorMessage,
  reportedAgoLine,
} from "./friendlyResultTexts";
import type { FriendlyScreenData } from "./friendlyScreenData";

// Quinta, 1º/10, 9h em Brasília
const NOW = "2026-10-01T12:00:00.000Z";
const REPORTED_AT = "2026-09-28T12:00:00.000Z";

const AWAITING = {
  id: "friendly-1",
  kind: "friendly",
  side_a_unit_id: "unit-pedro-thiago",
  side_b_unit_id: "unit-lucas-rafael",
  format: "one_set_of_6",
  played_at: "2026-09-27T15:00:00.000Z",
  venue: null,
  created_at: REPORTED_AT,
  report: {
    result: { type: "normal", winner: "a", sets: [{ games_a: 6, games_b: 3, super_tiebreak: false, interrupted: false }] },
    reported_by: "pedro",
    reported_at: REPORTED_AT,
  },
  status: "awaiting_confirmation",
} satisfies FriendlyMatch;

function dataFor(viewerId: string): FriendlyScreenData {
  return {
    match: AWAITING,
    sides: { a: ["pedro", "thiago"], b: ["lucas", "rafael"] },
    sideNames: { a: "Pedro e Thiago", b: "Lucas e Rafael" },
    playerNames: { pedro: "Pedro", thiago: "Thiago", lucas: "Lucas", rafael: "Rafael" },
    viewerId,
  };
}

describe("awaitingFriendlyTitle", () => {
  it("quem responde vê quem lançou; quem lançou e o parceiro, quem falta responder", () => {
    expect(awaitingFriendlyTitle(AWAITING, dataFor("lucas"), "responder")).toBe("Pedro lançou o amistoso");
    expect(awaitingFriendlyTitle(AWAITING, dataFor("pedro"), "reporter")).toBe("Aguardando Lucas ou Rafael");
    expect(awaitingFriendlyTitle(AWAITING, dataFor("thiago"), "reporter_partner")).toBe("Aguardando Lucas ou Rafael");
    expect(awaitingFriendlyTitle(AWAITING, dataFor("caio"), "outsider")).toBe("Amistoso lançado");
  });
});

describe("reportedAgoLine", () => {
  it("no lugar do prazo, há quanto tempo foi lançado (§6.2)", () => {
    expect(reportedAgoLine(AWAITING, dataFor("lucas"), "responder", NOW)).toBe("Lançado há 3 dias.");
    expect(reportedAgoLine(AWAITING, dataFor("pedro"), "reporter", NOW)).toBe("Você lançou há 3 dias.");
    expect(reportedAgoLine(AWAITING, dataFor("thiago"), "reporter_partner", NOW)).toBe("Pedro lançou há 3 dias.");
    expect(reportedAgoLine(AWAITING, dataFor("caio"), "outsider", NOW)).toBe(
      "Pedro lançou há 3 dias. Aguardando Lucas ou Rafael.",
    );
  });
});

describe("linhas dos estados finais", () => {
  it("confirmado diz quem confirmou e quando", () => {
    expect(confirmedLine("lucas", NOW, dataFor("pedro"))).toBe("Confirmado por Lucas · qui, 01/10, 9h");
    expect(confirmedLine("lucas", NOW, dataFor("lucas"))).toBe("Confirmado por você · qui, 01/10, 9h");
  });

  it("descartado diz quem contestou e como valer (R43)", () => {
    expect(discardedLine("rafael", NOW, dataFor("pedro"))).toBe(
      "Rafael contestou · qui, 01/10, 9h. Para valer, um dos lados lança de novo.",
    );
  });

  it("cancelado é sempre de quem lançou", () => {
    const cancelled = { ...AWAITING, status: "cancelled", cancelled_at: NOW } satisfies FriendlyMatch;
    expect(cancelledLine(cancelled, dataFor("pedro"))).toBe("Você cancelou · qui, 01/10, 9h.");
    expect(cancelledLine(cancelled, dataFor("lucas"))).toBe("Pedro cancelou · qui, 01/10, 9h.");
  });
});

describe("friendlyErrorMessage", () => {
  it("escolhe a mensagem pelo code e pela ação", () => {
    expect(friendlyErrorMessage("not_allowed", "cancel")).toBe("Só quem lançou pode cancelar o amistoso.");
    expect(friendlyErrorMessage("not_allowed", "respond")).toBe("Só o outro lado responde ao amistoso.");
    expect(friendlyErrorMessage("invalid_status", "respond")).toBe(
      "O amistoso mudou enquanto você estava na tela. Confira o estado dele.",
    );
  });
});
