import { describe, expect, it } from 'vitest';
import { summarizeRoundDraw, type RoundDrawSummaryInput } from './drawSummary';
import { category, enrollments, ranking, season } from './roundDrawScenario.test-utils';

// Resumo da confirmação (SR5, SR7, seção 4), com 3 jogos por rodada.

function summaryOf(units: number, overrides: Partial<RoundDrawSummaryInput> = {}) {
  const input: RoundDrawSummaryInput = {
    ranking,
    season_id: season.id,
    categories: [category('cat')],
    enrollments: enrollments('cat', units),
    ...overrides,
  };
  return summarizeRoundDraw(input);
}

describe('summarizeRoundDraw: categoria que fecha', () => {
  it('6 duplas com 3 jogos: 9 partidas, sem aviso', () => {
    expect(summaryOf(6).categories[0]).toEqual({
      category_id: 'cat',
      enters: true,
      active_units: 6,
      per_unit: 3,
      total_matches: 9,
      warnings: [],
    });
  });

  it('conta só as inscrições ativas da temporada (R17, R45)', () => {
    const [first, ...rest] = enrollments('cat', 6);
    const closed = { ...first, status: 'closed' as const, closed_at: season.starts_on, closed_reason: 'partner_change' as const };
    const otherSeason = { ...rest[0], id: 'outra', season_id: 'season-antiga' };
    const summary = summaryOf(0, { enrollments: [closed, otherSeason, ...rest] });
    expect(summary.categories[0].active_units).toBe(5);
  });
});

describe('summarizeRoundDraw: avisos', () => {
  it('total ímpar de vagas: 5 duplas × 3 jogos', () => {
    const [summary] = summaryOf(5).categories;
    expect(summary.total_matches).toBe(7);
    expect(summary.warnings).toEqual([{ kind: 'odd_slots', units: 5, per_unit: 3 }]);
  });

  it('menos adversários que jogos: 3 duplas jogam 2 jogos, não 3 (R30)', () => {
    const [summary] = summaryOf(3).categories;
    expect(summary).toMatchObject({ per_unit: 2, total_matches: 3 });
    expect(summary.warnings).toEqual([{ kind: 'fewer_opponents', requested: 3, per_unit: 2 }]);
  });

  it('com menos adversários que jogos, o total de vagas nunca é ímpar', () => {
    // Cada dupla joga contra todas as outras: n × (n − 1) é sempre par.
    const rankin = { ...ranking, matches_per_round: 4 };
    for (const units of [2, 3, 4]) {
      const [summary] = summaryOf(units, { ranking: rankin }).categories;
      expect(summary.warnings).toEqual([{ kind: 'fewer_opponents', requested: 4, per_unit: units - 1 }]);
    }
  });

  it('categoria com menos de 2 duplas não entra', () => {
    expect(summaryOf(1).categories[0]).toEqual({
      category_id: 'cat',
      enters: false,
      active_units: 1,
      per_unit: 0,
      total_matches: 0,
      warnings: [{ kind: 'not_enough_units', active_units: 1 }],
    });
  });
});

describe('summarizeRoundDraw: a rodada', () => {
  it('soma as partidas das categorias e diz se alguma entra (SR8)', () => {
    const categories = [category('a'), category('b'), category('c')];
    const all = [...enrollments('a', 6), ...enrollments('b', 5), ...enrollments('c', 1)];
    const summary = summarizeRoundDraw({ ranking, season_id: season.id, categories, enrollments: all });
    expect(summary.total_matches).toBe(16);
    expect(summary.any_category_enters).toBe(true);
    expect(summaryOf(0).any_category_enters).toBe(false);
  });
});
