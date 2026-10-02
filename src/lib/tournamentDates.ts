// Datas do torneio: o dia do evento e o próximo jogo. Usado pelo
// TournamentSummaryItem (docs/NAVIGATION.md, N29) e pela vitrine do Explorar
// (docs/EXPLORE.md, EX10), por isso mora em `src/lib/` e não num grupo de
// área. O fuso é o de Brasília, como em `src/lib/formatters.ts`: o horário é
// o da quadra, não o do aparelho de quem lê.

import { isoToBrasiliaLocal } from "@/src/lib/brasiliaDateTime";

const TIMEZONE = "America/Sao_Paulo";

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: TIMEZONE });
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", timeZone: TIMEZONE });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: TIMEZONE });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: TIMEZONE,
});

/** Próximo confronto do torneio, como chega no item. */
export interface TournamentNextMatchText {
  startsAt: string; // ISO 8601
  court: string | null;
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
}

// "sáb." → "Sáb"
function weekday(date: Date): string {
  return capitalize(weekdayFormatter.format(date).replace(".", ""));
}

// "9h" na hora cheia, "19h30" fora dela, como se fala no Brasil
function time(date: Date): string {
  const [hour, minute] = timeFormatter.format(date).split(":");
  return minute === "00" ? `${Number(hour)}h` : `${Number(hour)}h${minute}`;
}

// O primeiro dia do mês é ordinal ("1º de novembro"), como se escreve no Brasil
function day(date: Date): string {
  const value = dayFormatter.format(date);
  return value === "1" ? "1º" : value;
}

/**
 * Próximo jogo: dia da semana, hora e quadra.
 * @example formatNextMatch({ startsAt: "2026-10-10T12:00:00.000Z", court: "Quadra 3" }) // "Sáb, 9h · Quadra 3"
 */
export function formatNextMatch({ startsAt, court }: TournamentNextMatchText): string {
  const date = new Date(startsAt);
  const moment = `${weekday(date)}, ${time(date)}`;
  return court ? `${moment} · ${court}` : moment;
}

/**
 * Data do evento. Dois dias no mesmo mês viram "10 e 11 de outubro".
 * @example formatTournamentDates("2026-10-10T12:00:00.000Z", "2026-10-10T20:00:00.000Z") // "Sáb, 10 de outubro"
 */
export function formatTournamentDates(startsOn: string, endsOn: string): string {
  const [start, end] = [new Date(startsOn), new Date(endsOn)];
  const [startMonth, endMonth] = [monthFormatter.format(start), monthFormatter.format(end)];
  if (day(start) === day(end) && startMonth === endMonth) {
    return `${weekday(start)}, ${day(start)} de ${startMonth}`;
  }
  if (startMonth === endMonth) return `${day(start)} e ${day(end)} de ${startMonth}`;
  return `${day(start)} de ${startMonth} a ${day(end)} de ${endMonth}`;
}

// 'YYYY-MM-DD' em Brasília; strings nesse formato se comparam como datas
function brasiliaDay(iso: string): string {
  return isoToBrasiliaLocal(iso).slice(0, 10);
}

/**
 * Torneio que já aconteceu: o dia do fim, em Brasília, ficou para trás
 * (docs/EXPLORE.md §1, "Termos"). O que termina às 10h segue aberto até o fim do dia.
 * @example hasTournamentEnded("2026-10-11T21:00:00.000Z", "2026-10-12T03:30:00.000Z") // true
 */
export function hasTournamentEnded(endsOn: string, now: string): boolean {
  return brasiliaDay(endsOn) < brasiliaDay(now);
}
