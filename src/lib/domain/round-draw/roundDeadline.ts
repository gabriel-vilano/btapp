import type { Round, Season } from '@/src/types/domain';
import { brasiliaLocalToIso, brasiliaToday } from '@/src/lib/brasiliaDateTime';

// Prazo da rodada, informado no sorteio (ROUND_DRAW.md SR6; R40, R46).

const DAY_MS = 24 * 60 * 60_000;
const DEADLINE_TIME = '23:59'; // o prazo termina no fim do dia, em Brasília

export interface SuggestedDeadline {
  deadline: string; // ISO 8601
  duration_days: number; // "mesma duração da rodada 2 (14 dias)"
}

function parseInstant(iso: string, field: string): number {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) throw new RangeError(`${field} inválido: recebi '${iso}', esperado ISO 8601`);
  return time;
}

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Prazo já preenchido na confirmação: a duração da rodada anterior, contada a
 * partir de hoje, às 23h59 de Brasília. Na primeira rodada não há sugestão, e
 * o campo vem vazio (`null`).
 *
 * @example
 * // rodada 2 durou 14 dias; hoje é 12/10 em Brasília
 * suggestRoundDeadline(rounds.second, now) // { deadline: '2026-10-27T02:59:00.000Z', duration_days: 14 }
 */
export function suggestRoundDeadline(previousRound: Round | null, now: Date): SuggestedDeadline | null {
  if (previousRound === null) return null;
  const length = parseInstant(previousRound.deadline, 'Prazo') - parseInstant(previousRound.starts_at, 'Início');
  const days = Math.max(1, Math.round(length / DAY_MS));
  const deadline = brasiliaLocalToIso(`${addDays(brasiliaToday(now), days)}T${DEADLINE_TIME}`);
  if (deadline === null) throw new RangeError(`Data inválida: recebi '${now.toISOString()}', esperado uma data válida`);
  return { deadline, duration_days: days };
}

export type RoundDeadlineErrorCode = 'invalid_date' | 'not_in_future' | 'outside_season';

export interface RoundDeadlineError {
  code: RoundDeadlineErrorCode;
  message: string;
}

/** Prazo depois do corte da final: vale, mas os jogos confirmados depois não contam para a vaga (R28). */
export interface AfterCutoffWarning {
  kind: 'after_final_cutoff';
  cutoff_date: string;
}

export type RoundDeadlineCheck =
  | { valid: true; warnings: AfterCutoffWarning[] }
  | { valid: false; error: RoundDeadlineError };

function invalid(code: RoundDeadlineErrorCode, message: string): RoundDeadlineCheck {
  return { valid: false, error: { code, message } };
}

function cutoffWarnings(deadline: number, season: Season): AfterCutoffWarning[] {
  const cutoff = season.final?.cutoff_date;
  if (cutoff === undefined || deadline <= Date.parse(cutoff)) return [];
  return [{ kind: 'after_final_cutoff', cutoff_date: cutoff }];
}

/**
 * Valida o prazo digitado: no futuro e dentro da temporada. Prazo depois da
 * data de corte da final é válido, com aviso.
 *
 * @example
 * const check = checkRoundDeadline(deadlineIso, season, new Date());
 * if (!check.valid) showError(check.error.code);
 */
export function checkRoundDeadline(deadline: string, season: Season, now: Date): RoundDeadlineCheck {
  const time = Date.parse(deadline);
  if (Number.isNaN(time)) return invalid('invalid_date', `Prazo inválido: recebi '${deadline}', esperado ISO 8601`);
  if (time <= now.getTime()) {
    return invalid('not_in_future', `Prazo no passado: recebi '${deadline}', esperado depois de '${now.toISOString()}'`);
  }
  if (time < Date.parse(season.starts_on) || time > Date.parse(season.ends_on)) {
    return invalid('outside_season', `Prazo fora da temporada: recebi '${deadline}', esperado entre '${season.starts_on}' e '${season.ends_on}'`);
  }
  return { valid: true, warnings: cutoffWarnings(time, season) };
}
