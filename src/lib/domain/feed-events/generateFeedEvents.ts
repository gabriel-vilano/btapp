import type { FeedEvent } from '@/src/types/domain';
import {
  enrollmentEvents,
  friendshipEvents,
  matchDefinedEvents,
  resultEvents,
} from './activityEvents';
import { actorLookup, type FeedDomain } from './feedDomain';
import { qualificationEvents } from './finalQualification';
import { milestoneEvents } from './milestones';
import { movementEvents } from './rankingMovement';

// Os eventos automáticos do feed (R24) são uma projeção do estado do domínio:
// não se guardam à parte, saem das tabelas cada vez que são pedidos. Pendências
// (lançar, responder, aceitar proposta) não viram evento: moram na agenda.

const newestFirst = (a: FeedEvent, b: FeedEvent) =>
  Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id);

/**
 * Todos os eventos do feed até `now`, do mais recente para o mais antigo, com
 * a visibilidade de cada um. Quem vê cada evento: `isVisibleTo`.
 * Ex.: `generateFeedEvents(mockDomain, new Date().toISOString())`.
 */
export function generateFeedEvents(domain: FeedDomain, now: string): FeedEvent[] {
  const actors = actorLookup(domain);
  const events: FeedEvent[] = [
    ...resultEvents(domain.matches, actors),
    ...matchDefinedEvents(domain.matches, actors),
    ...enrollmentEvents(domain.enrollments, actors),
    ...friendshipEvents(domain.friendships),
    ...movementEvents(domain.standingSnapshots, domain.rounds, actors),
    ...milestoneEvents(domain.milestones, actors),
    ...domain.seasons.flatMap((season) => qualificationEvents(season, domain, actors, now)),
  ];
  // O feed só mostra o que já aconteceu: nada com data depois de `now`
  return events.filter((event) => Date.parse(event.created_at) <= Date.parse(now)).sort(newestFirst);
}
