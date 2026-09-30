import type { Competition, ReportedScheduleDate, ScheduleHistory, ScheduleProposal } from '@/src/types/domain';
import type { ProfileDomain } from '../profile';

// De onde a agenda sai (docs/NAVIGATION.md §5): as tabelas do domínio, no
// formato em que o Supabase as devolve. O `mockDomain` satisfaz esse contrato.

/**
 * Tabelas que a agenda lê. Estende as do perfil porque o vazio "Temporada
 * encerrada" mostra a posição final da dupla (9.2), que é a da seção
 * "Temporadas" do perfil (PF19).
 */
export interface AgendaDomain extends ProfileDomain {
  competitions: Competition[];
  scheduleProposals: ScheduleProposal[];
  reportedScheduleDates: ReportedScheduleDate[];
}

/** De quem é a agenda e em que momento. O "agora" vem de fora, como nas transições. */
export interface AgendaViewer {
  playerId: string;
  now: string; // ISO 8601
}

export function findById<T extends { id: string }>(items: T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Agenda: ${what} '${id}' não existe nas tabelas do domínio`);
  return found;
}

/** Histórico da marcação do confronto: propostas e datas informadas dele (M16). */
export function scheduleHistoryFor(domain: AgendaDomain, matchId: string): ScheduleHistory {
  return {
    match_id: matchId,
    proposals: domain.scheduleProposals.filter((proposal) => proposal.match_id === matchId),
    reported_dates: domain.reportedScheduleDates.filter((reported) => reported.match_id === matchId),
  };
}
