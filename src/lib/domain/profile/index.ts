// Derivações do perfil do jogador (docs/PROFILE.md): cartel, "Rankings",
// "Temporadas" e o bloco "Vocês". Funções puras: recebem as tabelas e
// devolvem o dado de cada seção, sem nomes nem texto, que são da tela.

export type { ProfileDomain } from './profileDomain';
export { playerRecord, type PlayerRecord } from './record';
export {
  bestPosition,
  profileRankings,
  type ProfileRankingRow,
  type ProfileViewer,
} from './rankings';
export { profileSeasons, type ProfileSeasonRow, type SeasonMilestone } from './seasons';
export { profileVersus, type ProfileVersus } from './versus';
export {
  playedAt,
  recentMatches,
  RECENT_MATCHES_LIMIT,
  type RecentMatchResult,
  type RecentMatchRow,
} from './recentMatches';
