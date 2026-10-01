import { describe, expect, it } from 'vitest';
import type { RankingMatch } from '@/src/types/domain';
import { roundDrawMarks } from './drawMarks';
import { definedMatch, round } from './roundDrawScenario.test-utils';

// Marcas do resultado (SR10, SR11), com partidas montadas à mão.

const second = round(2, '2026-09-28T13:00:00.000Z', '2026-10-12T02:59:00.000Z');
const third = round(3, '2026-10-12T13:00:00.000Z', '2026-10-27T02:59:00.000Z');
const fourth = round(4, '2026-10-27T13:00:00.000Z', '2026-11-10T02:59:00.000Z');

function match(id: string, roundOf: typeof third, sides: readonly [string, string], categoryId = 'cat'): RankingMatch {
  return definedMatch({ id, categoryId, roundId: roundOf.id, sides, createdAt: roundOf.starts_at });
}

function cancelled(base: RankingMatch): RankingMatch {
  return { ...base, status: 'cancelled', reason: 'not_played', cancellation: { admin_id: 'player-ana', acted_at: second.deadline } };
}

// Rodada 3: quatro duplas, cada uma com 2 jogos.
const thirdRound = [
  match('r3-1', third, ['u1', 'u2']),
  match('r3-2', third, ['u2', 'u3']),
  match('r3-3', third, ['u3', 'u4']),
  match('r3-4', third, ['u4', 'u1']),
];

describe('roundDrawMarks: confronto repetido', () => {
  it('marca o confronto que já aconteceu numa rodada anterior, em qualquer ordem dos lados', () => {
    const history = [match('r2-1', second, ['u2', 'u1'])];
    const [marks] = roundDrawMarks(third.id, [...history, ...thirdRound]);
    expect(marks.repeated_match_ids).toEqual(['r3-1']);
  });

  it('a partida cancelada não conta como confronto (R30)', () => {
    const history = [cancelled(match('r2-1', second, ['u1', 'u2']))];
    expect(roundDrawMarks(third.id, [...history, ...thirdRound])[0].repeated_match_ids).toEqual([]);
  });

  it('o resultado reaberto depois ignora as rodadas sorteadas depois', () => {
    const later = [match('r4-1', fourth, ['u1', 'u2'])];
    expect(roundDrawMarks(third.id, [...thirdRound, ...later])[0].repeated_match_ids).toEqual([]);
  });

  it('confronto de outra categoria não conta', () => {
    const history = [match('r2-1', second, ['u1', 'u2'], 'outra')];
    expect(roundDrawMarks(third.id, [...history, ...thirdRound])[0].repeated_match_ids).toEqual([]);
  });
});

describe('roundDrawMarks: dupla com jogo a menos', () => {
  it('sem vaga ímpar, ninguém fica marcado', () => {
    expect(roundDrawMarks(third.id, thirdRound)[0].short_units).toEqual([]);
  });

  it('marca a dupla com menos jogos que as outras: 5 duplas × 3 jogos é ímpar', () => {
    const pairs: [string, string][] = [['u1', 'u2'], ['u1', 'u3'], ['u1', 'u4'], ['u2', 'u3'], ['u2', 'u5'], ['u3', 'u4'], ['u4', 'u5']];
    const odd = pairs.map((sides, i) => match(`r3-${i + 1}`, third, sides));
    expect(roundDrawMarks(third.id, odd)[0].short_units).toEqual([{ enrollment_id: 'u5', games: 2 }]);
  });
});

describe('roundDrawMarks: a rodada', () => {
  it('agrupa por categoria e ignora partidas de outras rodadas', () => {
    const other = [match('x-1', third, ['x1', 'x2'], 'outra'), match('r2-9', second, ['u1', 'u3'])];
    const marks = roundDrawMarks(third.id, [...thirdRound, ...other]);
    expect(marks.map((m) => m.category_id)).toEqual(['cat', 'outra']);
  });

  it('rodada sem partidas não tem marca', () => {
    expect(roundDrawMarks(fourth.id, thirdRound)).toEqual([]);
  });
});
