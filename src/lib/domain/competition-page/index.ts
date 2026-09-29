// Página da competição de ranking (docs/RANKING.md §7): o texto das regras e
// da temporada, e os blocos de quem vê. Funções puras sobre os dados já no
// formato da tela.

export type * from './types';
export {
  confirmationDeadlineText,
  formatMatchFormatRule,
  formatPoints,
  gameBonusPhrase,
  NOT_PLAYED_TEXT,
  scoringExample,
  scoringLines,
  superTiebreakNote,
  TIEBREAK_ORDER,
  TIEBREAK_WO_NOTE,
  type ScoringExample,
  type ScoringLine,
} from './rulesText';
export { formatDayMonth, formatFinalLine, formatRoundDeadline, formatRoundLine, formatSeasonDates } from './seasonText';
export { competitionPageBlocks, isEnrolledInCompetition, type CompetitionPageBlocks } from './viewerBlocks';
