import type { FeedEvent } from '@/src/types/domain';

/**
 * Se o jogador pode ver o evento (R21, R22). O privado ("caiu no ranking") é
 * só dos atores: em duplas, os dois da dupla. O público pode ser visto por
 * qualquer um; em qual feed ele aparece (amigos, perfil) é da montagem do feed.
 */
export function isVisibleTo(event: FeedEvent, playerId: string): boolean {
  return event.visibility === 'public' || event.actor_ids.includes(playerId);
}
