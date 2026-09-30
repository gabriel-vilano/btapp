// Agenda do jogador (docs/NAVIGATION.md §5): onde cada partida aparece, em
// que ordem e por que a aba está vazia. Funções puras: recebem as tabelas e
// o "agora" e devolvem a seção e a situação de cada partida, sem texto, que
// é da tela (`src/lib/agenda/`). A aba Jogos, o bloco "Sua vez" do feed (N20)
// e o badge da aba (N3) leem daqui.

export type { AgendaDomain, AgendaViewer } from './agendaDomain';
export {
  AGENDA_SECTION_ORDER,
  friendlyAgendaEntry,
  rankingAgendaEntry,
  tournamentAgendaEntry,
  type AgendaEntry,
  type AgendaSectionKey,
  type AgendaSituation,
  type AgendaSituationKind,
  type FriendlyEntryContext,
  type RankingEntryContext,
} from './agendaEntry';
export { deadlineOf, hasOpenEntries, playerAgenda, yourTurnCount, type PlayerAgenda } from './playerAgenda';
export { agendaEmptyReason, type AgendaEmptyReason } from './emptyReason';
