import { describe, expect, it } from 'vitest';
import type { Friendship } from '@/src/types/domain';
import { friendsCount, profileRelation } from './relation';

// Relação de quem vê com o dono do perfil (PF7, R24) e o número de amigos (PF5).

const AT = '2026-09-01T12:00:00Z';
const pending: Friendship = { id: 'f-1', requester_id: 'x', addressee_id: 'y', requested_at: AT, status: 'pending' };
const accepted: Friendship = {
  id: 'f-2',
  requester_id: 'z',
  addressee_id: 'x',
  requested_at: AT,
  status: 'accepted',
  accepted_at: AT,
};
const friendships = [pending, accepted];

describe('profileRelation', () => {
  it.each([
    ['x', 'x', 'self'],
    ['x', 'w', 'none'],
    ['x', 'y', 'request_sent'],
    ['y', 'x', 'request_received'],
    ['x', 'z', 'friends'],
    ['z', 'x', 'friends'],
  ])('%s vendo %s: %s', (viewerId, playerId, relation) => {
    expect(profileRelation(friendships, viewerId, playerId)).toBe(relation);
  });
});

describe('friendsCount', () => {
  it('conta só as amizades aceitas, dos dois lados do pedido', () => {
    expect([friendsCount(friendships, 'x'), friendsCount(friendships, 'y'), friendsCount(friendships, 'z')]).toEqual([1, 0, 1]);
  });
});
