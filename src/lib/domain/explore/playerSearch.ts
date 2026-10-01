import type { CompetitionCategory, Enrollment, Friendship, Player } from '@/src/types/domain';
import { hasPlayer } from '../match-count/playedMatch';
import { categoryName } from '../profile-page/names';
import { profileRelation } from '../profile-page/relation';
import { currentEnrollments } from '../profile/rankings';
import type { ProfileDomain } from '../profile/profileDomain';
import { isCompetitionOpen, type ExploreDomain } from './competitionStatus';
import { isExactUsername, matchesSearchTerm } from './searchMatch';

// Escopo Jogadores da busca (docs/EXPLORE.md, EX14, EX16 e EX17).

/** Tabelas que a busca lê. O `mockExploreDomain` satisfaz. */
export interface SearchDomain extends ProfileDomain, ExploreDomain {
  players: Player[];
  friendships: Friendship[];
  categories: CompetitionCategory[];
}

/** Quem busca, e quando. */
export interface SearchViewer {
  viewerId: string;
  now: string; // ISO 8601
}

/**
 * O item de jogador (EX17). Só o que já é público: nada de telefone, e-mail
 * ou data de nascimento (EX14, §7.1). O id também fica de fora: o toque usa
 * o @username (`/jogadores/[username]`).
 */
export interface PlayerSearchResult {
  name: string;
  username: string;
  avatar_url: string | null;
  support: string | null; // "Amigo", "Competição · Categoria" ou nada
}

export const FRIEND_SUPPORT_TEXT = 'Amigo';

// Inscrição ativa: no ranking, em temporada que não terminou; no torneio,
// enquanto ele não terminou
function activeEnrollments(domain: SearchDomain, playerId: string, now: string): Enrollment[] {
  const unitIds = new Set(domain.units.filter((unit) => hasPlayer(unit, playerId)).map((unit) => unit.id));
  const tournament = domain.enrollments.filter(
    (e) => e.season_id === null && e.status === 'active' && unitIds.has(e.unit_id) && isOpenTournament(domain, e, now),
  );
  return [...currentEnrollments(domain, playerId, now), ...tournament];
}

function isOpenTournament(domain: SearchDomain, enrollment: Enrollment, now: string): boolean {
  const competition = domain.competitions.find((c) => c.id === categoryOf(domain, enrollment).competition_id);
  return competition !== undefined && isCompetitionOpen(competition, domain, now);
}

function categoryOf(domain: SearchDomain, enrollment: Enrollment): CompetitionCategory {
  const category = domain.categories.find((candidate) => candidate.id === enrollment.category_id);
  if (category === undefined) {
    throw new Error(`Busca: categoria '${enrollment.category_id}' da inscrição '${enrollment.id}' não existe nas tabelas`);
  }
  return category;
}

// As categorias em que quem busca está inscrito agora, e as competições delas
interface ViewerCompetitions {
  competitionIds: Set<string>;
  categoryIds: Set<string>;
}

function viewerCompetitions(domain: SearchDomain, viewer: SearchViewer): ViewerCompetitions {
  const categories = activeEnrollments(domain, viewer.viewerId, viewer.now).map((e) => categoryOf(domain, e));
  return {
    competitionIds: new Set(categories.map((category) => category.competition_id)),
    categoryIds: new Set(categories.map((category) => category.id)),
  };
}

// A competição em comum que a linha mostra. Na mesma categoria de quem busca,
// ela vem primeiro: é o adversário provável (JTBD 3)
function sharedCategory(
  domain: SearchDomain,
  playerId: string,
  viewer: SearchViewer,
  shared: ViewerCompetitions,
): CompetitionCategory | null {
  const categories = activeEnrollments(domain, playerId, viewer.now)
    .map((e) => categoryOf(domain, e))
    .filter((category) => shared.competitionIds.has(category.competition_id));
  return categories.find((category) => shared.categoryIds.has(category.id)) ?? categories[0] ?? null;
}

function sharedText(domain: SearchDomain, category: CompetitionCategory): string {
  const competition = domain.competitions.find((c) => c.id === category.competition_id);
  if (competition === undefined) {
    throw new Error(`Busca: competição '${category.competition_id}' da categoria '${category.id}' não existe nas tabelas`);
  }
  return `${competition.name} · ${categoryName(category)}`;
}

// Nível da ordem da EX16: menor vem antes
interface RankedPlayer {
  result: PlayerSearchResult;
  level: number;
}

function rankPlayer(domain: SearchDomain, player: Player, term: string, viewer: SearchViewer, shared: ViewerCompetitions): RankedPlayer {
  const isFriend = profileRelation(domain.friendships, viewer.viewerId, player.id) === 'friends';
  const category = isFriend ? null : sharedCategory(domain, player.id, viewer, shared);
  const support = isFriend ? FRIEND_SUPPORT_TEXT : category && sharedText(domain, category);
  const result = { name: player.name, username: player.username, avatar_url: player.avatar_url, support };
  if (isExactUsername(player.username, term)) return { result, level: 0 };
  return { result, level: isFriend ? 1 : category === null ? 3 : 2 };
}

/**
 * Jogadores cujo nome ou @username tem uma palavra começando pelo termo,
 * menos quem busca. Ordem da EX16: @username igual ao termo, amigos, quem
 * tem competição em comum, os demais; no empate, pelo nome.
 * @example searchPlayers(mockExploreDomain, 'sil', { viewerId: 'player-pedro', now })
 */
export function searchPlayers(domain: SearchDomain, term: string, viewer: SearchViewer): PlayerSearchResult[] {
  const shared = viewerCompetitions(domain, viewer);
  return domain.players
    .filter((player) => player.id !== viewer.viewerId)
    .filter((player) => matchesSearchTerm(player.name, term) || matchesSearchTerm(player.username, term))
    .map((player) => rankPlayer(domain, player, term, viewer, shared))
    .sort((x, y) => x.level - y.level || x.result.name.localeCompare(y.result.name, 'pt-BR'))
    .map((ranked) => ranked.result);
}
