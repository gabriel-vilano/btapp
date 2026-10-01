import { describe, expect, it } from 'vitest';
import { drawSeasonRound, type SeasonRoundDrawInput } from './drawSeasonRound';
import { RoundDrawError } from './drawRound';
import { summarizeRoundDraw } from './drawSummary';
import { gamesPerUnit } from './roundDraw.test-utils';
import { createSeededRandom } from './seededRandom';
import {
  ADMIN_ID,
  NOW,
  category,
  definedMatch,
  enrollments,
  idSequence,
  ranking,
  round,
  season,
} from './roundDrawScenario.test-utils';

// Sorteio da rodada inteira (SR4): o exemplo da tela de confirmação, com 3
// jogos por rodada. Masculino B com 6 duplas, Feminino C com 5, Mista C 40+
// com 3 e Masculino A com 1, que não entra.

const third = round(3, NOW.toISOString(), '2026-10-27T02:59:00.000Z');
const categories = [category('masc-b'), category('fem-c'), category('mista-c40'), category('masc-a')];
const allEnrollments = [
  ...enrollments('masc-b', 6),
  ...enrollments('fem-c', 5),
  ...enrollments('mista-c40', 3),
  ...enrollments('masc-a', 1),
];

function input(overrides: Partial<SeasonRoundDrawInput> = {}): SeasonRoundDrawInput {
  return {
    ranking,
    round: third,
    categories,
    enrollments: allEnrollments,
    seasonMatches: [],
    drawnBy: ADMIN_ID,
    drawnAt: NOW.toISOString(),
    random: createSeededRandom(7),
    createMatchId: idSequence(),
    ...overrides,
  };
}

describe('drawSeasonRound: todas as categorias de uma vez (SR4)', () => {
  it('sorteia cada categoria que entra, na mesma rodada, com quem sorteou e quando (R51)', () => {
    const draw = drawSeasonRound(input());
    expect(draw.round_id).toBe(third.id);
    expect(draw.drawn.map((c) => [c.category_id, c.matches.length])).toEqual([
      ['masc-b', 9],
      ['fem-c', 7],
      ['mista-c40', 3],
    ]);
    for (const match of draw.drawn.flatMap((c) => c.matches)) {
      expect(match).toMatchObject({ round_id: third.id, drawn_by: ADMIN_ID, created_at: NOW.toISOString(), status: 'defined' });
    }
  });

  it('deixa de fora a categoria com menos de 2 duplas sem impedir as outras (SR7)', () => {
    expect(drawSeasonRound(input()).skipped).toEqual([{ category_id: 'masc-a', reason: 'not_enough_units' }]);
  });

  it('entrega o que o resumo da confirmação prometeu, em qualquer semente', () => {
    const summary = summarizeRoundDraw({ ranking, season_id: season.id, categories, enrollments: allEnrollments });
    for (let seed = 1; seed <= 10; seed++) {
      const draw = drawSeasonRound(input({ random: createSeededRandom(seed) }));
      for (const drawn of draw.drawn) {
        const promised = summary.categories.find((c) => c.category_id === drawn.category_id);
        expect(drawn.matches).toHaveLength(promised?.total_matches ?? -1);
      }
    }
  });

  it('com 5 duplas e 3 jogos, uma dupla fica com 2 jogos', () => {
    const femC = drawSeasonRound(input()).drawn.find((c) => c.category_id === 'fem-c');
    const games = [...gamesPerUnit(femC?.matches.map((m) => [m.side_a_enrollment_id, m.side_b_enrollment_id]) ?? []).values()];
    expect(games.sort()).toEqual([2, 3, 3, 3, 3]);
  });
});

describe('drawSeasonRound: tudo ou nada (SR9)', () => {
  it('uma categoria já sorteada na rodada derruba o sorteio inteiro', () => {
    const existing = definedMatch({
      id: 'match-antiga',
      categoryId: 'fem-c',
      roundId: third.id,
      sides: ['fem-c-u1', 'fem-c-u2'],
      createdAt: NOW.toISOString(),
    });
    const call = () => drawSeasonRound(input({ seasonMatches: [existing] }));
    expect(call).toThrow(expect.objectContaining({ code: 'already_drawn' }));
  });

  it('categoria de outra competição derruba o sorteio inteiro', () => {
    const call = () => drawSeasonRound(input({ categories: [...categories, category('torneio-x', 'comp-torneio')] }));
    expect(call).toThrow(expect.objectContaining({ code: 'category_mismatch' }));
  });

  it('recusa quando nenhuma categoria entra, com as categorias recebidas na mensagem', () => {
    const call = () => drawSeasonRound(input({ categories: [category('masc-a')] }));
    expect(call).toThrow(RoundDrawError);
    expect(call).toThrow(expect.objectContaining({ code: 'nothing_to_draw' }));
    expect(call).toThrow(/recebi \[masc-a\]/);
  });
});
