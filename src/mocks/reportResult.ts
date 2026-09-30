import type { ReportRankingContext, ReportResultData } from '@/src/components/agenda/ReportResult';
import { formatCategoryLabel } from '@/src/lib/formatters';
import type { CompetitionCategory, CompetitionMatch, Match, Player } from '@/src/types/domain';
import { mockDomain } from './domain';
import { MOCK_VIEWER_ID } from './matchScreen';

// Fluxo de lançar o resultado (docs/RESULTS.md §3 e §5.3) montado das tabelas
// mockadas. Diferente do carregador da tela do confronto, aceita ranking e
// torneio. Com o Supabase, esta montagem vira a consulta da página.

/**
 * Dados do fluxo de lançar, ou `null` quando a partida não existe ou é amistoso
 * (o amistoso nasce do lançamento e tem fluxo próprio, RESULTS.md §6).
 * @example reportResultDataOf('match-arena-mangaba-mb-r3-1')?.sideNames.a // "Lucas e Rafael"
 */
export function reportResultDataOf(matchId: string, viewerId: string = MOCK_VIEWER_ID): ReportResultData | null {
  const match = mockDomain.matches.find((candidate) => candidate.id === matchId);
  if (match === undefined || !isCompetitionMatch(match)) return null;
  const sides = { a: playersOfEnrollment(match.side_a_enrollment_id), b: playersOfEnrollment(match.side_b_enrollment_id) };
  const category = findOrThrow(mockDomain.categories, match.category_id, 'categoria');
  return {
    match,
    sides,
    sideNames: { a: sideName(sides.a), b: sideName(sides.b) },
    playerNames: Object.fromEntries([...sides.a, ...sides.b].map((id) => [id, firstName(playerOf(id))])),
    viewerId,
    adminIds: mockDomain.admins.filter((admin) => admin.competition_id === match.competition_id).map((admin) => admin.player_id),
    competitionName: findOrThrow(mockDomain.competitions, match.competition_id, 'competição').name,
    categoryName: categoryLabel(category),
    isSingles: category.modality === 'singles',
    ranking: match.kind === 'ranking' ? rankingContextOf(match.competition_id, match.round_id) : null,
  };
}

function isCompetitionMatch(match: Match): match is CompetitionMatch {
  return match.kind !== 'friendly';
}

function rankingContextOf(competitionId: string, roundId: string): ReportRankingContext {
  const competition = findOrThrow(mockDomain.competitions, competitionId, 'competição');
  if (competition.type !== 'ranking') {
    throw new Error(`Lançar resultado: competição '${competitionId}' é '${competition.type}', esperado 'ranking'`);
  }
  const round = findOrThrow(mockDomain.rounds, roundId, 'rodada');
  return {
    roundNumber: round.number,
    roundDeadline: round.deadline,
    responseDeadlineHours: competition.response_deadline_hours,
    scoringRule: competition.scoring_rule,
  };
}

function playersOfEnrollment(enrollmentId: string): string[] {
  const enrollment = findOrThrow(mockDomain.enrollments, enrollmentId, 'inscrição');
  return [...findOrThrow(mockDomain.units, enrollment.unit_id, 'unidade').player_ids];
}

function playerOf(playerId: string): Player {
  return findOrThrow(mockDomain.players, playerId, 'jogador');
}

function sideName(playerIds: readonly string[]): string {
  return playerIds.map((id) => firstName(playerOf(id))).join(' e ');
}

function firstName(player: Player): string {
  return player.name.split(' ')[0] ?? player.name;
}

function categoryLabel(category: CompetitionCategory): string {
  const ageGroup = category.min_age === null ? null : `${category.min_age}+`;
  return formatCategoryLabel({ ...category, age_group: ageGroup });
}

function findOrThrow<T extends { id: string }>(items: readonly T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Lançar resultado: ${what} '${id}' não existe nos mocks`);
  return found;
}
