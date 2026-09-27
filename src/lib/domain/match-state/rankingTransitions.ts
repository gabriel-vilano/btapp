import type {
  CompetitionResult,
  MatchConfirmation,
  RankingMatch,
  ReportableResult,
  ResultReport,
} from '@/src/types/domain';
import {
  assertNotPast,
  assertOpponentOfReporter,
  assertPast,
  assertPlayerOfMatch,
  assertRetirementReportedByWinner,
  assertStatus,
  responseDeadline,
  type MatchSidePlayers,
  type TransitionActor,
} from './guards';
import { rankingBase, type ScoreRankingResult } from './matchBase';

// Transições da partida de ranking feitas pelos jogadores ou pelo prazo
// (docs/DOMAIN.md §3, "Partida de competição"). As do admin estão em
// adminTransitions.ts.

/** O que as transições do ranking precisam saber além da partida. */
export interface RankingMatchContext {
  sides: MatchSidePlayers;
  responseDeadlineHours: number; // do ranking; padrão 48 (R14)
  roundDeadline: string; // prazo da rodada da partida (R40)
  score: ScoreRankingResult;
}

/** Monta o estado confirmado, já com os pontos. Serve às transições do jogador, do prazo e do admin. */
export function confirmRanking(
  match: RankingMatch,
  result: CompetitionResult,
  report: ResultReport | null,
  confirmation: MatchConfirmation,
  score: ScoreRankingResult,
): RankingMatch {
  const points = score(result, match.format);
  return { ...rankingBase(match), status: 'confirmed', result, report, confirmation, correction: null, points };
}

/**
 * Qualquer jogador da partida lança o resultado até o prazo da rodada (R13, R40).
 * Na desistência, só o vencedor lança (R11).
 */
export function reportRankingResult(
  match: RankingMatch,
  result: ReportableResult,
  actor: TransitionActor,
  context: RankingMatchContext,
): RankingMatch {
  assertStatus(match, 'defined', 'lançar o resultado');
  assertNotPast(actor.at, context.roundDeadline, 'prazo da rodada');
  const reporterSide = assertPlayerOfMatch(context.sides, actor.playerId);
  assertRetirementReportedByWinner(result, reporterSide);
  const report = { result, reported_by: actor.playerId, reported_at: actor.at };
  return { ...rankingBase(match), status: 'awaiting_confirmation', report };
}

/** O lado adversário confirma dentro do prazo de resposta; vale a primeira resposta (R13, R14). */
export function confirmRankingResult(
  match: RankingMatch,
  actor: TransitionActor,
  context: RankingMatchContext,
): RankingMatch {
  assertStatus(match, 'awaiting_confirmation', 'confirmar o resultado');
  assertResponseInTime(match.report, actor, context);
  const confirmation = { via: 'opponent' as const, responded_by: actor.playerId, responded_at: actor.at };
  return confirmRanking(match, match.report.result, match.report, confirmation, context.score);
}

/** O lado adversário contesta dentro do prazo, e a partida vai para o admin (R14). */
export function contestRankingResult(
  match: RankingMatch,
  actor: TransitionActor,
  context: RankingMatchContext,
): RankingMatch {
  assertStatus(match, 'awaiting_confirmation', 'contestar o resultado');
  assertResponseInTime(match.report, actor, context);
  const contest = { responded_by: actor.playerId, responded_at: actor.at };
  return { ...rankingBase(match), status: 'in_arbitration', report: match.report, contest };
}

/**
 * Quem cala consente: passado o prazo de resposta, o resultado se confirma sozinho
 * (R14). A confirmação fica datada no fim do prazo, não na hora em que rodou.
 */
export function confirmRankingByDeadline(
  match: RankingMatch,
  at: string,
  context: RankingMatchContext,
): RankingMatch {
  assertStatus(match, 'awaiting_confirmation', 'confirmar pelo prazo');
  const deadline = responseDeadline(match.report.reported_at, context.responseDeadlineHours);
  assertPast(at, deadline, 'prazo de resposta');
  const confirmation = { via: 'deadline' as const, confirmed_at: deadline };
  return confirmRanking(match, match.report.result, match.report, confirmation, context.score);
}

/** Passado o prazo da rodada sem resultado, a partida vai para o admin. Nunca vira W.O. sozinha (R40). */
export function markRankingNotPlayed(match: RankingMatch, at: string, context: RankingMatchContext): RankingMatch {
  assertStatus(match, 'defined', 'marcar como não realizada');
  assertPast(at, context.roundDeadline, 'prazo da rodada');
  return { ...rankingBase(match), status: 'not_played' };
}

// Depois do prazo, a resposta não vale mais: o resultado já está confirmado
// pela R14, mesmo que a confirmação automática ainda não tenha rodado.
function assertResponseInTime(report: ResultReport, actor: TransitionActor, context: RankingMatchContext): void {
  assertOpponentOfReporter(context.sides, actor.playerId, report.reported_by);
  const deadline = responseDeadline(report.reported_at, context.responseDeadlineHours);
  assertNotPast(actor.at, deadline, 'prazo de resposta');
}
