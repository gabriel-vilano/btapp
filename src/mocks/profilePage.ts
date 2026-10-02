import type { Friendship } from '@/src/types/domain';
import {
  buildFriendsList,
  buildPlayerMatches,
  buildProfilePage,
  type FriendsListData,
  type PlayerMatchesData,
  type ProfileLinks,
  type ProfilePageData,
} from '@/src/lib/domain/profile-page';
import { mockEntities, mockProfileDomain } from './domain';
import { mockRankingRoutes } from './rankingRoutes';

// Página do perfil sobre o `mockProfileDomain`, até a integração com o
// Supabase. Quem vê é o Lucas, o mesmo jogador da aba Competições.

// A mesma rota da classificação (RK1, RK21): o slug, não o id da categoria
const PROFILE_LINKS: ProfileLinks = { rankingHref: mockRankingRoutes.categoryHref };

/** O jogador "logado" dos mocks. */
export const MOCK_VIEWER = mockEntities.players.lucas;

/**
 * Perfil de `username` visto pelo Lucas, no momento pedido; null quando o @username não existe.
 * Ex.: `mockProfilePage('pedrohenrique')`.
 */
export function mockProfilePage(username: string, now = new Date().toISOString()): ProfilePageData | null {
  return buildProfilePage(mockProfileDomain, { username, viewerId: MOCK_VIEWER.id, now, links: PROFILE_LINKS });
}

function pageOf(username: string): ProfilePageData {
  const page = mockProfilePage(username);
  if (page === null) throw new Error(`Mocks do perfil: @${username} não existe no mockProfileDomain`);
  return page;
}

const { players } = mockEntities;
const own = pageOf(players.lucas.username);

/**
 * Situações da página, para as stories. Ex.: `<ProfilePage data={mockProfilePages.friend} />`.
 * - `own`: o próprio perfil do Lucas, com "Melhor: 1º" e uma temporada encerrada;
 * - `friend`: o Pedro, amigo, com H2H no bloco "Vocês";
 * - `opponent`: o Caio, sem amizade, com o próximo confronto sem data;
 * - `requestSent` e `requestReceived`: o Thiago, nos dois lados do pedido de amizade;
 * - `newPlayer` e `ownNew`: jogador sem partida nem inscrição, visto por outro e por ele mesmo;
 * - `sectionError`: o próprio perfil com "Rankings" e "Partidas recentes" falhando.
 */
export const mockProfilePages = {
  own,
  friend: pageOf(players.pedro.username),
  opponent: pageOf(players.caio.username),
  requestSent: { ...pageOf(players.thiago.username), relation: 'request_sent' },
  requestReceived: { ...pageOf(players.thiago.username), relation: 'request_received' },
  newPlayer: pageOf(players.marina.username),
  ownNew: { ...pageOf(players.marina.username), relation: 'self' },
  sectionError: { ...own, rankings: { status: 'error' }, recent_matches: { status: 'error' } },
} satisfies Record<string, ProfilePageData>;

/**
 * Lista de amigos de `username` vista pelo Lucas; null quando o @username não existe.
 * Ex.: `mockFriendsList('lucassilva')`.
 */
export function mockFriendsList(username: string): FriendsListData | null {
  return buildFriendsList(mockProfileDomain, { username, viewerId: MOCK_VIEWER.id });
}

function friendsListOf(username: string, viewerId = MOCK_VIEWER.id, domain = mockProfileDomain): FriendsListData {
  const list = buildFriendsList(domain, { username, viewerId });
  if (list === null) throw new Error(`Mocks da lista de amigos: @${username} não existe no mockProfileDomain`);
  return list;
}

// Só para a story da lista longa: amizades a mais no domínio mudariam o feed dos mocks,
// que gera um evento por amizade aceita (R24)
const LONG_LIST_FRIENDS = [players.rafael, players.thiago, players.ana, players.bruno, players.carla, players.eduardo];
const longListDomain = {
  ...mockProfileDomain,
  friendships: [
    ...mockProfileDomain.friendships,
    ...LONG_LIST_FRIENDS.map(
      (friend): Friendship => ({
        id: `friendship-lucas-${friend.id}`,
        requester_id: players.lucas.id,
        addressee_id: friend.id,
        requested_at: '2026-08-01T12:00:00Z',
        status: 'accepted',
        accepted_at: '2026-08-02T12:00:00Z',
      }),
    ),
  ],
};

/**
 * Situações da lista de amigos, para as stories. Ex.: `<FriendsList data={mockFriendsLists.own} />`.
 * - `own`: a do Lucas, com um amigo;
 * - `longList`: a do Lucas com sete amigos;
 * - `other`: a do Pedro, em que a linha do Lucas leva a /perfil;
 * - `empty` e `ownEmpty`: a da Marina, sem amigos, vista pelo Lucas e por ela mesma.
 */
export const mockFriendsLists = {
  own: friendsListOf(players.lucas.username),
  longList: friendsListOf(players.lucas.username, MOCK_VIEWER.id, longListDomain),
  other: friendsListOf(players.pedro.username),
  empty: friendsListOf(players.marina.username),
  ownEmpty: friendsListOf(players.marina.username, players.marina.id),
} satisfies Record<string, FriendsListData>;

/**
 * Partidas de `username` (`/jogadores/[username]/partidas`); null quando o @username não existe.
 * Ex.: `mockPlayerMatches('pedrohenrique')`.
 */
export function mockPlayerMatches(username: string): PlayerMatchesData | null {
  return buildPlayerMatches(mockProfileDomain, username);
}

function playerMatchesOf(username: string): PlayerMatchesData {
  const list = mockPlayerMatches(username);
  if (list === null) throw new Error(`Mocks das partidas do jogador: @${username} não existe no mockProfileDomain`);
  return list;
}

/**
 * Situações da lista de partidas de outro jogador, para as stories.
 * - `other`: as 8 partidas do Pedro, mais que as 5 do perfil;
 * - `empty`: a da Marina, sem partida.
 */
export const mockPlayerMatchesLists = {
  other: playerMatchesOf(players.pedro.username),
  empty: playerMatchesOf(players.marina.username),
} satisfies Record<string, PlayerMatchesData>;
