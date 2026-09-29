// Marcação do confronto (docs/SCHEDULING.md §3 e §4). Cada ação é uma função
// pura: recebe o histórico da marcação e devolve o histórico novo, ou lança
// ScheduleError quando a ação não vale no confronto ou para quem age.

export { ScheduleError, type ScheduleErrorCode } from './scheduleError';
export type { ScheduleActor, ScheduleContext, ScheduleSides } from './guards';
export {
  agreedScheduleOf,
  expireProposals,
  isOptionOpen,
  pendingProposalOf,
  type AgreedSchedule,
  type AgreedScheduleSource,
} from './history';
export {
  acceptScheduleOption,
  closeScheduleOnMatchExit,
  proposeSchedule,
  reportScheduleDate,
  withdrawScheduleProposal,
  type ReportedScheduleDateDraft,
  type ScheduleProposalDraft,
} from './transitions';
export { scheduleSummaryOf, type ScheduleSideSummary, type ScheduleSummary } from './summary';
