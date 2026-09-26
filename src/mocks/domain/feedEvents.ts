import type {
  CompetitionMatch,
  Enrollment,
  FeedEvent,
  Match,
  Milestone,
  Round,
} from '@/src/types/domain';
import { confirmationTime } from './builders';
import { friendlyMatches } from './friendlies';
import { friendships, units } from './people';
import { masculinoB as mb, mistaC40 as mx, rounds } from './ranking';
import { rankingMatches } from './rankingMatches';
import { milestones } from './standings';
import { tournamentEnrollments, tournamentMatches } from './tournament';

// Eventos automáticos do feed (R24), do mais recente para o mais antigo.
// Pendências (lançar, responder, aceitar proposta) não viram evento.

const allEnrollments: Enrollment[] = [
  ...Object.values(mb),
  ...Object.values(mx),
  ...Object.values(tournamentEnrollments),
];
const allMatches: Match[] = [...rankingMatches, ...tournamentMatches, ...friendlyMatches];

function findOrThrow<T extends { id: string }>(items: T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new Error(`Mock inválido: ${what} '${id}' não existe`);
  return found;
}

function unitPlayers(unitId: string): string[] {
  return findOrThrow(Object.values(units), unitId, 'unidade').player_ids;
}

function enrollmentPlayers(enrollment: Enrollment): string[] {
  return unitPlayers(enrollment.unit_id);
}

function matchPlayers(match: Match): string[] {
  if (match.kind === 'friendly') return [...unitPlayers(match.side_a_unit_id), ...unitPlayers(match.side_b_unit_id)];
  return [match.side_a_enrollment_id, match.side_b_enrollment_id].flatMap((id) =>
    enrollmentPlayers(findOrThrow(allEnrollments, id, 'inscrição')),
  );
}

function resultEvent(matchId: string): FeedEvent {
  const match = findOrThrow(allMatches, matchId, 'partida');
  if (match.status !== 'confirmed') {
    throw new Error(`Mock inválido: '${matchId}' está '${match.status}', esperado 'confirmed'`);
  }
  const createdAt = match.kind === 'friendly' ? match.response.responded_at : confirmationTime(match.confirmation);
  return {
    id: `event-result-${matchId}`,
    type: 'result',
    visibility: 'public',
    match_id: matchId,
    actor_ids: matchPlayers(match),
    created_at: createdAt,
  };
}

function matchDefinedEvent(match: CompetitionMatch): FeedEvent {
  return {
    id: `event-defined-${match.id}`,
    type: 'match_defined',
    visibility: 'public',
    match_id: match.id,
    actor_ids: matchPlayers(match),
    created_at: match.created_at,
  };
}

function enrollmentEvent(enrollment: Enrollment): FeedEvent {
  return {
    id: `event-${enrollment.id}`,
    type: 'enrollment',
    visibility: 'public',
    enrollment_id: enrollment.id,
    actor_ids: enrollmentPlayers(enrollment),
    created_at: enrollment.enrolled_at,
  };
}

function movementEvent(enrollment: Enrollment, round: Round, from: number, to: number): FeedEvent {
  const movement = {
    id: `event-movement-${round.id}-${enrollment.id}`,
    enrollment_id: enrollment.id,
    round_id: round.id,
    from_position: from,
    to_position: to,
    actor_ids: enrollmentPlayers(enrollment),
    created_at: round.deadline, // a foto da rodada sai no fechamento (R46)
  };
  // Subiu é público; caiu, só a dupla vê (R22).
  return to < from
    ? { ...movement, type: 'ranking_up', visibility: 'public' }
    : { ...movement, type: 'ranking_down', visibility: 'private' };
}

function milestoneEvent(milestone: Milestone): FeedEvent {
  const enrollment = findOrThrow(allEnrollments, milestone.enrollment_id, 'inscrição');
  return {
    id: `event-${milestone.id}`,
    type: 'milestone',
    visibility: 'public',
    milestone_id: milestone.id,
    actor_ids: enrollmentPlayers(enrollment),
    created_at: milestone.achieved_at,
  };
}

// Líder e Top N na mesma rodada geram um evento só, o de Líder (R47).
function isShadowedByLeader(milestone: Milestone): boolean {
  return milestone.type === 'top_n' && milestones.some((other) =>
    other.type === 'leader' && other.enrollment_id === milestone.enrollment_id && other.round_id === milestone.round_id);
}

const defined = (id: string) => findOrThrow<CompetitionMatch>([...rankingMatches, ...tournamentMatches], id, 'partida');

const events: FeedEvent[] = [
  resultEvent('match-arena-rm-mb-r1-1'),
  resultEvent('match-arena-rm-mb-r2-1'),
  resultEvent('match-arena-rm-mb-r3-6'),
  resultEvent('match-arena-rm-mx-r2-4'),
  resultEvent('match-copa-sunset-mb-semi-1'),
  resultEvent('match-copa-sunset-mb-semi-2'),
  resultEvent('match-copa-sunset-mc-semi-1'),
  resultEvent('match-friendly-lucas-rafael-pedro-thiago'),
  resultEvent('match-friendly-lucas-thiago'),
  matchDefinedEvent(defined('match-arena-rm-mb-r3-2')),
  matchDefinedEvent(defined('match-copa-sunset-mb-final')),
  enrollmentEvent(mb.t1),
  enrollmentEvent(mx.m5),
  enrollmentEvent(tournamentEnrollments.lucasRafael),
  enrollmentEvent(tournamentEnrollments.henrique),
  {
    id: `event-${friendships.lucasPedro.id}`,
    type: 'friendship',
    visibility: 'public',
    friendship_id: friendships.lucasPedro.id,
    actor_ids: [friendships.lucasPedro.requester_id, friendships.lucasPedro.addressee_id],
    created_at: friendships.lucasPedro.accepted_at,
  },
  movementEvent(mb.t3, rounds.second, 3, 1),
  movementEvent(mb.t1, rounds.second, 1, 2),
  movementEvent(mb.t5, rounds.second, 2, 3),
  ...milestones.filter((milestone) => !isShadowedByLeader(milestone)).map(milestoneEvent),
];

export const feedEvents: FeedEvent[] = [...events].sort(
  (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
);
