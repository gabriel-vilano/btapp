import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { countTotalMatches } from '../match-count';
import {
  doubles,
  friendly,
  rankingMatch,
  retiredB,
  singles,
  testDomain,
  tournamentMatch,
  win,
} from '../match-count/matchCount.test-utils';
import { playerRecord } from './record';

// Cartel do perfil (docs/PROFILE.md, PF6).

const { players } = mockEntities;

describe('playerRecord: mocks do domínio', () => {
  it('Lucas: ranking, torneio e amistosos, com a derrota da r2-1', () => {
    // Vitórias: r1-1, r1-6, r2-3, semifinal do torneio e os dois amistosos
    expect(playerRecord(mockDomain, players.lucas.id)).toEqual({ matches: 7, wins: 6, losses: 1 });
  });

  it.each(mockDomain.players.map((player) => [player.username, player.id]))(
    '%s: jogos = total_matches (R18) e vitórias + derrotas = jogos',
    (_username, playerId) => {
      const record = playerRecord(mockDomain, playerId);
      expect(record.matches).toBe(countTotalMatches(mockDomain, playerId));
      expect(record.wins + record.losses).toBe(record.matches);
    },
  );
});

describe('playerRecord: regras (PF6)', () => {
  const [x, y] = [singles('x'), singles('y')];
  const [xz, yw] = [doubles('x', 'z'), doubles('y', 'w')];
  const units = [x, y, xz, yw];

  it('perfil sem partidas: cartel zerado', () => {
    expect(playerRecord(testDomain(units, []), 'player-x')).toEqual({ matches: 0, wins: 0, losses: 0 });
  });

  it('soma ranking, torneio e amistoso, em simples e duplas', () => {
    const matches = [rankingMatch(x, y, win(6, 4)), tournamentMatch(yw, xz, win(6, 2)), friendly(xz, yw, win(6, 3))];
    expect(playerRecord(testDomain(units, matches), 'player-x')).toEqual({ matches: 3, wins: 2, losses: 1 });
  });

  it('W.O. e W.O. duplo ficam fora, dos dois lados', () => {
    const matches = [rankingMatch(x, y, { type: 'wo', winner: 'a' }), rankingMatch(xz, yw, { type: 'double_wo' })];
    const domain = testDomain(units, matches);
    expect(playerRecord(domain, 'player-x').matches).toBe(0);
    expect(playerRecord(domain, 'player-y').matches).toBe(0);
  });

  it('desistência conta: vitória de quem ficou, derrota de quem desistiu', () => {
    const domain = testDomain(units, [rankingMatch(x, y, retiredB(4, 2))]);
    expect(playerRecord(domain, 'player-x')).toEqual({ matches: 1, wins: 1, losses: 0 });
    expect(playerRecord(domain, 'player-y')).toEqual({ matches: 1, wins: 0, losses: 1 });
  });

  it('amistoso pendente, descartado ou cancelado fica fora', () => {
    const matches = (['awaiting_confirmation', 'discarded', 'cancelled'] as const).map((status) =>
      friendly(x, y, win(6, 1), status),
    );
    expect(playerRecord(testDomain(units, matches), 'player-x').matches).toBe(0);
  });
});
