import type { Friendship } from '@/src/types/domain';
import type { ProfileRelation } from './types';

// Amizade entre quem vê e o dono do perfil (R24), para a ação do cabeçalho (PF7).

function between(friendship: Friendship, x: string, y: string): boolean {
  const { requester_id: from, addressee_id: to } = friendship;
  return (from === x && to === y) || (from === y && to === x);
}

/**
 * Relação de quem vê com o dono do perfil.
 * Ex.: `profileRelation(friendships, 'player-andre', 'player-caio')` → "request_sent".
 */
export function profileRelation(friendships: Friendship[], viewerId: string, playerId: string): ProfileRelation {
  if (viewerId === playerId) return 'self';
  const friendship = friendships.find((f) => between(f, viewerId, playerId));
  if (friendship === undefined) return 'none';
  if (friendship.status === 'accepted') return 'friends';
  return friendship.requester_id === viewerId ? 'request_sent' : 'request_received';
}

/** Amizades aceitas do jogador: o número "amigos" do cabeçalho (PF5). */
export function friendsCount(friendships: Friendship[], playerId: string): number {
  return friendships.filter(
    (f) => f.status === 'accepted' && (f.requester_id === playerId || f.addressee_id === playerId),
  ).length;
}
