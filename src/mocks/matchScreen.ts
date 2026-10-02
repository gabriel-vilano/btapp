import type { MatchScreenData, MatchScreenH2H } from '@/src/components/agenda/MatchScreen';
import { h2hPath } from '@/src/lib/domain/h2h';
import { unitHeadToHead } from '@/src/lib/domain/match-count';
import type { StandingsScope } from '@/src/lib/domain/standingsStats';
import { formatCategoryLabel } from '@/src/lib/formatters';
import type { CompetitionCategory, CompetitorUnit, Player, RankingMatch } from '@/src/types/domain';
import { mockDomain, mockH2HDomain } from './domain';
import { players } from './domain/people';
import { mockRankingRoutes } from './rankingRoutes';
import { scheduleHistoryOf } from './domain/scheduling';

// Tela do confronto (docs/SCHEDULING.md §6) montada das tabelas mockadas, do
// ponto de vista do Lucas, o mesmo jogador da aba Competições. Com o Supabase,
// esta montagem vira a consulta da página.

export const MOCK_VIEWER_ID = players.lucas.id;

/**
 * Dados da tela do confronto, ou `null` quando a partida não existe ou não é
 * do ranking (torneio e amistoso não têm marcação, M1).
 * @example matchScreenDataOf('match-arena-mangaba-mb-r3-1')?.sideNames.a // "Lucas e Rafael"
 */
export function matchScreenDataOf(matchId: string, viewerId: string = MOCK_VIEWER_ID): MatchScreenData | null {
  const match = mockDomain.matches.find((candidate) => candidate.id === matchId);
  if (match?.kind !== 'ranking') return null;
  const sides = { a: playersOfEnrollment(match.side_a_enrollment_id), b: playersOfEnrollment(match.side_b_enrollment_id) };
  return {
    match,
    history: scheduleHistoryOf(match.id),
    sides,
    sideNames: { a: sideName(sides.a), b: sideName(sides.b) },
    playerNames: Object.fromEntries([...sides.a, ...sides.b].map((id) => [id, firstName(playerOf(id))])),
    viewerId,
    ...competitionContextOf(match),
    h2h: h2hOf(match),
  };
}

// Conta no mesmo cenário da página de H2H, para o número do botão ser o do resumo (HH17)
function h2hOf(match: RankingMatch): MatchScreenH2H | null {
  const [unitA, unitB] = [unitOfEnrollment(match.side_a_enrollment_id), unitOfEnrollment(match.side_b_enrollment_id)];
  const count = unitHeadToHead(mockH2HDomain, unitA.id, unitB.id).match_ids.length;
  if (count === 0) return null;
  return { count, href: h2hPath(usernamesOf(unitA.player_ids), usernamesOf(unitB.player_ids)) };
}

function unitOfEnrollment(enrollmentId: string): CompetitorUnit {
  const enrollment = findOrThrow(mockDomain.enrollments, enrollmentId, 'inscrição');
  return findOrThrow(mockDomain.units, enrollment.unit_id, 'unidade');
}

function usernamesOf(playerIds: readonly string[]): string[] {
  return playerIds.map((id) => playerOf(id).username);
}

type CompetitionContext = Pick<
  MatchScreenData,
  | 'competitionName'
  | 'categoryName'
  | 'roundNumber'
  | 'roundDeadline'
  | 'responseDeadlineHours'
  | 'scoringRule'
  | 'adminNames'
  | 'standings'
  | 'rankingHref'
>;

// O hash da própria linha na tela de ranking (RK3): o mesmo `OWN_ROW_HASH` do RankingScreen
const OWN_ROW_HASH = '#minha-posicao';

function competitionContextOf(match: RankingMatch): CompetitionContext {
  const competition = findOrThrow(mockDomain.competitions, match.competition_id, 'competição');
  const category = findOrThrow(mockDomain.categories, match.category_id, 'categoria');
  const round = findOrThrow(mockDomain.rounds, match.round_id, 'rodada');
  if (competition.type !== 'ranking') {
    throw new Error(`Tela do confronto: competição '${competition.id}' é '${competition.type}', esperado 'ranking'`);
  }
  const adminIds = mockDomain.admins.filter((admin) => admin.competition_id === competition.id).map((admin) => admin.player_id);
  return {
    competitionName: competition.name,
    categoryName: categoryLabel(category),
    roundNumber: round.number,
    roundDeadline: round.deadline,
    responseDeadlineHours: competition.response_deadline_hours,
    scoringRule: competition.scoring_rule,
    adminNames: Object.fromEntries(adminIds.map((id) => [id, firstName(playerOf(id))])),
    standings: standingsOf(match.category_id, round.season_id),
    rankingHref: `${mockRankingRoutes.categoryHref(match.category_id, round.season_id)}${OWN_ROW_HASH}`,
  };
}

// Só a categoria na temporada: é o que a classificação lê, e vai inteiro para o cliente
function standingsOf(categoryId: string, seasonId: string): StandingsScope {
  return {
    season_id: seasonId,
    category_id: categoryId,
    rounds: mockDomain.rounds.filter((round) => round.season_id === seasonId),
    enrollments: mockDomain.enrollments.filter((e) => e.category_id === categoryId && e.season_id === seasonId),
    matches: mockDomain.matches.filter((m) => m.kind === 'ranking' && m.category_id === categoryId),
  };
}

function playersOfEnrollment(enrollmentId: string): string[] {
  return [...unitOfEnrollment(enrollmentId).player_ids];
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
  if (found === undefined) throw new Error(`Tela do confronto: ${what} '${id}' não existe nos mocks`);
  return found;
}
