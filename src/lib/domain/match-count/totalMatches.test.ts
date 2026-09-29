import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { countTotalMatches } from './totalMatches';
import {
  doubles,
  friendly,
  rankingMatch,
  retiredB,
  singles,
  testDomain,
  tournamentMatch,
  win,
} from './matchCount.test-utils';

// `total_matches` (docs/DOMAIN.md, R18).

const { players } = mockEntities;

describe('countTotalMatches: mocks do domínio', () => {
  // O `Player.total_matches` dos mocks inclui o histórico do legado: por isso
  // o esperado é contado à mão nas partidas, e não comparado com o campo.
  it('soma ranking, torneio e amistoso, em simples e duplas', () => {
    // Ranking r1-1, r1-6, r2-1, r2-3; semifinal do torneio; amistoso de
    // duplas e o de simples, que terminou em desistência
    expect(countTotalMatches(mockDomain, players.lucas.id)).toBe(7);
  });

  it('deixa de fora o W.O. e as partidas ainda não confirmadas', () => {
    // O André venceu a r1-3 por W.O.: contam r1-2, r2-1, r2-2 e a semifinal
    expect(countTotalMatches(mockDomain, players.andre.id)).toBe(4);
  });

  it('conta a desistência, porque houve jogo', () => {
    // O Caio só jogou a r1-4, em que se lesionou; a r1-3 foi W.O. contra ele
    expect(countTotalMatches(mockDomain, players.caio.id)).toBe(1);
  });
});

describe('countTotalMatches: regras (R18)', () => {
  const [x, y] = [singles('x'), singles('y')];
  const [xz, yw] = [doubles('x', 'z'), doubles('y', 'w')];
  const units = [x, y, xz, yw];

  it('conta simples e duplas, ranking, torneio e amistoso confirmados', () => {
    const matches = [rankingMatch(x, y, win(6, 4)), tournamentMatch(xz, yw, win(6, 2)), friendly(x, y, win(6, 3))];
    expect(countTotalMatches(testDomain(units, matches), 'player-x')).toBe(3);
    expect(countTotalMatches(testDomain(units, matches), 'player-z')).toBe(1);
  });

  it('não conta W.O. nem W.O. duplo, dos dois lados', () => {
    const matches = [rankingMatch(x, y, { type: 'wo', winner: 'a' }), rankingMatch(xz, yw, { type: 'double_wo' })];
    expect(countTotalMatches(testDomain(units, matches), 'player-x')).toBe(0);
    expect(countTotalMatches(testDomain(units, matches), 'player-y')).toBe(0);
  });

  it('conta a desistência para quem desistiu e para o vencedor', () => {
    const matches = [rankingMatch(x, y, retiredB(3, 1)), friendly(xz, yw, retiredB(3, 1))];
    expect(countTotalMatches(testDomain(units, matches), 'player-x')).toBe(2);
    expect(countTotalMatches(testDomain(units, matches), 'player-w')).toBe(1);
  });

  it('não conta amistoso pendente, descartado nem cancelado (R43)', () => {
    const statuses = ['awaiting_confirmation', 'discarded', 'cancelled'] as const;
    const matches = statuses.map((status) => friendly(x, y, win(6, 1), status));
    expect(countTotalMatches(testDomain(units, matches), 'player-x')).toBe(0);
  });

  it('não conta partida de competição que não foi confirmada', () => {
    const pending = { ...rankingMatch(x, y, win(6, 4)), status: 'defined' as const };
    expect(countTotalMatches(testDomain(units, [pending]), 'player-x')).toBe(0);
  });

  it('falha com a unidade que não existe nas tabelas', () => {
    const domain = { ...testDomain([x], [friendly(x, y, win(6, 4))]), enrollments: [] };
    expect(() => countTotalMatches(domain, 'player-x')).toThrow("unidade 'unit-y' não existe");
  });
});
