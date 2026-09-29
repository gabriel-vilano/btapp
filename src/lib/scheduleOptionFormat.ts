// Datas das opções de horário da marcação (docs/SCHEDULING.md M5), em pt-BR.
// O fuso é o de Brasília, como em `formatters.ts`: o horário é o da quadra,
// não o do aparelho de quem lê.

const TIMEZONE = "America/Sao_Paulo";

const longDayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIMEZONE,
});

const partsFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIMEZONE,
});

type SchedulePart = "weekday" | "day" | "month" | "hour" | "minute";

function scheduleParts(iso: string): Record<SchedulePart, string> {
  const parts = partsFormatter.formatToParts(new Date(iso));
  const valueOf = (type: SchedulePart): string =>
    parts.find((part) => part.type === type)?.value.replace(".", "") ?? "";
  return {
    weekday: valueOf("weekday"),
    day: valueOf("day"),
    month: valueOf("month"),
    hour: String(Number(valueOf("hour"))),
    minute: valueOf("minute"),
  };
}

/**
 * Dia da opção por extenso, com inicial maiúscula e o primeiro dia do mês
 * como ordinal ("1º de outubro"), como se escreve no Brasil.
 * @example formatScheduleDay("2026-10-03T17:00:00.000Z") // "Sábado, 3 de outubro"
 */
export function formatScheduleDay(iso: string): string {
  const day = longDayFormatter
    .formatToParts(new Date(iso))
    .map((part) => (part.type === "day" && part.value === "1" ? "1º" : part.value))
    .join("");
  return day.charAt(0).toLocaleUpperCase("pt-BR") + day.slice(1);
}

/**
 * Hora como se fala no Brasil: "14h" na hora cheia, "19h30" fora dela.
 * @example formatScheduleTime("2026-10-03T22:30:00.000Z") // "19h30"
 */
export function formatScheduleTime(iso: string): string {
  const { hour, minute } = scheduleParts(iso);
  return minute === "00" ? `${hour}h` : `${hour}h${minute}`;
}

/**
 * Forma curta, para caber num botão.
 * @example formatScheduleShort("2026-10-03T17:00:00.000Z") // "sáb, 3 out, 14h"
 */
export function formatScheduleShort(iso: string): string {
  const { weekday, day, month } = scheduleParts(iso);
  return `${weekday}, ${day} ${month}, ${formatScheduleTime(iso)}`;
}
