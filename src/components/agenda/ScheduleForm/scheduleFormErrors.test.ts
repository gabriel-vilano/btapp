import { describe, expect, it } from "vitest";
import { scheduleFormErrors } from "./scheduleFormErrors";

// Agora: quinta, 1º/10, 9h em Brasília. A rodada fecha na terça, 6/10, 23h59.
const LIMITS = { now: "2026-10-01T12:00:00.000Z", roundDeadline: "2026-10-07T02:59:00.000Z" };

describe("erros do formulário de horários", () => {
  it("horários futuros, distintos e antes do prazo passam", () => {
    expect(scheduleFormErrors(["2026-10-03T14:00", "2026-10-04T10:00"], "propose", LIMITS)).toEqual([null, null]);
  });

  it("campo vazio pede data e hora", () => {
    expect(scheduleFormErrors(["2026-10-03T14:00", ""], "propose", LIMITS)).toEqual([null, "Escolha a data e a hora."]);
  });

  it("horário que já passou não vale (M6)", () => {
    expect(scheduleFormErrors(["2026-10-01T08:00", "2026-10-03T14:00"], "propose", LIMITS)[0]).toBe(
      "Escolha um horário que ainda não passou.",
    );
  });

  it("horário depois do prazo da rodada diz quando a rodada fecha (M6)", () => {
    expect(scheduleFormErrors(["2026-10-03T14:00", "2026-10-08T10:00"], "propose", LIMITS)[1]).toBe(
      "A rodada fecha ter, 06/10, 23h59. Escolha um horário antes disso.",
    );
  });

  it("horário repetido marca só a repetição (M5)", () => {
    expect(scheduleFormErrors(["2026-10-03T14:00", "2026-10-03T14:00"], "propose", LIMITS)).toEqual([
      null,
      "Este horário já está em outra opção.",
    ]);
  });

  it("a data informada fora do app só precisa ser uma data (M14)", () => {
    expect(scheduleFormErrors(["2026-09-28T19:00"], "report", LIMITS)).toEqual([null]);
    expect(scheduleFormErrors([""], "report", LIMITS)).toEqual(["Escolha a data e a hora."]);
  });
});
