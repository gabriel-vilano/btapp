import { sortAdminPendings, adminPendingCount } from './adminPendings';
import { sortMyCompetitions } from './myCompetitions';
import type { AdminPendingItem, CompetitionsTabData, MyCompetitionItem, PastSeasonItem } from './types';

// O que a aba Competições mostra em cada situação (docs/NAVIGATION.md §6 e
// 9.2). A aba nunca some nem fica desabilitada (N22): sem inscrição ativa,
// ela explica o motivo e leva ao Explorar.

/** Conteúdo abaixo do bloco de admin. */
export type MyCompetitionsContent =
  | { kind: 'list'; items: MyCompetitionItem[] }
  | { kind: 'past_season'; season: PastSeasonItem } // sem inscrição ativa, com temporada passada
  | { kind: 'never_enrolled' }; // jogador novo

export interface CompetitionsTabContent {
  /** Pendências na ordem de exibição. Vazio: o bloco não aparece. */
  adminPendings: AdminPendingItem[];
  myCompetitions: MyCompetitionsContent;
}

function myCompetitionsContent(tab: CompetitionsTabData): MyCompetitionsContent {
  if (tab.competitions.length > 0) return { kind: 'list', items: sortMyCompetitions(tab.competitions) };
  if (tab.last_season !== null) return { kind: 'past_season', season: tab.last_season };
  return { kind: 'never_enrolled' };
}

/**
 * Decide o conteúdo da aba a partir dos dados do jogador.
 * Ex.: `competitionsTabContent(mockCompetitionsTab.admin)`.
 */
export function competitionsTabContent(tab: CompetitionsTabData): CompetitionsTabContent {
  return {
    adminPendings: adminPendingCount(tab) > 0 ? sortAdminPendings(tab.admin_pendings) : [],
    myCompetitions: myCompetitionsContent(tab),
  };
}
