import { describe, expect, it } from 'vitest';
import {
  applyFriendshipAction,
  friendsCountDelta,
  type FriendshipAction,
  type FriendshipStatus,
} from './transitions';

// Ações de amizade do perfil e do feed (R24, PF7).

describe('applyFriendshipAction', () => {
  it.each<[FriendshipStatus, FriendshipAction, FriendshipStatus]>([
    ['none', 'request', 'request_sent'],
    ['request_sent', 'cancel', 'none'],
    ['request_received', 'accept', 'friends'],
    ['request_received', 'decline', 'none'],
    ['friends', 'unfriend', 'none'],
  ])('%s + %s → %s', (status, action, expected) => {
    expect(applyFriendshipAction(status, action)).toBe(expected);
  });

  it.each<[FriendshipStatus, FriendshipAction]>([
    ['friends', 'request'],
    ['none', 'cancel'],
    ['request_sent', 'accept'],
    ['none', 'unfriend'],
  ])('recusa %s + %s, com o valor recebido e o esperado', (status, action) => {
    expect(() => applyFriendshipAction(status, action)).toThrow(`recebi '${status}'`);
  });
});

describe('friendsCountDelta', () => {
  it.each<[FriendshipStatus, FriendshipStatus, number]>([
    ['request_received', 'friends', 1],
    ['friends', 'none', -1],
    ['none', 'request_sent', 0],
    ['friends', 'friends', 0],
  ])('%s → %s: %i', (before, after, delta) => {
    expect(friendsCountDelta(before, after)).toBe(delta);
  });
});
