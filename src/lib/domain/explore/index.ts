// Aba Explorar (docs/EXPLORE.md): competição aberta ou encerrada, a ordem da
// vitrine, a linha de situação do item, as competições da organização, o selo
// "Você participa" e as linhas prontas da vitrine e da página da organização.
// Funções puras sobre as tabelas do domínio.

export { currentSeason, isCompetitionOpen, type ExploreDomain } from './competitionStatus';
export {
  openCompetitionsText,
  organizationCompetitions,
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
