// Aba Explorar (docs/EXPLORE.md): competição aberta ou encerrada, a ordem da
// vitrine, a linha de situação do item e as competições da organização.
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
