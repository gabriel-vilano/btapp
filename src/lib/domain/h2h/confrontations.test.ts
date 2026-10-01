import { describe, expect, it } from 'vitest';
import { doubles, friendly, rankingMatch, retiredB, singles, tournamentMatch, win } from '../match-count/matchCount.test-utils';
import { h2hConfrontations } from './confrontations';
import { annulled, dated, h2hTestDomain, playerSide, unitSide } from './h2h.test-utils';
import { orientSides } from './perspective';

// "Confrontos" (docs/HEAD_TO_HEAD.md, HH14) e o que fica fora (HH11, §6.1).

const [x, y] = [singles('x'), singles('y')];
const [xz, yw, xy, zw] = [doubles('x', 'z'), doubles('y', 'w'), doubles('x', 'y'), doubles('z', 'w')];

const matches = [
  dated(rankingMatch(x, y, win(6, 4)), 'r1', '2026-01-10T12:00:00Z'),
  dated(tournamentMatch(y, x, win(6, 3)), 't1', '2026-02-10T12:00:00Z'),
  dated(friendly(xz, yw, retiredB(5, 3)), 'f1', '2026-03-10T12:00:00Z'),
  dated(rankingMatch(x, y, { type: 'wo', winner: 'a' }), 'wo', '2026-04-10T12:00:00Z'),
  dated(rankingMatch(y, x, { type: 'double_wo' }), 'double-wo', '2026-04-11T12:00:00Z'),
  dated(friendly(xy, zw, win(6, 2)), 'same-side', '2026-04-12T12:00:00Z'),
  annulled(dated(rankingMatch(y, x, win(6, 1)), 'annulled', '2026-05-10T12:00:00Z')),
];
const domain = h2hTestDomain([x, y, xz, yw, xy, zw], matches);
const playersView = orientSides([playerSide('x'), playerSide('y')], 'player-x');

describe('h2hConfrontations na página de jogadores', () => {
  const lines = h2hConfrontations(domain, playersView);

  it('só partidas jogadas, da mais recente à mais antiga', () => {
    // W.O., W.O. duplo, a partida anulada e x e y do mesmo lado ficam fora
    expect(lines.map((line) => line.match_id)).toEqual(['f1', 't1', 'r1']);
  });

  it('a desistência conta, com o placar parcial e o tipo', () => {
    expect(lines[0]).toMatchObject({
      outcome: 'win',
      result_type: 'retired',
      perspective: 'winner',
      score: { type: 'retired', completed_sets: [], interrupted_set: { a: 5, b: 3 } },
    });
  });

  it('o resultado e a perspective são do lado esquerdo, mesmo com ele no lado B da partida', () => {
    expect(lines[1]).toMatchObject({ outcome: 'loss', perspective: 'loser', score: { type: 'normal', sets: [{ a: 6, b: 3 }] } });
  });

  it('o contexto diz de onde a partida veio', () => {
    expect(lines.map((line) => line.context)).toEqual([
      { kind: 'friendly' },
      { kind: 'tournament', competition_id: 'comp-tournament-test', category_id: 'cat-tournament-test', stage: 'Final' },
      { kind: 'ranking', competition_id: 'comp-test', category_id: 'cat-test', round_number: 1 },
    ]);
  });

  it('em partida de duplas, os parceiros de cada lado; em simples, nada', () => {
    expect(lines[0].lineup).toEqual({ left_player_ids: ['player-x', 'player-z'], right_player_ids: ['player-y', 'player-w'] });
    expect(lines[1].lineup).toBeNull();
  });

  it('visto do outro lado, o mesmo confronto se lê espelhado', () => {
    const mirrored = h2hConfrontations(domain, orientSides([playerSide('x'), playerSide('y')], 'player-y'));
    expect(mirrored.map((line) => line.outcome)).toEqual(['loss', 'win', 'loss']);
    expect(mirrored[0].lineup).toEqual({ left_player_ids: ['player-y', 'player-w'], right_player_ids: ['player-x', 'player-z'] });
  });
});

describe('h2hConfrontations na página de duplas', () => {
  it('só a dupla exata, sem a linha dos parceiros', () => {
    const view = orientSides([unitSide(xz), unitSide(yw)], 'player-x');
    expect(h2hConfrontations(domain, view)).toEqual([
      expect.objectContaining({ match_id: 'f1', outcome: 'win', lineup: null }),
    ]);
  });

  it('dupla que nunca se enfrentou: lista vazia', () => {
    expect(h2hConfrontations(domain, orientSides([unitSide(xy), unitSide(yw)], 'player-x'))).toEqual([]);
  });
});
