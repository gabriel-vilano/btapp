import { describe, expect, it } from "vitest";
import { brasiliaLocalToIso, brasiliaToday, isoToBrasiliaLocal } from "./brasiliaDateTime";

describe("brasiliaLocalToIso", () => {
  it("lê o horário digitado como o de Brasília", () => {
    expect(brasiliaLocalToIso("2026-10-03T14:00")).toBe("2026-10-03T17:00:00.000Z");
  });

  it("às 22h em Brasília já é o dia seguinte em UTC", () => {
    expect(brasiliaLocalToIso("2026-10-03T22:30")).toBe("2026-10-04T01:30:00.000Z");
  });

  it("campo vazio ou incompleto não é data", () => {
    expect(brasiliaLocalToIso("")).toBeNull();
    expect(brasiliaLocalToIso("2026-10-03")).toBeNull();
    expect(brasiliaLocalToIso("2026-13-40T99:99")).toBeNull();
  });
});

describe("isoToBrasiliaLocal", () => {
  it("é o inverso de brasiliaLocalToIso", () => {
    expect(isoToBrasiliaLocal("2026-10-04T01:30:00.000Z")).toBe("2026-10-03T22:30");
    expect(brasiliaLocalToIso(isoToBrasiliaLocal("2026-10-03T17:00:00.000Z"))).toBe("2026-10-03T17:00:00.000Z");
  });

  it("recusa data inválida dizendo o que recebeu", () => {
    expect(() => isoToBrasiliaLocal("sábado")).toThrow(/sábado/);
  });
});

describe("brasiliaToday", () => {
  // 02h em UTC ainda é o dia anterior em Brasília (UTC-3)
  it("usa o dia de Brasília, não o de UTC", () => {
    expect(brasiliaToday(new Date("2026-10-01T02:00:00Z"))).toBe("2026-09-30");
    expect(brasiliaToday(new Date("2026-10-01T03:00:00Z"))).toBe("2026-10-01");
  });
});
