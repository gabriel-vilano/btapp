import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
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
import { recentMatches } from './recentMatches';

// "Partidas recentes" do perfil (docs/PROFILE.md, PF18).

const { players } = mockEntities;

describe('recentMatches', () => {
  const [xz, yw, x, y] = [doubles('x', 'z'), doubles('y', 'w'), singles('x'), singles('y')];

  it('lê do lado do dono do perfil: lado, resultado e adversários', () => {
    const domain = testDomain([xz, yw], [rankingMatch(yw, xz, win(6, 4))]);
    const [row] = recentMatches(domain, 'player-x');
    expect([row.side, row.result.type, row.opponent_ids]).toEqual(['b', 'normal', ['player-y', 'player-w']]);
  });

  it('entra ranking, torneio e amistoso, e a desistência também', () => {
    const matches = [rankingMatch(xz, yw, win(6, 2)), tournamentMatch(xz, yw, win(6, 3)), friendly(x, y, retiredB(3, 1))];
    const rows = recentMatches(testDomain([xz, yw, x, y], matches), 'player-x');
    expect(rows.map((row) => row.kind).sort()).toEqual(['friendly', 'ranking', 'tournament']);
  });

  it('o amistoso não tem competição nem categoria', () => {
    const [row] = recentMatches(testDomain([x, y], [friendly(x, y, win(6, 1))]), 'player-y');
    expect([row.competition_id, row.category_id]).toEqual([null, null]);
  });

  it('W.O. vencido aparece; W.O. em que o jogador não compareceu e W.O. duplo não (PF6)', () => {
    const won = rankingMatch(xz, yw, { type: 'wo', winner: 'a' });
    const double = { ...rankingMatch(xz, yw, { type: 'double_wo' }), id: 'match-double' };
    const domain = testDomain([xz, yw], [won, double]);
    expect(recentMatches(domain, 'player-x').map((row) => row.match_id)).toEqual([won.id]);
    expect(recentMatches(domain, 'player-y')).toEqual([]);
  });

  it('só partidas confirmadas: pendente, descartado e cancelado ficam fora', () => {
    const matches = (['awaiting_confirmation', 'discarded', 'cancelled'] as const).map((s) => friendly(x, y, win(6, 0), s));
    expect(recentMatches(testDomain([x, y], matches), 'player-x')).toEqual([]);
  });

  it('jogador sem partida: lista vazia', () => {
    expect(recentMatches(mockDomain, players.marina.id)).toEqual([]);
  });

  it('a mais recente primeiro, no máximo 5 (mocks do domínio)', () => {
    const rows = recentMatches(mockDomain, players.lucas.id);
    const dates = rows.map((row) => Date.parse(row.played_at));
    expect(rows).toHaveLength(5);
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it('respeita o limite pedido', () => {
    expect(recentMatches(mockDomain, players.lucas.id, 2)).toHaveLength(2);
  });
});
