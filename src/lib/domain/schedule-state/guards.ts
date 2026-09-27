import type { Match, MatchSideKey, ScheduleHistory, ScheduleOption, ScheduleOptions } from '@/src/types/domain';
import { ScheduleError } from './scheduleError';

// Checagens comuns às ações da marcação. Cada uma lança ScheduleError e, quando
// passa, estreita o tipo ou devolve o que a ação precisa (ex.: o lado).

/** Jogadores de cada lado do confronto: 1 em simples, 2 em duplas. */
export interface ScheduleSides {
  a: readonly string[];
  b: readonly string[];
}

/**
 * Quem age e quando. As ações são puras: o "agora" vem de fora, o que deixa
 * testar a expiração das opções sem relógio falso.
 */
export interface ScheduleActor {
  playerId: string;
  at: string; // ISO 8601
}

/** O que as ações da marcação precisam saber além do histórico. */
export interface ScheduleContext {
  match: Match;
  sides: ScheduleSides;
  roundDeadline: string; // prazo da rodada da partida (R40, M6)
}

/** Só a partida do ranking em "Confronto definido" aceita marcação (M1). */
export function assertSchedulable(history: ScheduleHistory, match: Match): void {
  if (history.match_id !== match.id) {
    throw new ScheduleError(
      'match_not_schedulable',
      `Histórico da partida '${history.match_id}' usado com a partida '${match.id}': esperado o mesmo id`,
    );
  }
  if (match.kind === 'ranking' && match.status === 'defined') return;
  throw new ScheduleError(
    'match_not_schedulable',
    `Partida '${match.id}' é '${match.kind}' em '${match.status}': esperado 'ranking' em 'defined'`,
  );
}

export function sideOfPlayer(sides: ScheduleSides, playerId: string): MatchSideKey | null {
  if (sides.a.includes(playerId)) return 'a';
  if (sides.b.includes(playerId)) return 'b';
  return null;
}

/** Qualquer jogador do confronto propõe ou informa data (M2, M14). Devolve o lado dele. */
export function assertPlayerOfMatch(sides: ScheduleSides, playerId: string): MatchSideKey {
  const side = sideOfPlayer(sides, playerId);
  if (side !== null) return side;
  throw new ScheduleError(
    'not_allowed',
    `Jogador '${playerId}' não está no confronto: lados a=[${sides.a.join(', ')}] e b=[${sides.b.join(', ')}]`,
  );
}

/**
 * De 2 a 3 opções com horários distintos (M5), todas depois de `at` e antes do
 * prazo da rodada (M6). Devolve as opções já como tupla.
 */
export function assertValidOptions(
  options: readonly ScheduleOption[],
  at: string,
  roundDeadline: string,
): ScheduleOptions {
  assertOptionCount(options);
  const starts = options.map((option) => option.starts_at);
  if (new Set(starts.map(Date.parse)).size !== starts.length) {
    throw new ScheduleError('invalid_options', `Horários repetidos: [${starts.join(', ')}]; esperados horários distintos`);
  }
  starts.forEach((start) => assertWithinWindow(start, at, roundDeadline));
  return [...options] as ScheduleOptions;
}

function assertOptionCount(options: readonly ScheduleOption[]): void {
  if (options.length >= 2 && options.length <= 3) return;
  throw new ScheduleError('invalid_options', `Proposta com ${options.length} opções: esperado de 2 a 3`);
}

function assertWithinWindow(start: string, at: string, roundDeadline: string): void {
  const time = Date.parse(start);
  if (time > Date.parse(at) && time < Date.parse(roundDeadline)) return;
  throw new ScheduleError(
    'invalid_options',
    `Opção em '${start}': esperado horário depois de ${at} e antes do prazo da rodada (${roundDeadline})`,
  );
}

/**
 * A data informada fora do app só precisa ser uma data (M14). A spec não limita
 * o horário: o combinado no WhatsApp vale como veio, e o registro de quem
 * informou é o que pesa como evidência.
 */
export function assertValidDate(startsAt: string): void {
  if (!Number.isNaN(Date.parse(startsAt))) return;
  throw new ScheduleError('invalid_date', `Data informada '${startsAt}': esperado ISO 8601 (ex.: '2026-09-05T14:00:00.000Z')`);
}
