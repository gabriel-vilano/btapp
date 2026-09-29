import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { playerHeadToHead, unitHeadToHead } from './headToHead';
import { doubles, friendly, rankingMatch, singles, testDomain, tournamentMatch, win } from './matchCount.test-utils';

// H2H (docs/DOMAIN.md, R19): no card, a dupla exata; na página, jogador × jogador.

const { players, units } = mockEntities;

describe('unitHeadToHead: dupla exata, para o card', () => {
  it('mocks: Lucas e Rafael × Pedro e Thiago se enfrentaram 2 vezes', () => {
    // r1-1 do ranking e o amistoso contam; a r3-4 ainda aguarda confirmação
    expect(unitHeadToHead(mockDomain, units.lucasRafael.id, units.pedroThiago.id)).toEqual({
      match_ids: ['match-arena-rm-mb-r1-1', 'match-friendly-lucas-rafael-pedro-thiago'],
      wins: 2,
      losses: 0,
    });
  });

  it('o resultado é do ponto de vista do primeiro lado pedido', () => {
    const record = unitHeadToHead(mockDomain, units.pedroThiago.id, units.lucasRafael.id);
    expect([record.wins, record.losses]).toEqual([0, 2]);
  });

  it('mocks: W.O. não é confronto', () => {
    // André e Bruno × Caio e Diego só têm a r1-3, W.O.
    expect(unitHeadToHead(mockDomain, units.andreBruno.id, units.caioDiego.id).match_ids).toEqual([]);
  });

  it('não conta o mesmo jogador com outro parceiro', () => {
    const [xz, xv, yw] = [doubles('x', 'z'), doubles('x', 'v'), doubles('y', 'w')];
    const domain = testDomain([xz, xv, yw], [rankingMatch(xz, yw, win(6, 4)), friendly(xv, yw, win(6, 2))]);
    expect(unitHeadToHead(domain, xz.id, yw.id).match_ids).toHaveLength(1);
  });

  it('soma ranking, torneio e amistoso, e tira W.O. e W.O. duplo', () => {
    const [x, y] = [singles('x'), singles('y')];
    const matches = [
      rankingMatch(x, y, win(6, 4)),
      tournamentMatch(y, x, win(6, 3)),
      friendly(x, y, win(6, 1)),
      rankingMatch(x, y, { type: 'wo', winner: 'a' }),
      rankingMatch(y, x, { type: 'double_wo' }),
    ];
    const record = unitHeadToHead(testDomain([x, y], matches), x.id, y.id);
    expect([record.match_ids.length, record.wins, record.losses]).toEqual([3, 2, 1]);
  });

  it('falha com a mesma unidade nos dois lados', () => {
    expect(() => unitHeadToHead(mockDomain, units.lucas.id, units.lucas.id)).toThrow("mesmo unidade 'unit-lucas'");
  });
});

describe('playerHeadToHead: jogador × jogador, para a página', () => {
  it('mocks: Lucas × Thiago soma simples e duplas', () => {
    // r1-1 e amistoso em duplas, e o amistoso de simples com a desistência do Thiago
    expect(playerHeadToHead(mockDomain, players.lucas.id, players.thiago.id)).toEqual({
      match_ids: [
        'match-arena-rm-mb-r1-1',
        'match-friendly-lucas-rafael-pedro-thiago',
        'match-friendly-lucas-thiago',
      ],
      wins: 3,
      losses: 0,
    });
  });

  it('parceiros do mesmo lado não se enfrentaram', () => {
    expect(playerHeadToHead(mockDomain, players.lucas.id, players.rafael.id).match_ids).toEqual([]);
  });

  it('mocks: W.O. não é confronto', () => {
    expect(playerHeadToHead(mockDomain, players.andre.id, players.caio.id).match_ids).toEqual([]);
  });

  it('conta o confronto com qualquer parceiro', () => {
    const [xz, xv, yw] = [doubles('x', 'z'), doubles('x', 'v'), doubles('y', 'w')];
    const domain = testDomain([xz, xv, yw], [rankingMatch(xz, yw, win(6, 4)), friendly(yw, xv, win(6, 2))]);
    expect(playerHeadToHead(domain, 'player-x', 'player-y')).toMatchObject({ wins: 1, losses: 1 });
  });

  it('falha com o mesmo jogador nos dois lados', () => {
    expect(() => playerHeadToHead(mockDomain, 'player-x', 'player-x')).toThrow("mesmo jogador 'player-x'");
  });
});
