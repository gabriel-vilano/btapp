import type {
  Competition,
  CompetitionCategory,
  Enrollment,
  Player,
  Season,
} from '@/src/types/domain';
import type { ProfileDomain } from '../profile';
import { countedEnrollments, type StandingsScope } from '../standingsStats';
import { unrankedEnrollments } from '../ranking-table';
import { seasonHeader, selectSeason } from './season';
import { enrollmentPlayers, ownEnrollment, rankingTable } from './table';
import type { RankingScreenContent, RankingScreenModel, UnrankedEntry } from './types';

// A tela de classificação de uma categoria (docs/RANKING.md), montada a
// partir das tabelas do domínio. O `mockProfileDomain` satisfaz o contrato.

/** Tabelas que a tela lê. */
export interface RankingScreenDomain extends ProfileDomain {
  players: Player[];
  competitions: Competition[];
  categories: CompetitionCategory[];
}

/** O que a rota pede: a categoria, a temporada de `?temporada=` e quem vê. */
export interface RankingScreenRequest {
  category_id: string;
  season_id: string | null;
  viewer_id: string;
  now: string; // ISO 8601
}

function unrankedContent(
  domain: RankingScreenDomain,
  enrollments: Enrollment[],
  ownId: string | null,
): UnrankedEntry[] {
  return enrollments.map((enrollment) => ({
    enrollment_id: enrollment.id,
    players: enrollmentPlayers(domain, enrollment),
    is_own: enrollment.id === ownId,
  }));
}

function seasonContent(
  domain: RankingScreenDomain,
  season: Season,
  request: RankingScreenRequest,
): RankingScreenContent {
  const scope: StandingsScope = { season_id: season.id, category_id: request.category_id, ...domain };
  const enrollments = countedEnrollments(scope, request.now);
  const own = ownEnrollment(domain, enrollments, request.viewer_id);
  const activeCount = enrollments.filter((enrollment) => enrollment.status === 'active').length;
  const header = seasonHeader(domain, season, activeCount, request.now);
  const nameOf = (enrollment: Enrollment) => enrollmentPlayers(domain, enrollment).map((p) => p.name).join(' e ');
  const unranked = unrankedEnrollments(scope, nameOf, request.now);
  if (unranked !== null) return { kind: 'unranked', header, entries: unrankedContent(domain, unranked, own?.id ?? null) };
  const table = rankingTable(domain, scope, season.final, own?.id ?? null, request.now, header.phase !== 'open');
  return { kind: 'table', header, ...table, own_enrollment_id: own?.id ?? null };
}

function findCategory(domain: RankingScreenDomain, categoryId: string) {
  const category = domain.categories.find((candidate) => candidate.id === categoryId);
  const competition = domain.competitions.find((candidate) => candidate.id === category?.competition_id);
  return category && competition?.type === 'ranking' ? { category, competition } : null;
}

/**
 * A tela da categoria, ou null quando a rota não existe: categoria que não é
 * de ranking, ou `?temporada=` de outro ranking. A página responde 404.
 * Ex.: `rankingScreen(mockProfileDomain, { category_id, season_id: null, viewer_id, now })`.
 */
export function rankingScreen(domain: RankingScreenDomain, request: RankingScreenRequest): RankingScreenModel | null {
  const found = findCategory(domain, request.category_id);
  if (found === null) return null;
  const season = selectSeason(domain.seasons, found.competition.id, request.season_id, request.now);
  if (season === undefined) return null;
  return {
    competition_id: found.competition.id,
    competition_name: found.competition.name,
    category: found.category,
    season_id: season?.id ?? null,
    content: season === null ? { kind: 'no_season' } : seasonContent(domain, season, request),
  };
}
