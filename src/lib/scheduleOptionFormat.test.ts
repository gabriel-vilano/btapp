import { describe, expect, it } from "vitest";
import { formatScheduleDay, formatScheduleShort, formatScheduleTime } from "./scheduleOptionFormat";

// 17h UTC = 14h em Brasília (UTC−3, sem horário de verão desde 2019)
const SAT_14H = "2026-10-03T17:00:00.000Z";
const WED_19H30 = "2026-10-07T22:30:00.000Z";

describe("formatScheduleDay", () => {
  it("dia por extenso com inicial maiúscula", () => {
    expect(formatScheduleDay(SAT_14H)).toBe("Sábado, 3 de outubro");
  });

  it("primeiro dia do mês como ordinal", () => {
    expect(formatScheduleDay("2026-10-01T12:00:00.000Z")).toBe("Quinta-feira, 1º de outubro");
  });

  it("usa o fuso de Brasília, não o UTC: 1h UTC de domingo ainda é sábado", () => {
    expect(formatScheduleDay("2026-10-04T01:00:00.000Z")).toBe("Sábado, 3 de outubro");
  });
});

describe("formatScheduleTime", () => {
  it("hora cheia sem minutos", () => {
    expect(formatScheduleTime(SAT_14H)).toBe("14h");
  });

  it("minutos depois do h", () => {
    expect(formatScheduleTime(WED_19H30)).toBe("19h30");
  });

  it("manhã sem zero à esquerda", () => {
    expect(formatScheduleTime("2026-10-04T11:00:00.000Z")).toBe("8h");
  });

  it("meia-noite é 0h, não 24h", () => {
    expect(formatScheduleTime("2026-10-04T03:00:00.000Z")).toBe("0h");
  });
});

describe("formatScheduleShort", () => {
  it("dia da semana e mês abreviados, sem ponto", () => {
    expect(formatScheduleShort(SAT_14H)).toBe("sáb, 3 out, 14h");
    expect(formatScheduleShort(WED_19H30)).toBe("qua, 7 out, 19h30");
  });
});
