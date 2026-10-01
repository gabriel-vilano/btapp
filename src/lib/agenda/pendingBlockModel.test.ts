import { describe, expect, it } from 'vitest';
import { MOCK_AGENDA_LINKS } from '@/src/mocks/agendaViewer';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { playerAgenda } from '@/src/lib/domain/agenda';
import { agendaViewModel } from './agendaViewModel';
import { limitPendingItems, pendingBlockModel, PENDING_BLOCK_LIMIT } from './pendingBlockModel';

const { players } = mockEntities;
const NOW = new Date().toISOString();

describe('limitPendingItems', () => {
  it('mostra até 3 itens e guarda o total para o "Ver todas"', () => {
    expect(limitPendingItems(['a', 'b', 'c', 'd', 'e'])).toEqual({ items: ['a', 'b', 'c'], total: 5 });
  });

  it('com 3 ou menos, mostra todos', () => {
    expect(limitPendingItems(['a', 'b', 'c'])).toEqual({ items: ['a', 'b', 'c'], total: 3 });
    expect(limitPendingItems(['a'])).toEqual({ items: ['a'], total: 1 });
  });

  it('sem pendência, fica vazio', () => {
    expect(limitPendingItems([])).toEqual({ items: [], total: 0 });
  });

  it('o limite é o da N20', () => {
    expect(PENDING_BLOCK_LIMIT).toBe(3);
  });
});

describe('pendingBlockModel', () => {
  // N20: o bloco é a seção "Sua vez" da aba Jogos, não uma lista paralela
  it('mesmos itens e mesma ordem de "Sua vez" na aba Jogos', () => {
    const viewer = { playerId: players.lucas.id, now: NOW };
    const block = pendingBlockModel(mockDomain, viewer);
    const yourTurn = agendaViewModel(mockDomain, viewer, MOCK_AGENDA_LINKS).yourTurn;
    expect(block.total).toBe(yourTurn.length);
    expect(block.items).toEqual(yourTurn.slice(0, PENDING_BLOCK_LIMIT));
    expect(block.items.length).toBeGreaterThan(0);
    expect(block.items.every((item) => item.action !== null)).toBe(true);
  });

  it('jogador sem pendência: bloco vazio', () => {
    const idle = mockDomain.players.find(
      (player) => playerAgenda(mockDomain, { playerId: player.id, now: NOW }).your_turn.length === 0,
    );
    expect(idle).toBeDefined();
    if (idle === undefined) return;
    expect(pendingBlockModel(mockDomain, { playerId: idle.id, now: NOW })).toEqual({ items: [], total: 0 });
  });
});
