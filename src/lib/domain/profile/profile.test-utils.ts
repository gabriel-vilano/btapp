import type {
  CompetitorUnit,
  Enrollment,
  Match,
  Milestone,
  RankingMatch,
  Season,
  StandingSnapshot,
} from '@/src/types/domain';
import { enrolled } from '../match-count/matchCount.test-utils';
import { CATEGORY_ID, SEASON_ID, testRounds } from '../standings.test-utils';
import type { ProfileDomain } from './profileDomain';

// Cenários mínimos para as derivações do perfil. Partem da temporada de
// teste da classificação (`season-test`, `cat-test`) e das unidades e
// partidas das contagens (`matchCount.test-utils`).

/** Um momento durante a temporada de teste, e um depois do fim dela. */
export const DURING = '2026-02-01T12:00:00Z';
export const AFTER = '2026-07-01T12:00:00Z';

/** Temporada de teste: jan–jun de 2026, sem final. `overrides` troca o que o teste pedir. */
export function testSeason(overrides: Partial<Season> = {}): Season {
  return {
    id: SEASON_ID,
    ranking_id: 'comp-test',
    name: 'Temporada de teste',
    starts_on: '2026-01-01',
    ends_on: '2026-06-30',
    final: null,
    ...overrides,
  };
}

/** Inscrição da unidade em outra categoria ou temporada. Ex.: `enrolledIn(xz, 'cat-other')`. */
export function enrolledIn(unit: CompetitorUnit, categoryId: string, seasonId = SEASON_ID): Enrollment {
  const base = enrolled(unit);
  return { ...base, id: `${base.id}-${categoryId}-${seasonId}`, category_id: categoryId, season_id: seasonId };
}

/** Foto de fim de rodada da inscrição na posição pedida (R46). */
export function snapshot(enrollment: Enrollment, position: number, roundId = testRounds.first.id): StandingSnapshot {
  return { round_id: roundId, category_id: enrollment.category_id, enrollment_id: enrollment.id, position, points: 0 };
}

/** Confronto definido (R7) entre as inscrições, com a data acordada, se houver. */
export function definedMatch(a: Enrollment, b: Enrollment, scheduledAt: string | null, slug = 'defined'): RankingMatch {
  return {
    id: `match-${slug}-${a.id}-${b.id}`,
    kind: 'ranking',
    competition_id: 'comp-test',
    category_id: CATEGORY_ID,
    round_id: testRounds.second.id,
    undone_reports: [],
    side_a_enrollment_id: a.id,
    side_b_enrollment_id: b.id,
    format: 'one_set_of_6',
    scheduled_at: scheduledAt,
    venue: null,
    created_at: testRounds.second.starts_at,
    status: 'defined',
  };
}

interface ProfileScenario {
  units: CompetitorUnit[];
  enrollments?: Enrollment[]; // padrão: uma inscrição por unidade na categoria de teste
  matches?: Match[];
  seasons?: Season[];
  standingSnapshots?: StandingSnapshot[];
  milestones?: Milestone[];
}

/** Domínio do perfil com a temporada e as rodadas de teste. */
export function profileDomain(scenario: ProfileScenario): ProfileDomain {
  return {
    units: scenario.units,
    enrollments: scenario.enrollments ?? scenario.units.map(enrolled),
    matches: scenario.matches ?? [],
    seasons: scenario.seasons ?? [testSeason()],
    rounds: Object.values(testRounds),
    standingSnapshots: scenario.standingSnapshots ?? [],
    milestones: scenario.milestones ?? [],
  };
}
