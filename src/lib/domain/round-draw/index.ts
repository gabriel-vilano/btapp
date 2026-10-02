// Sorteio da rodada do ranking (docs/DOMAIN.md, R7 e R30; docs/ROUND_DRAW.md).
// Funções puras: a aleatoriedade, os ids e o "agora" entram como parâmetro,
// então o mesmo input com a mesma semente dá sempre o mesmo sorteio.

export {
  drawRound,
  RoundDrawError,
  type DrawnMatch,
  type RoundDrawErrorCode,
  type RoundDrawInput,
} from './drawRound';
export {
  drawSeasonRound,
  type DrawnCategory,
  type SeasonRoundDraw,
  type SeasonRoundDrawInput,
  type SkippedCategory,
} from './drawSeasonRound';
export {
  summarizeRoundDraw,
  type CategoryDrawSummary,
  type DrawWarning,
  type RoundDrawSummary,
  type RoundDrawSummaryInput,
} from './drawSummary';
export { roundDrawMarks, type CategoryDrawMarks, type ShortUnit } from './drawMarks';
export {
  checkRoundDeadline,
  suggestRoundDeadline,
  type AfterCutoffWarning,
  type RoundDeadlineCheck,
  type RoundDeadlineError,
  type RoundDeadlineErrorCode,
  type SuggestedDeadline,
} from './roundDeadline';
export {
  roundDrawAvailability,
  undrawnCategories,
  type RoundDrawAvailability,
  type UndrawnCategoriesInput,
  type UndrawnCategory,
} from './drawAvailability';
export {
  checkUndoCategoryDraw,
  undoBlockerText,
  type PlayerAction,
  type PlayerActionKind,
  type UndoDrawBlocker,
  type UndoDrawCheck,
  type UndoDrawInput,
} from './undoCategoryDraw';
export {
  undoCategoryDraw,
  UndoDrawError,
  type CategoryDrawUndo,
  type UndoCategoryDrawInput,
} from './undoCategoryDrawRecord';
export { drawPairings, type PairingProblem } from './drawPairings';
export { countPairs, pairKey, type PairCounts, type Pairing } from './pairHistory';
export { createSeededRandom, type RandomSource } from './seededRandom';
