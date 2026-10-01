import { playerRecord } from '../profile';
import { OWN_PROFILE_PATH, playerPath } from './routes';
import type { FriendListItem, FriendsListData, ProfilePageDomain } from './types';

// Lista de amigos de um jogador (PROFILE.md PF5): as amizades aceitas (R24),
// em ordem alfabética. Pedidos pendentes não entram: a lista é de amigos.

/** Quem vê a lista de quem. */
export interface FriendsListRequest {
  username: string;
  viewerId: string;
}

function friendIds(domain: ProfilePageDomain, playerId: string): string[] {
  return domain.friendships
    .filter((f) => f.status === 'accepted' && (f.requester_id === playerId || f.addressee_id === playerId))
    .map((f) => (f.requester_id === playerId ? f.addressee_id : f.requester_id));
}

// O próprio jogador tem rota própria (N10): na lista de outro, a linha dele leva a /perfil
function profileHref(username: string, playerId: string, viewerId: string): string {
  return playerId === viewerId ? OWN_PROFILE_PATH : playerPath(username);
}

function friendItem(domain: ProfilePageDomain, id: string, viewerId: string): FriendListItem {
  const player = domain.players.find((candidate) => candidate.id === id);
  if (player === undefined) throw new Error(`Lista de amigos: jogador '${id}' não existe nas tabelas do domínio`);
  const { name, username, avatar_url } = player;
  // "jogos" com a mesma conta do cabeçalho do perfil que a linha abre (PF6)
  const total_matches = playerRecord(domain, id).matches;
  return { id, name, username, avatar_url, total_matches, href: profileHref(username, id, viewerId) };
}

/**
 * Lista de amigos de `username` vista por `viewerId`, ou null quando o @username não existe.
 * Ex.: `buildFriendsList(mockProfileDomain, { username: 'lucassilva', viewerId: 'player-lucas' })`.
 */
export function buildFriendsList(domain: ProfilePageDomain, request: FriendsListRequest): FriendsListData | null {
  const owner = domain.players.find((candidate) => candidate.username === request.username);
  if (owner === undefined) return null;
  const friends = friendIds(domain, owner.id)
    .map((id) => friendItem(domain, id, request.viewerId))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return {
    owner: { name: owner.name, username: owner.username },
    is_own: owner.id === request.viewerId,
    profile_href: profileHref(owner.username, owner.id, request.viewerId),
    friends,
  };
}
