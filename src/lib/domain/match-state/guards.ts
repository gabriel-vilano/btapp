import type { CompetitionResult, Match, MatchSideKey } from '@/src/types/domain';
import { MatchTransitionError } from './transitionError';

// Checagens comuns às transições. Cada uma lança MatchTransitionError e, quando
// passa, estreita o tipo ou devolve o que a transição precisa (ex.: o lado).

const HOUR_MS = 3_600_000;

/** Jogadores de cada lado da partida: 1 em simples, 2 em duplas. */
export interface MatchSidePlayers {
  a: readonly string[];
  b: readonly string[];
}

/**
 * Quem age e quando. As transições são puras: o "agora" vem de fora, o que
 * deixa testar prazo sem relógio falso.
 */
export interface TransitionActor {
  playerId: string;
  at: string; // ISO 8601
}

/** Garante o estado de origem e estreita o tipo da partida para ele. */
export function assertStatus<M extends Match, S extends M['status']>(
  match: M,
  status: S,
  action: string,
): asserts match is Extract<M, { status: S }> {
  if (match.status === status) return;
  throw new MatchTransitionError(
    'invalid_status',
    `Não dá para ${action} na partida '${match.id}': está em '${match.status}', esperado '${status}'`,
  );
}

export function sideOfPlayer(sides: MatchSidePlayers, playerId: string): MatchSideKey | null {
  if (sides.a.includes(playerId)) return 'a';
  if (sides.b.includes(playerId)) return 'b';
  return null;
}

/** Qualquer jogador da partida pode lançar (R13). Devolve o lado dele. */
export function assertPlayerOfMatch(sides: MatchSidePlayers, playerId: string): MatchSideKey {
  const side = sideOfPlayer(sides, playerId);
  if (side !== null) return side;
  throw new MatchTransitionError(
    'not_allowed',
    `Jogador '${playerId}' não está na partida: lados a=[${sides.a.join(', ')}] e b=[${sides.b.join(', ')}]`,
  );
}

/** Só o lado adversário de quem lançou responde; o parceiro não (R13, R43). */
export function assertOpponentOfReporter(sides: MatchSidePlayers, playerId: string, reporterId: string): void {
  const responderSide = sideOfPlayer(sides, playerId);
  if (responderSide !== null && responderSide !== sideOfPlayer(sides, reporterId)) return;
  throw new MatchTransitionError(
    'not_allowed',
    `Jogador '${playerId}' não pode responder ao lançamento de '${reporterId}': esperado alguém do lado adversário`,
  );
}

export function assertAdmin(adminIds: readonly string[], playerId: string): void {
  if (adminIds.includes(playerId)) return;
  throw new MatchTransitionError(
    'not_allowed',
    `Jogador '${playerId}' não é admin da competição: admins=[${adminIds.join(', ')}]`,
  );
}

/** Na desistência, quem lança é o adversário de quem desistiu, ou seja, o vencedor (R11). */
export function assertRetirementReportedByWinner(
  result: CompetitionResult,
  reporterSide: MatchSideKey,
): void {
  if (result.type !== 'retired' || result.winner === reporterSide) return;
  throw new MatchTransitionError(
    'invalid_result',
    `Desistência lançada pelo lado '${reporterSide}' com vencedor '${result.winner}': quem lança é o adversário de quem desistiu`,
  );
}

/** ISO do fim do prazo de resposta, contado a partir do lançamento (R14). */
export function responseDeadline(reportedAt: string, deadlineHours: number): string {
  return new Date(Date.parse(reportedAt) + deadlineHours * HOUR_MS).toISOString();
}

/** A ação só vale até o prazo, inclusive. */
export function assertNotPast(at: string, deadline: string, deadlineName: string): void {
  if (Date.parse(at) <= Date.parse(deadline)) return;
  throw new MatchTransitionError('too_late', `O ${deadlineName} acabou em ${deadline}; ação em ${at}`);
}

/** A ação só vale depois do prazo, exclusive: no instante exato ainda dá para agir. */
export function assertPast(at: string, deadline: string, deadlineName: string): void {
  if (Date.parse(at) > Date.parse(deadline)) return;
  throw new MatchTransitionError('too_early', `O ${deadlineName} só acaba em ${deadline}; ação em ${at}`);
}
