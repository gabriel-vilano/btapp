import type { Enrollment } from '@/src/types/domain';

/**
 * Inscrições que entram no sorteio de uma categoria numa temporada. A
 * encerrada fica congelada na classificação e não joga mais (R17, R45).
 */
export function activeEnrollmentIds(enrollments: readonly Enrollment[], categoryId: string, seasonId: string): string[] {
  return enrollments
    .filter((e) => e.status === 'active' && e.category_id === categoryId && e.season_id === seasonId)
    .map((e) => e.id);
}
