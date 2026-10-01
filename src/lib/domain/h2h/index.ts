// Domínio da página de H2H (docs/HEAD_TO_HEAD.md): rota, perspectiva,
// resumo, confrontos, forma recente, ranking em comum e pares cruzados.
// Funções puras: recebem as tabelas e devolvem ids e números, sem texto.

export { buildH2HPage, type H2HPageData, type H2HPageRequest, type H2HPageResult } from './buildH2HPage';
export { h2hConfrontations } from './confrontations';
export { h2hCrossPairs } from './crossPairs';
export { H2H_FORM_LIMIT, h2hForm } from './form';
export { orientSides, sidePlayerIds } from './perspective';
export { h2hSharedRankings } from './rankings';
export { H2H_PATH, h2hPath, parseSideSegment, resolveH2HRoute, type H2HRouteResult } from './route';
export { h2hSummary } from './summary';
export type {
  H2HConfrontation,
  H2HCrossPair,
  H2HDomain,
  H2HForm,
  H2HLineup,
  H2HMatchContext,
  H2HPageKind,
  H2HSharedRanking,
  H2HSide,
  H2HStanding,
  H2HSummaryData,
  OrientedSides,
} from './types';
