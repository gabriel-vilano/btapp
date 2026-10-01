import { describe, expect, it } from 'vitest';
import { mockEntities, mockH2HDomain } from '@/src/mocks/domain';
import { doubles, friendly, singles, win } from '../match-count/matchCount.test-utils';
import { h2hCrossPairs } from './crossPairs';
import { h2hTestDomain, playerSide, unitSide } from './h2h.test-utils';
import { orientSides } from './perspective';

// "Jogador contra jogador" (docs/HEAD_TO_HEAD.md, HH2 e §4.6).

const { units, players } = mockEntities;
const doublesSides = [unitSide(units.lucasRafael), unitSide(units.pedroThiago)] as const;

describe('h2hCrossPairs', () => {
  it('mocks: os 4 pares, com números diferentes dos da dupla (3 × 1)', () => {
    const view = orientSides([...doublesSides], players.marina.id);
    expect(h2hCrossPairs(mockH2HDomain, view, players.marina.id)).toEqual([
      { left_player_id: players.lucas.id, right_player_id: players.pedro.id, left_wins: 3, right_wins: 2 },
      { left_player_id: players.lucas.id, right_player_id: players.thiago.id, left_wins: 4, right_wins: 1 },
      { left_player_id: players.rafael.id, right_player_id: players.pedro.id, left_wins: 3, right_wins: 2 },
      { left_player_id: players.rafael.id, right_player_id: players.thiago.id, left_wins: 3, right_wins: 1 },
    ]);
  });

  it('os pares de quem vê vêm primeiro, lidos do lado dele', () => {
    const view = orientSides([...doublesSides], players.thiago.id);
    const pairs = h2hCrossPairs(mockH2HDomain, view, players.thiago.id);
    expect(pairs.map((pair) => [pair.left_player_id, pair.right_player_id])).toEqual([
      [players.thiago.id, players.lucas.id],
      [players.thiago.id, players.rafael.id],
      [players.pedro.id, players.lucas.id],
      [players.pedro.id, players.rafael.id],
    ]);
    expect(pairs[0]).toMatchObject({ left_wins: 1, right_wins: 4 });
  });

  it('par sem confronto não aparece; sem nenhum, a lista vem vazia', () => {
    const [xz, yw, zv, x, y] = [doubles('x', 'z'), doubles('y', 'w'), doubles('z', 'v'), singles('x'), singles('y')];
    // Só x e y se enfrentaram, em simples; z e w nunca
    const domain = h2hTestDomain([xz, yw, zv, x, y], [friendly(x, y, win(6, 4))]);
    const view = orientSides([unitSide(xz), unitSide(yw)], 'player-x');
    expect(h2hCrossPairs(domain, view, 'player-x')).toEqual([
      { left_player_id: 'player-x', right_player_id: 'player-y', left_wins: 1, right_wins: 0 },
    ]);
    expect(h2hCrossPairs(domain, orientSides([unitSide(zv), unitSide(yw)], 'player-z'), 'player-z')).toEqual([]);
  });

  it('na página de jogadores não existe (HH3)', () => {
    const view = orientSides([playerSide('lucas'), playerSide('pedro')], players.lucas.id);
    expect(h2hCrossPairs(mockH2HDomain, view, players.lucas.id)).toEqual([]);
  });
});
