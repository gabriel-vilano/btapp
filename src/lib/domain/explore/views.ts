import type { Competition, Organization, OrganizationKind } from '@/src/types/domain';
import { isCompetitionOpen, type ExploreDomain } from './competitionStatus';
import { participatingCompetitionIds, type ParticipationTables } from './participation';
import { openCompetitionsText, organizationCompetitions, showcaseArenas, showcaseCompetitions } from './showcase';
import { competitionSituation } from './situation';

// Dados prontos para a vitrine (docs/EXPLORE.md §3) e a página da organização
// (§5): o texto de cada linha já montado, para os componentes só exibirem.
// As rotas vêm de fora (`links`): o domínio não guarda slug de competição.

/** Tabelas da vitrine e do selo "Você participa". O `mockExploreDomain` satisfaz. */
export type ExploreViewDomain = ExploreDomain & ParticipationTables;

/** Quem vê e quando: o selo é do jogador, e "aberta" depende do dia. */
export interface ExploreViewer {
  playerId: string;
  now: string; // ISO 8601
}

/** Rotas da competição (NAV N9) e da organização (EX22). */
export interface ExploreLinks {
  competitionHref: (competitionId: string) => string;
  organizationHref: (username: string) => string;
}

/** Uma linha do CompetitionListItem (EX10). */
export interface CompetitionListItemView {
  id: string;
  name: string;
  typeLabel: 'Ranking' | 'Torneio';
  organizationName: string;
  organizationAvatarUrl: string | null;
  city: string;
  situation: string;
  participating: boolean;
  href: string;
}

/** Uma linha da seção "Arenas" (EX11). */
export interface ArenaListItemView {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string;
  openCompetitions: string; // "2 competições abertas"
  href: string;
}

export interface ExploreShowcaseView {
  competitions: CompetitionListItemView[]; // na ordem da EX8
  hasOpenCompetition: boolean; // sem nenhuma, "Nenhuma competição aberta agora." (EX13)
  arenas: ArenaListItemView[];
}

export interface OrganizationPageView {
  name: string;
  username: string;
  avatarUrl: string | null;
  kindLabel: string; // "Arena", "Clube", "Federação", "Grupo"
  city: string;
  contact: string | null;
  competitions: CompetitionListItemView[]; // abertas e rankings entre temporadas, na ordem da EX8
  hasOpenCompetition: boolean;
  closed: CompetitionListItemView[]; // torneios passados, atrás de "Ver encerradas (N)"
}

const KIND_LABEL: Record<OrganizationKind, string> = {
  arena: 'Arena',
  club: 'Clube',
  federation: 'Federação',
  group: 'Grupo',
};

/** O tipo escrito no cabeçalho da página da organização (EX22). */
export function organizationKindLabel(kind: OrganizationKind): string {
  return KIND_LABEL[kind];
}

interface ItemContext {
  domain: ExploreViewDomain;
  viewer: ExploreViewer;
  links: ExploreLinks;
  participating: Set<string>;
}

function contextOf(domain: ExploreViewDomain, viewer: ExploreViewer, links: ExploreLinks): ItemContext {
  return { domain, viewer, links, participating: participatingCompetitionIds(domain, viewer.playerId, viewer.now) };
}

function organizationOf(competition: Competition, domain: ExploreDomain): Organization {
  const organization = domain.organizations.find((candidate) => candidate.id === competition.organization_id);
  if (organization === undefined) {
    throw new Error(`Competição '${competition.id}' aponta para a organização '${competition.organization_id}', que não existe`);
  }
  return organization;
}

function toCompetitionItem(competition: Competition, context: ItemContext): CompetitionListItemView {
  const organization = organizationOf(competition, context.domain);
  return {
    id: competition.id,
    name: competition.name,
    typeLabel: competition.type === 'ranking' ? 'Ranking' : 'Torneio',
    organizationName: organization.name,
    organizationAvatarUrl: organization.avatar_url,
    city: organization.city,
    situation: competitionSituation(competition, context.domain, context.viewer.now),
    participating: context.participating.has(competition.id),
    href: context.links.competitionHref(competition.id),
  };
}

function toArenaItem(arena: Organization, context: ItemContext): ArenaListItemView {
  return {
    id: arena.id,
    name: arena.name,
    avatarUrl: arena.avatar_url,
    city: arena.city,
    openCompetitions: openCompetitionsText(arena.id, context.domain, context.viewer.now),
    href: context.links.organizationHref(arena.username),
  };
}

/**
 * A vitrine do Explorar: competições na ordem da EX8, com o selo da EX9, e as arenas (EX11).
 * @example exploreShowcase(mockExploreDomain, { playerId: MOCK_VIEWER_ID, now }, mockExploreRoutes)
 */
export function exploreShowcase(domain: ExploreViewDomain, viewer: ExploreViewer, links: ExploreLinks): ExploreShowcaseView {
  const context = contextOf(domain, viewer, links);
  const competitions = showcaseCompetitions(domain, viewer.now);
  return {
    competitions: competitions.map((competition) => toCompetitionItem(competition, context)),
    hasOpenCompetition: competitions.some((competition) => isCompetitionOpen(competition, domain, viewer.now)),
    arenas: showcaseArenas(domain).map((arena) => toArenaItem(arena, context)),
  };
}

/**
 * A página da organização pelo @username (EX22), ou null quando ele não existe.
 * @example organizationPageView('clubecajui', mockExploreDomain, viewer, mockExploreRoutes)?.kindLabel // "Clube"
 */
export function organizationPageView(
  username: string,
  domain: ExploreViewDomain,
  viewer: ExploreViewer,
  links: ExploreLinks,
): OrganizationPageView | null {
  const organization = domain.organizations.find((candidate) => candidate.username === username);
  if (organization === undefined) return null;
  const context = contextOf(domain, viewer, links);
  const { open, betweenSeasons, closed } = organizationCompetitions(organization.id, domain, viewer.now);
  const toItem = (competition: Competition) => toCompetitionItem(competition, context);
  return {
    name: organization.name,
    username: organization.username,
    avatarUrl: organization.avatar_url,
    kindLabel: organizationKindLabel(organization.kind),
    city: organization.city,
    contact: organization.contact,
    competitions: [...open, ...betweenSeasons].map(toItem),
    hasOpenCompetition: open.length > 0,
    closed: closed.map(toItem),
  };
}
