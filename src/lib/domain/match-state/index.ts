// Máquina de estados da partida (docs/DOMAIN.md §3). Cada transição é uma
// função pura: recebe a partida e devolve a partida no novo estado, ou lança
// MatchTransitionError quando a ação não vale naquele estado ou para quem age.

export { MatchTransitionError, type MatchTransitionErrorCode } from './transitionError';
export { responseDeadline, type MatchSidePlayers, type TransitionActor } from './guards';
export type { ScoreRankingResult } from './matchBase';
export {
  confirmRankingByDeadline,
  confirmRankingResult,
  contestRankingResult,
  markRankingNotPlayed,
  reportRankingResult,
  undoRankingReport,
  type RankingMatchContext,
} from './rankingTransitions';
export {
  annulResult,
  arbitrateRankingResult,
  cancelNotPlayed,
  correctResult,
  decideNotPlayed,
  reportTournamentResult,
  type AdminContext,
} from './adminTransitions';
export {
  cancelFriendly,
  confirmFriendly,
  contestFriendly,
  reportFriendly,
  type FriendlyMatchDraft,
} from './friendlyTransitions';
