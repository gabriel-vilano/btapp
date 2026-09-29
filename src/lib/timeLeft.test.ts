import { describe, expect, it } from "vitest";
import { formatTimeLeft } from "./timeLeft";

const NOW = "2026-10-01T12:00:00.000Z";

describe("formatTimeLeft", () => {
  it("conta em horas até 48h, como na agenda", () => {
    expect(formatTimeLeft("2026-10-02T19:00:00.000Z", NOW)).toBe("em 31h");
    expect(formatTimeLeft("2026-10-03T11:59:00.000Z", NOW)).toBe("em 47h");
  });

  it("a partir de 48h, conta em dias, arredondado para baixo", () => {
    expect(formatTimeLeft("2026-10-03T12:00:00.000Z", NOW)).toBe("em 2 dias");
    expect(formatTimeLeft("2026-10-06T20:00:00.000Z", NOW)).toBe("em 5 dias");
  });

  it("abaixo de 1h, conta em minutos; prazo vencido é 'agora'", () => {
    expect(formatTimeLeft("2026-10-01T12:40:00.000Z", NOW)).toBe("em 40min");
    expect(formatTimeLeft("2026-10-01T11:00:00.000Z", NOW)).toBe("agora");
  });

  it("recusa data inválida dizendo o que recebeu", () => {
    expect(() => formatTimeLeft("amanhã", NOW)).toThrow(/amanhã/);
  });
});
