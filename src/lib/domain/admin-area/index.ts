// Área "Administrar" da competição (docs/NAVIGATION.md N31, docs/RESULTS.md §5):
// a fila de decisões e a lista de partidas. Funções puras sobre os dados já no
// formato da tela.

export type * from './types';
export { sortDecisionsOldestFirst } from './decisions';
export { adminMatchStatusLabel, matchNeedsAdmin } from './matchStatusText';
