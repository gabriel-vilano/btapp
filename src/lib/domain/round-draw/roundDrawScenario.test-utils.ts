import type {
  CompetitionCategory,
  Enrollment,
  RankingCompetition,
  RankingMatch,
  Round,
  Season,
} from '@/src/types/domain';
import { mockEntities } from '@/src/mocks/domain';

// Cenário de datas fixas para os testes do fluxo do sorteio (ROUND_DRAW.md).
// Os mocks do app usam datas relativas a "agora", que não servem para testar
// prazo às 23h59 de Brasília. Hoje é 12/10/2026, 10h em Brasília.

export const NOW = new Date('2026-10-12T13:00:00.000Z');
export const ADMIN_ID = 'player-ana';

export const ranking: RankingCompetition = { ...mockEntities.ranking, id: 'comp-bacuri', matches_per_round: 3 };

export const season: Season = {
  id: 'season-bacuri-2026-2',
  ranking_id: ranking.id,
  name: '2º semestre de 2026',
  starts_on: '2026-08-01T03:00:00.000Z',
  ends_on: '2026-12-21T02:59:00.000Z', // 20/12, 23h59 em Brasília
  final: { name: 'Saideira', qualifiers: 4, cutoff_date: '2026-12-01T02:59:00.000Z', tournament_id: null }, // corte em 30/11
};

export function round(number: number, startsAt: string, deadline: string): Round {
  return { id: `round-bacuri-${number}`, season_id: season.id, number, starts_at: startsAt, deadline };
}

export function category(id: string, competitionId = ranking.id): CompetitionCategory {
  return { id, competition_id: competitionId, gender: 'M', modality: 'doubles', level_min: 'B', level_max: 'B', min_age: null };
}

/** `count` inscrições ativas na categoria, com ids `<categoria>-u1`, `<categoria>-u2`… */
export function enrollments(categoryId: string, count: number): Enrollment[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${categoryId}-u${i + 1}`,
    unit_id: `unit-${categoryId}-${i + 1}`,
    category_id: categoryId,
    season_id: season.id,
    enrolled_at: season.starts_on,
    status: 'active',
  }));
}

export interface MatchSpec {
  id: string;
  categoryId: string;
  roundId: string;
  sides: readonly [string, string];
  createdAt: string;
}

/** Partida em "Confronto definido", montada à mão. */
export function definedMatch({ id, categoryId, roundId, sides, createdAt }: MatchSpec): RankingMatch {
  return {
    id,
    kind: 'ranking',
    competition_id: ranking.id,
    category_id: categoryId,
    round_id: roundId,
    undone_reports: [],
    side_a_enrollment_id: sides[0],
    side_b_enrollment_id: sides[1],
    format: ranking.match_format,
    scheduled_at: null,
    venue: null,
    created_at: createdAt,
    drawn_by: ADMIN_ID,
    status: 'defined',
  };
}

export function idSequence(prefix = 'match'): () => string {
  let next = 0;
  return () => `${prefix}-${++next}`;
}
