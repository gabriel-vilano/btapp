import { describe, expect, it } from "vitest";
import { formatNextMatch, formatTournamentDates } from "./tournamentDates";

// Horários em UTC; Brasília é UTC−3 (sem horário de verão desde 2019)

describe("formatNextMatch", () => {
  it("mostra dia da semana, hora cheia e quadra", () => {
    expect(formatNextMatch({ startsAt: "2026-10-10T12:00:00.000Z", court: "Quadra 3" })).toBe("Sáb, 9h · Quadra 3");
  });

  it("mostra os minutos fora da hora cheia", () => {
    expect(formatNextMatch({ startsAt: "2026-10-11T22:30:00.000Z", court: "Quadra 1" })).toBe("Dom, 19h30 · Quadra 1");
  });

  it("sem quadra definida, fica só o dia e a hora", () => {
    expect(formatNextMatch({ startsAt: "2026-10-10T12:00:00.000Z", court: null })).toBe("Sáb, 9h");
  });

  it("usa o fuso de Brasília: 1h UTC de domingo ainda é sábado na quadra", () => {
    expect(formatNextMatch({ startsAt: "2026-10-11T01:00:00.000Z", court: null })).toBe("Sáb, 22h");
  });
});

describe("formatTournamentDates", () => {
  it("torneio de 1 dia: dia da semana e data", () => {
    expect(formatTournamentDates("2026-10-10T11:00:00.000Z", "2026-10-10T21:00:00.000Z")).toBe("Sáb, 10 de outubro");
  });

  it("dois dias no mesmo mês", () => {
    expect(formatTournamentDates("2026-10-10T11:00:00.000Z", "2026-10-11T21:00:00.000Z")).toBe("10 e 11 de outubro");
  });

  it("dois dias na virada do mês, com o dia 1 ordinal", () => {
    expect(formatTournamentDates("2026-10-31T11:00:00.000Z", "2026-11-01T21:00:00.000Z")).toBe(
      "31 de outubro a 1º de novembro",
    );
  });
});
