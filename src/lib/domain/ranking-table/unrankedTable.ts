import type { Enrollment } from '@/src/types/domain';
import { countedEnrollments, countedMatches, type StandingsScope } from '../standingsStats';

// Temporada aberta sem nenhuma partida confirmada (docs/RANKING.md, RK20).
// O `computeStandings` devolve todas as linhas empatadas em 0, e "1º a 16º"
// sugeriria uma ordem que não existe: a tabela lista as inscrições sem
// posição e sem pontos, em ordem alfabética.

/**
 * Inscrições em ordem alfabética do nome exibido, enquanto a temporada não
 * tem partida confirmada; null a partir da primeira, quando vale a
 * classificação. O W.O. confirmado conta: ele já dá pontos.
 * Ex.: `unrankedEnrollments(scope, (e) => unitName(e.unit_id), asOf)`.
 */
export function unrankedEnrollments(
  scope: StandingsScope,
  nameOf: (enrollment: Enrollment) => string,
  asOf?: string,
): Enrollment[] | null {
  if (countedMatches(scope, asOf).length > 0) return null;
  return countedEnrollments(scope, asOf)
    .map((enrollment) => ({ enrollment, name: nameOf(enrollment) }))
    .sort((x, y) => x.name.localeCompare(y.name, 'pt-BR'))
    .map(({ enrollment }) => enrollment);
}
