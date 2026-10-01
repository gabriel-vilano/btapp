// Aba Explorar (docs/EXPLORE.md): competição aberta ou encerrada, a ordem da
// vitrine, a linha de situação do item, as competições da organização, o selo
// "Você participa", as linhas prontas da vitrine e da página da organização e a busca.
// Funções puras sobre as tabelas do domínio.

export { currentSeason, isCompetitionOpen, type ExploreDomain } from './competitionStatus';
export {
  openCompetitionsText,
  organizationCompetitions,
  searchCompetitionOrder,
  showcaseArenas,
  showcaseCompetitions,
  type OrganizationCompetitions,
} from './showcase';
export { BETWEEN_SEASONS_TEXT, competitionSituation, PAST_TOURNAMENT_TEXT } from './situation';
export { participatingCompetitionIds, type ParticipationTables } from './participation';
export {
  exploreShowcase,
  organizationKindLabel,
  organizationPageView,
  type ArenaListItemView,
  type CompetitionListItemView,
  type ExploreLinks,
  type ExploreShowcaseView,
  type ExploreViewDomain,
  type ExploreViewer,
  type OrganizationPageView,
} from './views';
export {
  FRIEND_SUPPORT_TEXT,
  searchPlayers,
  type PlayerSearchResult,
  type SearchDomain,
  type SearchViewer,
} from './playerSearch';
export {
  SEARCH_PAGE_SIZE,
  searchAllScopes,
  searchArenas,
  searchCompetitions,
  searchCounts,
  searchPage,
  type SearchCounts,
  type SearchPage,
  type SearchResults,
} from './search';
export { isExactUsername, matchesSearchTerm, normalizeSearchText } from './searchMatch';
