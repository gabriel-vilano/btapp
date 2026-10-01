import type { CompetitionCategory, CompetitorUnit, Enrollment, Season } from '@/src/types/domain';

// Selo "Você participa" (docs/EXPLORE.md, EX9 e EX10): a competição em que o
// jogador tem inscrição ativa. No ranking, a inscrição é da temporada: a de
// uma temporada que já terminou não conta, senão o ranking entre temporadas
// levaria o selo de quem jogou o semestre passado.

/** Tabelas que dizem quem está inscrito em quê. O `mockExploreDomain` satisfaz. */
export interface ParticipationTables {
  categories: CompetitionCategory[];
  units: CompetitorUnit[];
  enrollments: Enrollment[];
  seasons: Season[];
}

function isSeasonOver(seasonId: string | null, domain: Pick<ParticipationTables, 'seasons'>, now: string): boolean {
  if (seasonId === null) return false;
  const season = domain.seasons.find((candidate) => candidate.id === seasonId);
  return season === undefined || Date.parse(now) > Date.parse(season.ends_on);
}

/**
 * Ids das competições em que o jogador tem inscrição ativa.
 * @example participatingCompetitionIds(mockExploreDomain, MOCK_VIEWER_ID, now).has(ranking.id) // true
 */
export function participatingCompetitionIds(domain: ParticipationTables, playerId: string, now: string): Set<string> {
  const unitIds = new Set(domain.units.filter((unit) => unit.player_ids.includes(playerId)).map((unit) => unit.id));
  const active = domain.enrollments.filter(
    (enrollment) =>
      enrollment.status === 'active' && unitIds.has(enrollment.unit_id) && !isSeasonOver(enrollment.season_id, domain, now),
  );
  const categoryIds = new Set(active.map((enrollment) => enrollment.category_id));
  return new Set(
    domain.categories.filter((category) => categoryIds.has(category.id)).map((category) => category.competition_id),
  );
}
