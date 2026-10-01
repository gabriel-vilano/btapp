import type { RankingMatch } from '@/src/types/domain';
import { computeStandings } from './standings';
import { countedMatches, sideOf, type StandingsScope } from './standingsStats';

// Impacto de uma partida confirmada na classificação, para quem jogou
// (docs/RESULTS.md, RG18): os pontos dela, a posição atual ao vivo (R46) e a
// variação desde antes dela. As regras da tabela são as de `computeStandings`.

/** O que a partida fez na tabela para uma inscrição. */
export interface RankingImpact {
  points: number; // da inscrição nesta partida
  position: number; // atual, ao vivo
  // Posições desde antes desta partida: positivo subiu, negativo caiu, 0 manteve.
  // null quando esta foi a primeira partida confirmada da categoria: antes
  // dela a tabela não tinha posição (RK20), e não há com o que comparar
  position_change: number | null;
}

function positionOf(scope: StandingsScope, enrollmentId: string): number | null {
  return computeStandings(scope).find((row) => row.enrollment_id === enrollmentId)?.position ?? null;
}

/**
 * Impacto da partida na posição de uma das inscrições dela, ou null quando a
 * partida não está confirmada ou a inscrição não jogou. A partida passada
 * substitui a versão dela no escopo: a tela usa a partida que acabou de mudar.
 *
 * O "antes" é a tabela atual sem esta partida, e não a foto do momento da
 * confirmação: uma partida de outros confirmada depois não entra no delta,
 * que mostra só a causa direta (RG18).
 * Ex.: `rankingImpactOf(scope, match, 'enr-lucas-rafael')` → `{ points: 110, position: 3, position_change: 2 }`.
 */
export function rankingImpactOf(scope: StandingsScope, match: RankingMatch, enrollmentId: string): RankingImpact | null {
  if (match.status !== 'confirmed') return null;
  const side = sideOf(match, enrollmentId);
  if (side === null) return null;
  const others = scope.matches.filter((candidate) => candidate.id !== match.id);
  const position = positionOf({ ...scope, matches: [...others, match] }, enrollmentId);
  if (position === null) return null;
  return { points: match.points[side], position, position_change: positionChange({ ...scope, matches: others }, enrollmentId, position) };
}

function positionChange(before: StandingsScope, enrollmentId: string, position: number): number | null {
  if (countedMatches(before).length === 0) return null;
  const previous = positionOf(before, enrollmentId);
  return previous === null ? null : previous - position;
}
