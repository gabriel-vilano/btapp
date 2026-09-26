import type {
  AdminAction,
  CompetitionResult,
  MatchConfirmation,
  MatchSet,
  Player,
  ReportResponse,
  ResultReport,
} from '@/src/types/domain';

// Atalhos para montar os mocks de partida sem repetir objeto literal. Só
// servem aos mocks: não calculam pontuação nem validam placar (isso é das
// funções de domínio).

const HOUR_MS = 3_600_000;

/** ISO de `hours` horas depois de `iso`. Ex.: prazo de 48h a partir do lançamento. */
export function hoursAfter(iso: string, hours: number): string {
  return new Date(Date.parse(iso) + hours * HOUR_MS).toISOString();
}

/** Set normal. Ex.: `gameSet(6, 4)`. */
export function gameSet(gamesA: number, gamesB: number): MatchSet {
  return { games_a: gamesA, games_b: gamesB, super_tiebreak: false, interrupted: false };
}

/** Super tiebreak: os números são os pontos do tiebreak. Ex.: `superTiebreak(10, 7)`. */
export function superTiebreak(pointsA: number, pointsB: number): MatchSet {
  return { games_a: pointsA, games_b: pointsB, super_tiebreak: true, interrupted: false };
}

/** Set em que houve a desistência, com os games jogados até ali (R11). */
export function interruptedSet(gamesA: number, gamesB: number): MatchSet {
  return { games_a: gamesA, games_b: gamesB, super_tiebreak: false, interrupted: true };
}

export function reportBy<R extends CompetitionResult>(
  result: R,
  reporter: Player,
  reportedAt: string,
): ResultReport<R> {
  return { result, reported_by: reporter.id, reported_at: reportedAt };
}

export function responseBy(responder: Player, respondedAt: string): ReportResponse {
  return { responded_by: responder.id, responded_at: respondedAt };
}

export function adminAction(admin: Player, actedAt: string): AdminAction {
  return { admin_id: admin.id, acted_at: actedAt };
}

export function confirmedByOpponent(responder: Player, respondedAt: string): MatchConfirmation {
  return { via: 'opponent', ...responseBy(responder, respondedAt) };
}

/** Confirmação automática quando o prazo do ranking passa sem resposta (R14). */
export function confirmedByDeadline(report: ResultReport, deadlineHours: number): MatchConfirmation {
  return { via: 'deadline', confirmed_at: hoursAfter(report.reported_at, deadlineHours) };
}

export function confirmedByAdmin(admin: Player, actedAt: string): MatchConfirmation {
  return { via: 'admin', ...adminAction(admin, actedAt) };
}

/** Momento em que a partida foi confirmada, venha a confirmação de onde vier. */
export function confirmationTime(confirmation: MatchConfirmation): string {
  if (confirmation.via === 'opponent') return confirmation.responded_at;
  if (confirmation.via === 'deadline') return confirmation.confirmed_at;
  return confirmation.acted_at;
}
