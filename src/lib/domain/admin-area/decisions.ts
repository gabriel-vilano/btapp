import type { AdminDecisionItem } from './types';

/**
 * A fila do admin, a mais antiga primeiro (RESULTS §5): é a que espera há mais
 * tempo. No empate, o id desempata para a ordem não mudar entre carregamentos.
 * Ex.: `sortDecisionsOldestFirst(data.decisions)[0].kind` → `'contested'`.
 */
export function sortDecisionsOldestFirst(decisions: AdminDecisionItem[]): AdminDecisionItem[] {
  return [...decisions].sort((x, y) => Date.parse(x.since) - Date.parse(y.since) || x.id.localeCompare(y.id));
}
