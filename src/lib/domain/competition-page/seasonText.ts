import type { CurrentRound, SeasonFinalInfo } from './types';

// Bloco Temporada da página da competição (docs/RANKING.md, RK17): datas,
// rodada atual com o prazo e a final. O fuso é o de Brasília, como em
// `src/lib/formatters.ts`: o prazo é o do organizador, não o do aparelho.

const TIMEZONE = 'America/Sao_Paulo';
const DAY_MS = 24 * 60 * 60 * 1000;

const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: TIMEZONE });
const calendarDayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }); // 'YYYY-MM-DD'

function parseDate(iso: string): Date {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Data inválida: recebi '${iso}', esperado data ISO 8601`);
  }
  return date;
}

/** "24/10". */
export function formatDayMonth(iso: string): string {
  return dayMonthFormatter.format(parseDate(iso));
}

/** Período da temporada. Ex.: "10/08 a 20/12". */
export function formatSeasonDates(startsOn: string, endsOn: string): string {
  return `${formatDayMonth(startsOn)} a ${formatDayMonth(endsOn)}`;
}

// Diferença em dias de calendário de Brasília: o prazo às 23h de amanhã
// "fecha amanhã", mesmo que faltem só 20 horas
function calendarDaysBetween(fromIso: string, toIso: string): number {
  const [from, to] = [fromIso, toIso].map((iso) => Date.parse(calendarDayFormatter.format(parseDate(iso))));
  return Math.round((to - from) / DAY_MS);
}

/** Prazo da rodada em tempo restante (RK4). Ex.: "fecha em 5 dias", "fecha amanhã". */
export function formatRoundDeadline(deadline: string, now: string): string {
  if (Date.parse(deadline) <= Date.parse(now)) return 'prazo encerrado';
  const days = calendarDaysBetween(now, deadline);
  if (days <= 0) return 'fecha hoje';
  if (days === 1) return 'fecha amanhã';
  return `fecha em ${days} dias`;
}

/**
 * Rodada atual com o prazo (RK4). Sem total fixo, só o número.
 * Ex.: "Rodada 3 de 4 · fecha em 5 dias"; sem rodada: "Primeira rodada ainda não sorteada".
 */
export function formatRoundLine(round: CurrentRound | null, now: string): string {
  if (round === null) return 'Primeira rodada ainda não sorteada';
  const name = round.total === null ? `Rodada ${round.number}` : `Rodada ${round.number} de ${round.total}`;
  return `${name} · ${formatRoundDeadline(round.deadline, now)}`;
}

/**
 * A final da temporada (RK4, R27, R28). Depois do corte, a classificação está definida.
 * Ex.: "Saideira · 8 vagas por categoria · corte em 30/11".
 */
export function formatFinalLine(final: SeasonFinalInfo, now: string): string {
  const cutoff = formatDayMonth(final.cutoff_date);
  if (Date.parse(final.cutoff_date) <= Date.parse(now)) {
    return `${final.name} · classificação definida em ${cutoff}`;
  }
  const spots = final.qualifiers === 1 ? '1 vaga' : `${final.qualifiers} vagas`;
  return `${final.name} · ${spots} por categoria · corte em ${cutoff}`;
}
