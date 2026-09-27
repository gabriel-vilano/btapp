import type { CompetitorUnit, Enrollment, Season, StandingSnapshot } from '@/src/types/domain';
import { CATEGORY_ID, SEASON_ID, testRounds } from '../standings.test-utils';
import { actorLookup, type ActorLookup } from './feedDomain';

// Unidades, temporada e fotos mínimas para os testes da geração de eventos.
// Reaproveita a temporada de `standings.test-utils`: uma categoria, duas rodadas.

/** Dupla da inscrição de teste: jogadores `<slug>-1` e `<slug>-2`. */
export function unitOf(enrollment: Enrollment): CompetitorUnit {
  const slug = enrollment.unit_id.replace('unit-', '');
  return { id: enrollment.unit_id, modality: 'doubles', player_ids: [`${slug}-1`, `${slug}-2`] };
}

export function actorsFor(enrollments: Enrollment[]): ActorLookup {
  return actorLookup({ enrollments, units: enrollments.map(unitOf) });
}

export function testSeason(qualifiers: number | null, cutoffDate = testRounds.second.deadline): Season {
  return {
    id: SEASON_ID,
    ranking_id: 'comp-test',
    name: 'Temporada de teste',
    starts_on: testRounds.first.starts_at,
    ends_on: '2026-06-30T23:59:00Z',
    final: qualifiers === null ? null : { name: 'Saideira', qualifiers, cutoff_date: cutoffDate, tournament_id: null },
  };
}

/** Foto de uma rodada na ordem dada: o 1º da lista é o 1º colocado. */
export function photo(roundId: string, ordered: Enrollment[]): StandingSnapshot[] {
  return ordered.map((enrollment, index) => ({
    round_id: roundId,
    category_id: CATEGORY_ID,
    enrollment_id: enrollment.id,
    position: index + 1,
    points: (ordered.length - index) * 100,
  }));
}
