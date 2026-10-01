import { describe, expect, it } from 'vitest';
import { h2hFriendlies } from './h2h';
import { mockDomain, mockH2HDomain } from './index';

// O cenário do H2H soma amistosos ao do perfil sem quebrar a integridade, e
// sem vazar para o `mockDomain` (as contagens do feed e do perfil não mudam).

describe('mockH2HDomain', () => {
  it.each(['units', 'matches'] as const)('%s não repete id', (table) => {
    const ids = mockH2HDomain[table].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo amistoso aponta para unidades e jogadores que existem', () => {
    const unitIds = new Set(mockH2HDomain.units.map((unit) => unit.id));
    const playerIds = new Set(mockH2HDomain.players.map((player) => player.id));
    for (const match of h2hFriendlies) {
      expect(unitIds.has(match.side_a_unit_id) && unitIds.has(match.side_b_unit_id), match.id).toBe(true);
    }
    for (const unit of mockH2HDomain.units) expect(unit.player_ids.every((id) => playerIds.has(id)), unit.id).toBe(true);
  });

  it('nenhuma dupla nova repete um par que já existe (R2)', () => {
    const pairs = mockH2HDomain.units.map((unit) => [...unit.player_ids].sort().join('|'));
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it('o mockDomain fica sem os amistosos do H2H', () => {
    const ids = new Set(mockDomain.matches.map((match) => match.id));
    expect(h2hFriendlies.some((match) => ids.has(match.id))).toBe(false);
  });
});
