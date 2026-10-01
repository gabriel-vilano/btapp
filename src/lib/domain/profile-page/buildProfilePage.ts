import { playerRecord, type ProfileViewer } from '../profile';
import { nameResolver } from './names';
import { friendsCount, profileRelation } from './relation';
import { matchItems, rankingItems, seasonItems, versusView } from './sections';
import type { ProfileLinks, ProfilePageData, ProfilePageDomain, ProfileSection } from './types';

// Monta a página do perfil a partir das tabelas do domínio. Com mocks, as
// tabelas são o `mockProfileDomain`; com o Supabase, cada seção vira uma
// consulta e pode falhar sozinha (PF22).

function ready<T>(data: T): ProfileSection<T> {
  return { status: 'ready', data };
}

/** Quem vê o perfil de quem. `now` fixa o momento das posições e das temporadas. */
export interface ProfilePageRequest {
  username: string;
  viewerId: string;
  now: string; // ISO 8601
  links: ProfileLinks;
}

/**
 * Dados da página do perfil de `username` visto por `viewerId`, ou null
 * quando o @username não existe ("Jogador não encontrado", PROFILE.md §6.2).
 * Ex.: `buildProfilePage(mockProfileDomain, { username: 'lucassilva', viewerId, now, links })`.
 */
export function buildProfilePage(domain: ProfilePageDomain, request: ProfilePageRequest): ProfilePageData | null {
  const player = domain.players.find((candidate) => candidate.username === request.username);
  if (player === undefined) return null;
  const names = nameResolver(domain);
  const view: ProfileViewer = { playerId: player.id, viewerId: request.viewerId, now: request.now };
  const record = playerRecord(domain, player.id);
  return {
    relation: profileRelation(domain.friendships, request.viewerId, player.id),
    // "jogos" sai da mesma conta do cartel (PF6): vitórias + derrotas = jogos, e os dois
    // números nunca se contradizem. O `total_matches` guardado pode trazer partidas de fora
    // das tabelas (nos mocks, o histórico do legado)
    player: { id: player.id, name: player.name, username: player.username, avatar_url: player.avatar_url, total_matches: record.matches },
    friends_count: friendsCount(domain.friendships, player.id),
    record: { wins: record.wins, losses: record.losses },
    versus: ready(versusView(domain, names, view)),
    rankings: ready(rankingItems(domain, names, view, request.links)),
    recent_matches: ready(matchItems(domain, names, player.id)),
    seasons: ready(seasonItems(domain, names, player.id, request.now, request.links)),
  };
}
