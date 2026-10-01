import { describe, expect, it } from 'vitest';
import type { Friendship } from '@/src/types/domain';
import { mockEntities, mockProfileDomain } from '@/src/mocks/domain';
import { buildFriendsList } from './friendsList';
import { playerRecord } from '../profile';

// Lista de amigos (PROFILE.md PF5) sobre os mocks do domínio.

const { players } = mockEntities;
const AT = '2026-09-01T12:00:00Z';

function accepted(id: string, from: string, to: string): Friendship {
  return { id, requester_id: from, addressee_id: to, requested_at: AT, status: 'accepted', accepted_at: AT };
}

// O Lucas com mais dois amigos e um pedido pendente, para a ordem e o filtro
const domain = {
  ...mockProfileDomain,
  friendships: [
    ...mockProfileDomain.friendships,
    accepted('f-rafael', players.rafael.id, players.lucas.id),
    accepted('f-ana', players.lucas.id, players.ana.id),
    { id: 'f-caio', requester_id: players.lucas.id, addressee_id: players.caio.id, requested_at: AT, status: 'pending' },
  ] satisfies Friendship[],
};

describe('buildFriendsList', () => {
  it('@username inexistente: null, para "Jogador não encontrado"', () => {
    expect(buildFriendsList(domain, { username: 'ninguem', viewerId: players.lucas.id })).toBeNull();
  });

  it('só amizades aceitas, dos dois lados do pedido, em ordem alfabética', () => {
    const list = buildFriendsList(domain, { username: players.lucas.username, viewerId: players.lucas.id });
    expect(list?.friends.map((f) => f.name)).toEqual(['Ana Paula Ribeiro', 'Pedro Henrique', 'Rafael Costa']);
  });

  it('a própria lista: is_own, e o "Voltar" leva a /perfil', () => {
    const list = buildFriendsList(domain, { username: players.lucas.username, viewerId: players.lucas.id });
    expect(list).toMatchObject({ is_own: true, profile_href: '/perfil', owner: { name: 'Lucas Silva' } });
  });

  it('lista de outro: a linha de quem vê leva a /perfil, as outras ao perfil público', () => {
    const list = buildFriendsList(domain, { username: players.pedro.username, viewerId: players.lucas.id });
    expect(list).toMatchObject({ is_own: false, profile_href: '/jogadores/pedrohenrique' });
    expect(list?.friends.map((f) => f.href)).toEqual(['/perfil']);
  });

  it('jogos com a mesma conta do cabeçalho do perfil, não o total guardado (PF6)', () => {
    const list = buildFriendsList(domain, { username: players.lucas.username, viewerId: players.lucas.id });
    const pedro = list?.friends.find((f) => f.id === players.pedro.id);
    expect(pedro?.total_matches).toBe(playerRecord(domain, players.pedro.id).matches);
    expect(pedro?.total_matches).not.toBe(players.pedro.total_matches);
  });

  it('sem amigos: lista vazia', () => {
    const list = buildFriendsList(domain, { username: players.marina.username, viewerId: players.lucas.id });
    expect(list?.friends).toEqual([]);
  });
});
