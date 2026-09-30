// Aba Competições (docs/NAVIGATION.md §6): ordem de "Minhas competições",
// pendências de admin e o conteúdo de cada situação. Funções puras sobre os
// dados já no formato da tela.

export type * from './types';
export { adminPendingCount, sortAdminPendings } from './adminPendings';
export { sortMyCompetitions, tournamentMoment } from './myCompetitions';
export { competitionsTabContent, type CompetitionsTabContent, type MyCompetitionsContent } from './tabContent';
