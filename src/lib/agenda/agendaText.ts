import type { CompetitionResult, MatchSet, MatchSideKey, SidePoints } from '@/src/types/domain';
import type { AgendaSituation } from '@/src/lib/domain/agenda';
import { formatScheduleTime } from '@/src/lib/scheduleOptionFormat';

// Texto da agenda (docs/NAVIGATION.md §5.2): a frase de cada situação, o
// prazo em tempo restante e o placar do histórico. O texto de referência é o
// da tabela 5.2; a redação final é da spec de registro de partidas e do DS.

const TIMEZONE = 'America/Sao_Paulo';
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Prazo em tempo restante, que é o que o jogador decide (5.2, L7). Em horas
 * até 48h, em dias a partir daí. Arredonda para baixo: o prazo nunca parece
 * maior do que é.
 * @example formatTimeRemaining('2026-09-12T20:00:00Z', '2026-09-11T13:00:00Z') // "em 31h"
 */
export function formatTimeRemaining(deadline: string, now: string): string {
  const diff = Date.parse(deadline) - Date.parse(now);
  if (Number.isNaN(diff)) {
    throw new RangeError(`Prazo inválido: recebi '${deadline}' e agora '${now}', esperadas datas ISO 8601`);
  }
  if (diff < MINUTE_MS) return 'agora';
  if (diff < HOUR_MS) return `em ${Math.floor(diff / MINUTE_MS)}min`;
  if (diff < 2 * DAY_MS) return `em ${Math.floor(diff / HOUR_MS)}h`;
  return `em ${Math.floor(diff / DAY_MS)} dias`;
}

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIMEZONE,
});

/** Os dois momentos caem no mesmo dia em Brasília: o selo "Hoje" (5.1). */
export function isSameDay(a: string, b: string): boolean {
  return dayKeyFormatter.format(new Date(a)) === dayKeyFormatter.format(new Date(b));
}

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: TIMEZONE });
const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: TIMEZONE });

/**
 * Quando é o jogo: dia da semana e hora. A partir de 6 dias, entra a data,
 * porque "sáb" sozinho já pode ser o da outra semana.
 * @example formatAgendaStart('2026-10-03T17:00:00Z', '2026-09-30T12:00:00Z') // "Sáb, 14h"
 */
export function formatAgendaStart(startsAt: string, now: string): string {
  const date = new Date(startsAt);
  const weekday = weekdayFormatter.format(date).replace('.', '');
  const day = weekday.charAt(0).toLocaleUpperCase('pt-BR') + weekday.slice(1);
  const time = formatScheduleTime(startsAt);
  const farAhead = Date.parse(startsAt) - Date.parse(now) >= 6 * DAY_MS;
  return farAhead ? `${day}, ${dayMonthFormatter.format(date)}, ${time}` : `${day}, ${time}`;
}

/** Nomes de um lado, como se fala: "Pedro e Thiago" em duplas, "Pedro" em simples. */
export function formatSideNames(firstNames: readonly string[]): string {
  return firstNames.join(' e ');
}

function withVenue(when: string, venue: string | null): string {
  return venue === null ? when : `${when} · ${venue}`;
}

/** O que a frase da situação precisa além dela. */
export interface SituationTextContext {
  now: string;
  viewerSide: MatchSideKey;
  opponentNames: string; // "Pedro e Thiago"
}

type SituationOf<K extends AgendaSituation['kind']> = Extract<AgendaSituation, { kind: K }>;

type SituationTexts = {
  [K in AgendaSituation['kind']]: (situation: SituationOf<K>, ctx: SituationTextContext) => string;
};

function whenText(startsAt: string | null, venue: string | null, now: string): string {
  if (startsAt === null) return 'Horário a definir';
  return withVenue(formatAgendaStart(startsAt, now), venue);
}

// Uma frase por linha da tabela 5.2. O mapa tipado obriga a ter frase para
// toda situação nova do domínio.
const SITUATION_TEXTS: SituationTexts = {
  schedule_match: (s, { now }) => `Marcar jogo · rodada fecha ${formatTimeRemaining(s.deadline, now)}`,
  answer_proposal: (s) => `Responder proposta · ${s.openOptionCount} horários`,
  report_result: () => 'Lançar resultado',
  confirm_result: (s, { now }) => `Confirmar resultado · confirma sozinho ${formatTimeRemaining(s.deadline, now)}`,
  confirm_friendly: () => 'Confirmar amistoso',
  scheduled: (s, { now }) => whenText(s.startsAt, s.venue, now),
  tournament_scheduled: (s, { now }) => whenText(s.startsAt, s.venue, now),
  proposal_sent: (_, { opponentNames }) => `Proposta enviada · aguardando ${opponentNames}`,
  awaiting_confirmation: (s, { now }) =>
    `Aguardando confirmação · confirma sozinho ${formatTimeRemaining(s.deadline, now)}`,
  friendly_awaiting: () => 'Aguardando confirmação',
  with_admin: () => 'Com o admin',
  tournament_with_admin: () => 'Resultado com o admin',
  confirmed: (s, { viewerSide }) => formatResultLine(s.result, s.points, viewerSide),
  friendly_discarded: () => 'Descartado',
  friendly_cancelled: () => 'Cancelado',
};

/**
 * Frase da situação no item da agenda (tabela 5.2).
 * @example agendaSituationText({ kind: 'confirm_result', deadline }, ctx) // "Confirmar resultado · confirma sozinho em 31h"
 */
export function agendaSituationText(situation: AgendaSituation, ctx: SituationTextContext): string {
  // O TypeScript não correlaciona a chave do mapa com o tipo do argumento
  // (microsoft/TypeScript#30581); o mapa tipado acima garante o par.
  const text = SITUATION_TEXTS[situation.kind] as (s: AgendaSituation, c: SituationTextContext) => string;
  return text(situation, ctx);
}

function setsFromSide(sets: MatchSet[], side: MatchSideKey): string {
  return sets.map((set) => (side === 'a' ? `${set.games_a}/${set.games_b}` : `${set.games_b}/${set.games_a}`)).join(' ');
}

/**
 * Resultado lido do lado de quem vê, com os pontos no ranking.
 * @example formatResultLine(result, { a: 104, b: 46 }, 'a') // "Vitória 6/4 · 104 pts"
 */
export function formatResultLine(result: CompetitionResult, points: SidePoints | null, side: MatchSideKey): string {
  const text = resultText(result, side);
  return points === null ? text : `${text} · ${points[side]} pts`;
}

function resultText(result: CompetitionResult, side: MatchSideKey): string {
  if (result.type === 'double_wo') return 'W.O. duplo';
  const outcome = result.winner === side ? 'Vitória' : 'Derrota';
  if (result.type === 'wo') return `${outcome} por W.O.`;
  const score = setsFromSide(result.sets, side);
  // "desist." como no CompactScore: fala do jogo, não de quem desistiu (R26)
  return result.type === 'retired' ? `${outcome} ${score} desist.` : `${outcome} ${score}`;
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: TIMEZONE });

/**
 * Mês do histórico, com inicial maiúscula (5.1 agrupa o histórico por mês).
 * @example formatHistoryMonth('2026-09-20T12:00:00Z') // "Setembro de 2026"
 */
export function formatHistoryMonth(iso: string): string {
  const month = monthFormatter.format(new Date(iso));
  return month.charAt(0).toLocaleUpperCase('pt-BR') + month.slice(1);
}

export interface HistoryMonth<T> {
  label: string; // "Setembro de 2026"
  entries: T[];
}

/**
 * Agrupa o histórico por mês, mantendo a ordem de entrada (mais recente
 * primeiro). Sem data, o item fica no mês anterior a ele na lista.
 * @example groupByHistoryMonth(agenda.history)[0].label // "Setembro de 2026"
 */
export function groupByHistoryMonth<T extends { played_at: string | null }>(entries: T[]): HistoryMonth<T>[] {
  return entries.reduce<HistoryMonth<T>[]>((months, entry) => {
    const last = months[months.length - 1];
    const label = entry.played_at === null ? last?.label : formatHistoryMonth(entry.played_at);
    if (last !== undefined && last.label === label) {
      last.entries.push(entry);
      return months;
    }
    return [...months, { label: label ?? 'Sem data', entries: [entry] }];
  }, []);
}
