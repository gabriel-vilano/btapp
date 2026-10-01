import { describe, expect, it } from "vitest";
import { gameSet, interruptedSet } from "@/src/mocks/domain/builders";
import { actorName, confirmationText, resultLine, responseDeadlineParts, sideOr } from "./resultTexts";

const NAMES = { "p-caio": "Caio", "p-diego": "Diego", "p-ana": "Ana" };
const SIDE_NAMES = { a: "Pedro e Thiago", b: "Caio e Diego" };

// Quinta, 1º/10, 9h em Brasília
const NOW = "2026-10-01T12:00:00.000Z";

describe("textos do resultado na tela do confronto", () => {
  it("quem vê vira 'Você'; nome desconhecido não quebra a frase", () => {
    expect(actorName("p-caio", "p-caio", NAMES)).toBe("Você");
    expect(actorName("p-caio", "p-pedro", NAMES)).toBe("Caio");
    expect(actorName("p-sumido", "p-pedro", NAMES)).toBe("Alguém");
    expect(sideOr(["p-caio", "p-diego"], NAMES)).toBe("Caio ou Diego");
  });

  it("prazo em contagem e data absoluta, sem urgência com mais de 24h (RG9)", () => {
    expect(responseDeadlineParts("2026-10-03T00:10:00.000Z", NOW)).toEqual({
      countdown: "em 36h",
      absolute: "sex, 02/10, 21h10",
      urgent: false,
      expired: false,
    });
  });

  it("nas últimas 24h o prazo é urgente, e depois dele, vencido", () => {
    expect(responseDeadlineParts("2026-10-02T12:00:00.000Z", NOW).urgent).toBe(true);
    expect(responseDeadlineParts("2026-10-02T12:00:00.001Z", NOW).urgent).toBe(false);
    expect(responseDeadlineParts("2026-10-01T11:59:00.000Z", NOW)).toMatchObject({ urgent: true, expired: true });
  });

  it("diz como a partida foi confirmada e por quem (R16, R39)", () => {
    const at = NOW;
    expect(confirmationText({ via: "opponent", responded_by: "p-diego", responded_at: at }, "p-pedro", NAMES)).toBe(
      "Confirmado por Diego",
    );
    expect(confirmationText({ via: "opponent", responded_by: "p-pedro", responded_at: at }, "p-pedro", NAMES)).toBe(
      "Confirmado por você",
    );
    expect(confirmationText({ via: "deadline", confirmed_at: at }, "p-pedro", NAMES)).toBe("Confirmado pelo prazo, sem resposta");
    expect(confirmationText({ via: "admin", admin_id: "p-ana", acted_at: at }, "p-pedro", NAMES)).toBe("Definido por Ana (admin)");
  });

  it("resultado numa linha, lido do vencedor", () => {
    expect(resultLine({ type: "normal", winner: "b", sets: [gameSet(4, 6)] }, SIDE_NAMES)).toBe("6/4 para Caio e Diego");
    expect(resultLine({ type: "wo", winner: "a" }, SIDE_NAMES)).toBe("W.O., vitória de Pedro e Thiago");
    expect(resultLine({ type: "retired", winner: "a", sets: [interruptedSet(2, 4)] }, SIDE_NAMES)).toBe(
      "Desistência, vitória de Pedro e Thiago (2/4)",
    );
    expect(resultLine({ type: "double_wo" }, SIDE_NAMES)).toBe("W.O. duplo, sem pontos para ninguém");
  });
});
