import { playerAgenda, type AgendaViewer } from '@/src/lib/domain/agenda';
import { agendaItemModel, type AgendaItemModel, type AgendaScreenDomain } from './agendaItemModel';

// O bloco "Sua vez" do feed (docs/NAVIGATION.md N20) é a seção "Sua vez" da
// aba Jogos, cortada: mesma fonte, mesma ordem e o mesmo item. Por isso ele lê
// da mesma derivação (`playerAgenda`) e do mesmo modelo (`agendaItemModel`), e
// não tem regra própria do que é pendência.

/** Quantos itens o bloco mostra antes do "Ver todas em Jogos (N)". */
export const PENDING_BLOCK_LIMIT = 3;

export interface PendingBlockModel {
  /** Os primeiros itens de "Sua vez", até o limite. */
  items: AgendaItemModel[];
  /** Todas as pendências: o N de "Ver todas em Jogos (N)". */
  total: number;
}

/**
 * Corta a lista de "Sua vez" no limite do bloco, guardando o total.
 * @example limitPendingItems(playerAgenda(domain, viewer).your_turn)
 */
export function limitPendingItems<T>(yourTurn: T[]): { items: T[]; total: number } {
  return { items: yourTurn.slice(0, PENDING_BLOCK_LIMIT), total: yourTurn.length };
}

/**
 * Props do bloco "Sua vez" do feed para o jogador, no momento pedido.
 * @example pendingBlockModel(mockDomain, { playerId: players.lucas.id, now: new Date().toISOString() })
 */
export function pendingBlockModel(domain: AgendaScreenDomain, viewer: AgendaViewer): PendingBlockModel {
  const { items, total } = limitPendingItems(playerAgenda(domain, viewer).your_turn);
  return { items: items.map((entry) => agendaItemModel(domain, entry, viewer.now)), total };
}
