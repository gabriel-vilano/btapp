import { buildProfilePage, type ProfilePageData } from '@/src/lib/domain/profile-page';
import { mockEntities, mockProfileDomain } from './domain';

// Página do perfil sobre o `mockProfileDomain`, até a integração com o
// Supabase. Quem vê é o Lucas, o mesmo jogador da aba Competições.

/** O jogador "logado" dos mocks. */
export const MOCK_VIEWER = mockEntities.players.lucas;

/**
 * Perfil de `username` visto pelo Lucas, no momento pedido; null quando o @username não existe.
 * Ex.: `mockProfilePage('pedrohenrique')`.
 */
export function mockProfilePage(username: string, now = new Date().toISOString()): ProfilePageData | null {
  return buildProfilePage(mockProfileDomain, { username, viewerId: MOCK_VIEWER.id, now });
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
