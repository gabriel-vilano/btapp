import { describe, expect, it } from 'vitest';
import { doubles, friendly, rankingMatch, singles, win } from '../match-count/matchCount.test-utils';
import { h2hForm } from './form';
import { dated, h2hTestDomain, playerSide, unitSide } from './h2h.test-utils';

// Forma recente (docs/HEAD_TO_HEAD.md, HH12).

const [x, y] = [singles('x'), singles('y')];
const [xz, xv, yw] = [doubles('x', 'z'), doubles('x', 'v'), doubles('y', 'w')];

function day(n: number): string {
  return new Date(Date.UTC(2026, 0, n, 12)).toISOString();
}

describe('h2hForm', () => {
  it('as 5 últimas, da mais antiga para a mais recente, contra qualquer adversário', () => {
    const matches = [
      dated(rankingMatch(x, y, win(6, 1)), 'm1', day(1)),
      dated(rankingMatch(y, x, win(6, 2)), 'm2', day(2)),
      dated(friendly(x, y, win(6, 3)), 'm3', day(3)),
      dated(friendly(xz, yw, win(6, 4)), 'm4', day(4)),
      dated(friendly(yw, xv, win(6, 3)), 'm5', day(5)),
      dated(friendly(xv, yw, win(7, 5)), 'm6', day(6)),
    ];
    const domain = h2hTestDomain([x, y, xz, xv, yw], matches);
    // A mais antiga (m1, vitória) sai: ficam m2 a m6
    expect(h2hForm(domain, playerSide('x'))).toEqual(['loss', 'win', 'win', 'loss', 'win']);
  });

  it('na página de duplas, só as partidas da dupla exata', () => {
    const matches = [dated(friendly(xz, yw, win(6, 4)), 'm1', day(1)), dated(friendly(yw, xv, win(6, 3)), 'm2', day(2))];
    const domain = h2hTestDomain([xz, xv, yw], matches);
    expect(h2hForm(domain, unitSide(xz))).toEqual(['win']);
    expect(h2hForm(domain, unitSide(yw))).toEqual(['loss', 'win']);
  });

  it('W.O. não é partida jogada', () => {
    const matches = [
      dated(rankingMatch(x, y, { type: 'wo', winner: 'a' }), 'wo', day(1)),
      dated(rankingMatch(y, x, { type: 'double_wo' }), 'double-wo', day(2)),
    ];
    expect(h2hForm(h2hTestDomain([x, y], matches), playerSide('x'))).toEqual([]);
  });

  it('com menos de 5, as que houver; sem nenhuma, vazia', () => {
    const domain = h2hTestDomain([x, y, xz], [dated(rankingMatch(x, y, win(6, 4)), 'm1', day(1))]);
    expect(h2hForm(domain, playerSide('y'))).toEqual(['loss']);
    expect(h2hForm(domain, unitSide(xz))).toEqual([]);
  });
});
