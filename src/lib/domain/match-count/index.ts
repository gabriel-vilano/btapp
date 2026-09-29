// Contagens do jogador a partir das partidas (docs/DOMAIN.md, R18 e R19):
// `total_matches` e H2H. Funções puras: recebem as tabelas e devolvem o
// número, sem guardar nada.

export {
  isPlayedMatch,
  isPlayedResult,
  resultOf,
  sideUnitsResolver,
  type ConfirmedMatch,
  type MatchCountDomain,
  type SideUnits,
} from './playedMatch';
export { countTotalMatches } from './totalMatches';
export { playerHeadToHead, unitHeadToHead, type HeadToHeadRecord } from './headToHead';
