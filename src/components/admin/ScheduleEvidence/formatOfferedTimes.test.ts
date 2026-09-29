import { describe, expect, it } from "vitest";
import { formatOfferedTimes } from "./formatOfferedTimes";

// Número e unidade ficam juntos por espaço inquebrável (U+00A0).
const nb = (text: string): string => text.replace(/(\d) /g, "$1\u00a0");

describe("formatOfferedTimes", () => {
  it("singular em horário e dia", () => {
    expect(formatOfferedTimes({ offeredTimeCount: 1, offeredDayCount: 1 })).toBe(nb("1 horário em 1 dia"));
  });

  it("plural em horários e singular em dia: vários horários na mesma data", () => {
    expect(formatOfferedTimes({ offeredTimeCount: 3, offeredDayCount: 1 })).toBe(nb("3 horários em 1 dia"));
  });

  it("plural nos dois", () => {
    expect(formatOfferedTimes({ offeredTimeCount: 5, offeredDayCount: 3 })).toBe(nb("5 horários em 3 dias"));
  });

  it("sem horário oferecido", () => {
    expect(formatOfferedTimes({ offeredTimeCount: 0, offeredDayCount: 0 })).toBe("Nenhum");
  });
});
