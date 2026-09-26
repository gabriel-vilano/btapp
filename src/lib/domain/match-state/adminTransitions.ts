import type {
  AdminAction,
  CompetitionMatch,
  CompetitionResult,
  DoubleWoResult,
  RankingMatch,
  ReportableResult,
  ResultReport,
  TournamentMatch,
  WoResult,
} from '@/src/types/domain';
import { assertAdmin, assertStatus, type TransitionActor } from './guards';
import { rankingBase, tournamentBase, type ScoreRankingResult } from './matchBase';
import { confirmRanking } from './rankingTransitions';
import { MatchTransitionError } from './transitionError';

// Transições feitas pelo admin da competição (R15). O admin pode agir na
// própria partida, e cada ato guarda quem fez (R39).

export interface AdminContext {
  adminIds: readonly string[];
  score: ScoreRankingResult; // só chamada no ranking: o torneio não pontua
}

function adminActionOf(actor: TransitionActor, context: Pick<AdminContext, 'adminIds'>): AdminAction {
  assertAdmin(context.adminIds, actor.playerId);
  return { admin_id: actor.playerId, acted_at: actor.at };
}

/** O admin define o resultado de uma partida contestada, mantendo ou não o lançado (R15). */
export function arbitrateRankingResult(
  match: RankingMatch,
  result: ReportableResult,
  actor: TransitionActor,
  context: AdminContext,
): RankingMatch {
  assertStatus(match, 'in_arbitration', 'arbitrar');
  const action = adminActionOf(actor, context);
  return confirmRanking(match, result, match.report, { via: 'admin', ...action }, context.score);
}

/** Partida não realizada: o admin aplica W.O. para um lado ou W.O. duplo (R36, R40). */
export function decideNotPlayed(
  match: RankingMatch,
  result: WoResult | DoubleWoResult,
  actor: TransitionActor,
  context: AdminContext,
): RankingMatch {
  assertStatus(match, 'not_played', 'decidir a partida não realizada');
  const action = adminActionOf(actor, context);
  return confirmRanking(match, result, null, { via: 'admin', ...action }, context.score);
}

/** Partida não realizada: o admin cancela, e ninguém pontua (R40). */
export function cancelNotPlayed(
  match: RankingMatch,
  actor: TransitionActor,
  context: Pick<AdminContext, 'adminIds'>,
): RankingMatch {
  assertStatus(match, 'not_played', 'cancelar a partida não realizada');
  const cancellation = adminActionOf(actor, context);
  return { ...rankingBase(match), status: 'cancelled', reason: 'not_played', cancellation };
}

/** No torneio, o admin lança e o resultado já nasce confirmado, sem pontos (R38). */
export function reportTournamentResult(
  match: TournamentMatch,
  result: ReportableResult,
  actor: TransitionActor,
  context: Pick<AdminContext, 'adminIds'>,
): TournamentMatch {
  assertStatus(match, 'defined', 'lançar o resultado do torneio');
  const action = adminActionOf(actor, context);
  const report = { result, reported_by: actor.playerId, reported_at: actor.at };
  const confirmation = { via: 'admin' as const, ...action };
  return { ...tournamentBase(match), status: 'confirmed', result, report, confirmation, correction: null, points: null };
}

/**
 * Correção depois da confirmação (R15, R41): troca o resultado, recalcula os
 * pontos no ranking e guarda a correção. A confirmação original fica.
 */
export function correctResult(match: RankingMatch, result: CompetitionResult, actor: TransitionActor, context: AdminContext): RankingMatch;
export function correctResult(match: TournamentMatch, result: CompetitionResult, actor: TransitionActor, context: AdminContext): TournamentMatch;
export function correctResult(
  match: CompetitionMatch,
  result: CompetitionResult,
  actor: TransitionActor,
  context: AdminContext,
): CompetitionMatch {
  assertStatus(match, 'confirmed', 'corrigir o resultado');
  const correction = adminActionOf(actor, context);
  assertDoubleWoOnlyWhenNotPlayed(match, result);
  const { report, confirmation } = match;
  if (match.kind === 'tournament') {
    return { ...tournamentBase(match), status: 'confirmed', result, report, confirmation, correction, points: null };
  }
  const points = context.score(result, match.format);
  return { ...rankingBase(match), status: 'confirmed', result, report, confirmation, correction, points };
}

/** Anulação depois da confirmação: a partida sai da classificação e o card some (R41). */
export function annulResult(match: RankingMatch, actor: TransitionActor, context: Pick<AdminContext, 'adminIds'>): RankingMatch;
export function annulResult(match: TournamentMatch, actor: TransitionActor, context: Pick<AdminContext, 'adminIds'>): TournamentMatch;
export function annulResult(
  match: CompetitionMatch,
  actor: TransitionActor,
  context: Pick<AdminContext, 'adminIds'>,
): CompetitionMatch {
  assertStatus(match, 'confirmed', 'anular o resultado');
  const cancellation = adminActionOf(actor, context);
  const cancelled = { status: 'cancelled' as const, reason: 'annulled' as const, cancellation };
  if (match.kind === 'tournament') return { ...tournamentBase(match), ...cancelled };
  return { ...rankingBase(match), ...cancelled };
}

// O W.O. duplo só vale na partida não realizada (R36), a única confirmada sem
// lançamento de jogador. A correção não pode levá-lo a outra partida.
function assertDoubleWoOnlyWhenNotPlayed(match: { id: string; report: ResultReport | null }, result: CompetitionResult): void {
  if (result.type !== 'double_wo' || match.report === null) return;
  throw new MatchTransitionError(
    'invalid_result',
    `W.O. duplo na partida '${match.id}', que teve resultado lançado: esperado só em partida não realizada`,
  );
}
