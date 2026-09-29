import {
  DEFAULT_TOP_N,
  type Milestone,
  type MilestoneEvent,
  type Round,
  type Season,
  type StandingSnapshot,
} from '@/src/types/domain';
import type { ActorLookup } from './feedDomain';

// Marcos de primeira vez na temporada: Líder e Top N (R25, R47). Saem no
// fechamento da rodada, da foto da classificação, e ficam guardados. Por isso
// a concessão é incremental: recebe os marcos já concedidos e só devolve os
// novos. Nenhuma rodada seguinte nem correção de placar tira um marco.

/** N do marco Top N: os classificados da final, ou 10 sem final (R47). */
export function topNOf(season: Season): number {
  return season.final?.qualifiers ?? DEFAULT_TOP_N;
}

function newMilestone(
  type: Milestone['type'],
  snapshot: StandingSnapshot,
  round: Round,
  season: Season,
): Milestone {
  const base = {
    id: `milestone-${type}-${snapshot.enrollment_id}`, // um por tipo por inscrição, e a inscrição é da temporada
    enrollment_id: snapshot.enrollment_id,
    season_id: season.id,
    round_id: round.id,
    achieved_at: round.deadline,
  };
  return type === 'leader' ? { ...base, type } : { ...base, type, n: topNOf(season) };
}

/**
 * Marcos novos na foto de fechamento de uma rodada: a primeira vez de cada
 * inscrição em 1º (Líder) e até a posição N (Top N). Quem estreia nos dois na
 * mesma rodada ganha os dois; o evento é um só (`milestoneEvents`).
 * Ex.: `granted.push(...grantMilestones(closeRound(round, scope), round, season, granted))`.
 */
export function grantMilestones(
  photo: StandingSnapshot[],
  round: Round,
  season: Season,
  granted: Milestone[],
): Milestone[] {
  if (round.season_id !== season.id) {
    throw new Error(`Rodada '${round.id}' é da temporada '${round.season_id}', esperado '${season.id}'`);
  }
  const has = (type: Milestone['type'], enrollmentId: string) =>
    granted.some((m) => m.season_id === season.id && m.type === type && m.enrollment_id === enrollmentId);
  return photo.filter((snapshot) => snapshot.round_id === round.id).flatMap((snapshot) => {
    const reached: Milestone['type'][] = [];
    if (snapshot.position === 1 && !has('leader', snapshot.enrollment_id)) reached.push('leader');
    if (snapshot.position <= topNOf(season) && !has('top_n', snapshot.enrollment_id)) reached.push('top_n');
    return reached.map((type) => newMilestone(type, snapshot, round, season));
  });
}

// Líder e Top N na mesma rodada geram um evento só, o de Líder (R47)
function isShadowedByLeader(milestone: Milestone, all: Milestone[]): boolean {
  return milestone.type === 'top_n' && all.some((other) =>
    other.type === 'leader' && other.enrollment_id === milestone.enrollment_id && other.round_id === milestone.round_id);
}

/** Um evento público por marco concedido, menos o Top N coberto pelo Líder. */
export function milestoneEvents(milestones: Milestone[], actors: ActorLookup): MilestoneEvent[] {
  return milestones
    .filter((milestone) => !isShadowedByLeader(milestone, milestones))
    .map((milestone) => ({
      id: `event-${milestone.id}`,
      type: 'milestone',
      visibility: 'public',
      milestone_id: milestone.id,
      actor_ids: actors.ofEnrollment(milestone.enrollment_id),
      created_at: milestone.achieved_at,
    }));
}
