// Tela de classificação de uma categoria (docs/RANKING.md): qual temporada,
// o cabeçalho, as linhas e a linha de corte. Os números vêm de
// `computeStandings` e das funções de `ranking-table`; o texto é da tela.

export { rankingScreen, type RankingScreenDomain, type RankingScreenRequest } from './rankingScreen';
export type {
  CutoffDivider,
  RankingLine,
  RankingPlayer,
  RankingScreenContent,
  RankingScreenModel,
  SeasonHeader,
  SeasonPhase,
  UnrankedEntry,
} from './types';
