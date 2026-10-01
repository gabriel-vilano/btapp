import { positionDeltas } from '../ranking-table';
import { currentEnrollments, livePosition } from '../profile/rankings';
import { scopeOf, seasonOf, type SeasonEnrollment } from '../profile/profileDomain';
import type { H2HDomain, H2HSharedRanking, H2HSide, H2HStanding } from './types';

// "No ranking" (docs/HEAD_TO_HEAD.md, HH13): só na página de duplas. A
// posição é da dupla, nunca do jogador (R1), então a página de jogadores não
// tem a seção. Uma entrada por categoria em que as duas duplas têm inscrição
// ativa, em temporada aberta, como a seção "Rankings" do perfil (PF10, PF15).

function unitEnrollments(domain: H2HDomain, unitId: string, now: string): SeasonEnrollment[] {
  // A inscrição é da unidade; qualquer jogador dela traz as inscrições, e o filtro deixa só as da dupla
  const anyPlayer = domain.units.find((unit) => unit.id === unitId)?.player_ids[0];
  if (anyPlayer === undefined) throw new Error(`H2H: unidade '${unitId}' não existe nas tabelas do domínio`);
  return currentEnrollments(domain, anyPlayer, now).filter((enrollment) => enrollment.unit_id === unitId);
}

function standingOf(domain: H2HDomain, enrollment: SeasonEnrollment, now: string): H2HStanding {
  const deltas = positionDeltas(scopeOf(domain, enrollment), domain.standingSnapshots, now);
  return {
    enrollment_id: enrollment.id,
    position: livePosition(domain, enrollment),
    position_delta: deltas.get(enrollment.id) ?? null,
  };
}

const categoryKey = (enrollment: SeasonEnrollment) => `${enrollment.season_id}|${enrollment.category_id}`;

/**
 * Categorias em comum das duas duplas, com a posição de cada uma. Fora da
 * página de duplas, a lista vem vazia (a seção some, HH8).
 * Ex.: `h2hSharedRankings(mockH2HDomain, view.left, view.right, now)`.
 */
export function h2hSharedRankings(domain: H2HDomain, left: H2HSide, right: H2HSide, now: string): H2HSharedRanking[] {
  if (left.kind !== 'unit' || right.kind !== 'unit') return [];
  const rightByCategory = new Map(unitEnrollments(domain, right.unit_id, now).map((e) => [categoryKey(e), e]));
  return unitEnrollments(domain, left.unit_id, now).flatMap((leftEnrollment) => {
    const rightEnrollment = rightByCategory.get(categoryKey(leftEnrollment));
    if (rightEnrollment === undefined) return [];
    return [{
      competition_id: seasonOf(domain, leftEnrollment).ranking_id,
      season_id: leftEnrollment.season_id,
      category_id: leftEnrollment.category_id,
      left: standingOf(domain, leftEnrollment, now),
      right: standingOf(domain, rightEnrollment, now),
    }];
  });
}
