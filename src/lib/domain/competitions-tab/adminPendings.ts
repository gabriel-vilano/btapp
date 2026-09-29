import type { AdminPendingItem, CompetitionsTabData } from './types';

// Bloco "Pendências de admin" (docs/NAVIGATION.md, N30) e o número do badge
// da aba Competições (N3). O badge e o bloco contam a mesma lista: os três
// tipos de pendência entram nos dois.

/**
 * Número do badge da aba Competições. Zero quando não há o que mostrar,
 * inclusive para quem não é admin: aí a aba fica sem badge.
 * Ex.: `adminPendingCount(tab)` → `3`.
 */
export function adminPendingCount(tab: Pick<CompetitionsTabData, 'is_admin' | 'admin_pendings'>): number {
  return tab.is_admin ? tab.admin_pendings.length : 0;
}

/** A mais antiga primeiro: é a que está há mais tempo esperando a decisão. */
export function sortAdminPendings(pendings: AdminPendingItem[]): AdminPendingItem[] {
  return [...pendings].sort((x, y) => Date.parse(x.since) - Date.parse(y.since) || x.id.localeCompare(y.id));
}
