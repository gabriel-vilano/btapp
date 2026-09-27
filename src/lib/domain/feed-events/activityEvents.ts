import type {
  CompetitionMatch,
  Enrollment,
  EnrollmentEvent,
  Friendship,
  FriendshipEvent,
  Match,
  MatchDefinedEvent,
  ResultEvent,
} from '@/src/types/domain';
import { confirmedAt } from '../standingsStats';
import type { ActorLookup } from './feedDomain';

// Eventos que nascem de um fato isolado (R24): uma partida confirmada, um
// confronto definido, uma inscrição, uma amizade aceita. Todos públicos.
//
// O id do evento é derivado da origem (`event-result-<partida>`). Gerar de
// novo a partir do mesmo estado dá o mesmo evento: é o que faz a correção de
// placar (R41) atualizar o card existente em vez de criar outro.

type ConfirmedMatch = Extract<Match, { status: 'confirmed' }>;

function confirmationTime(match: ConfirmedMatch): string {
  // Amistoso não tem prazo nem admin: confirma quando o outro lado responde (R43)
  return match.kind === 'friendly' ? match.response.responded_at : confirmedAt(match.confirmation);
}

/**
 * Um evento por partida confirmada: ranking, torneio e amistoso (R16, R24).
 * Nasce no momento da confirmação, venha ela do adversário, do prazo ou do
 * admin. A correção posterior não muda o momento (o card só atualiza), e a
 * partida anulada deixa de ter card (sai do estado confirmada).
 */
export function resultEvents(matches: Match[], actors: ActorLookup): ResultEvent[] {
  return matches
    .filter((match): match is ConfirmedMatch => match.status === 'confirmed')
    .map((match) => ({
      id: `event-result-${match.id}`,
      type: 'result',
      visibility: 'public',
      match_id: match.id,
      actor_ids: actors.ofMatch(match),
      created_at: confirmationTime(match),
    }));
}

/**
 * Um evento por confronto de competição, no momento do sorteio (ranking) ou do
 * cadastro (torneio). O amistoso não tem: nasce já com o resultado (R42). O
 * evento fica mesmo quando a partida anda de estado: o confronto foi definido.
 */
export function matchDefinedEvents(matches: Match[], actors: ActorLookup): MatchDefinedEvent[] {
  return matches
    .filter((match): match is CompetitionMatch => match.kind !== 'friendly')
    .map((match) => ({
      id: `event-defined-${match.id}`,
      type: 'match_defined',
      visibility: 'public',
      match_id: match.id,
      actor_ids: actors.ofMatch(match),
      created_at: match.created_at,
    }));
}

/** Um evento por inscrição, em ranking ou torneio, no momento da inscrição. */
export function enrollmentEvents(enrollments: Enrollment[], actors: ActorLookup): EnrollmentEvent[] {
  return enrollments.map((enrollment) => ({
    id: `event-${enrollment.id}`,
    type: 'enrollment',
    visibility: 'public',
    enrollment_id: enrollment.id,
    actor_ids: actors.ofEnrollment(enrollment.id),
    created_at: enrollment.enrolled_at,
  }));
}

/** Só a amizade aceita vira evento (R24); o pedido pendente não aparece. */
export function friendshipEvents(friendships: Friendship[]): FriendshipEvent[] {
  return friendships.flatMap((friendship) =>
    friendship.status === 'accepted'
      ? [{
          id: `event-${friendship.id}`,
          type: 'friendship',
          visibility: 'public',
          friendship_id: friendship.id,
          actor_ids: [friendship.requester_id, friendship.addressee_id],
          created_at: friendship.accepted_at,
        } satisfies FriendshipEvent]
      : [],
  );
}
