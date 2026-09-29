import type { SeasonFinal } from '@/src/types/domain';
import { cutoffLine } from '../roundClose';
import type { StandingRow } from '../standings';

// "Faltam 12 pts para o 8º" (docs/RANKING.md, RK11): a distância em pontos
// até a última vaga da final. É distância para a posição, não garantia
// matemática de vaga (R28).

/** Quanto falta para a última vaga. */
export interface CutoffDistance {
  points: number; // pontos da última vaga − pontos da inscrição; 0 quando perde só no desempate
  position: number; // posição da última vaga; com encerrada dentro da zona, passa de `qualifiers`
}

function beforeCutoff(final: SeasonFinal, asOf: string): boolean {
  return Date.parse(asOf) <= Date.parse(final.cutoff_date);
}

/**
 * Distância da inscrição até a última vaga, ou null quando a linha não mostra
 * nada: temporada sem final, depois da data de corte, inscrição dentro da
 * zona, encerrada (não disputa vaga, R45) ou fora da tabela.
 * Ex.: `cutoffDistance(rows, season.final, ownEnrollmentId, asOf)`.
 */
export function cutoffDistance(
  rows: StandingRow[],
  final: SeasonFinal | null,
  enrollmentId: string,
  asOf: string,
): CutoffDistance | null {
  if (final === null || !beforeCutoff(final, asOf)) return null;
  const own = rows.find((row) => row.enrollment_id === enrollmentId);
  if (own === undefined || own.enrollment_status !== 'active') return null;
  const { qualified_ids } = cutoffLine(rows, final.qualifiers);
  if (qualified_ids.includes(enrollmentId)) return null;
  const lastIn = rows.find((row) => row.enrollment_id === qualified_ids.at(-1));
  if (lastIn === undefined) return null;
  return { points: lastIn.points - own.points, position: lastIn.position };
}
