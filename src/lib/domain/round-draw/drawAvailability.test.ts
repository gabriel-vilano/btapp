import { describe, expect, it } from 'vitest';
import { roundDrawAvailability, undrawnCategories, type UndrawnCategoriesInput } from './drawAvailability';
import { NOW, category, definedMatch, enrollments, round, season } from './roundDrawScenario.test-utils';

// Quando "Sortear a rodada N" aparece (SR3) e a categoria sorteada depois (SR14).
// Hoje é 12/10/2026, 10h em Brasília.

const first = round(1, '2026-09-14T13:00:00.000Z', '2026-09-28T02:59:00.000Z');
const secondClosed = round(2, '2026-09-28T13:00:00.000Z', '2026-10-12T02:59:00.000Z');
const secondOpen = round(2, '2026-09-28T13:00:00.000Z', '2026-10-15T02:59:00.000Z');

describe('roundDrawAvailability', () => {
  it('temporada sem sorteio: "Sortear a rodada 1"', () => {
    expect(roundDrawAvailability(season, [], NOW)).toEqual({ state: 'available', round_number: 1, previous_round: null });
  });

  it('rodada anterior aberta: a rodada está em andamento, sem botão de sortear', () => {
    expect(roundDrawAvailability(season, [first, secondOpen], NOW)).toEqual({ state: 'round_open', round: secondOpen });
  });

  it('rodada anterior fechou no prazo: "Sortear a rodada 3"', () => {
    expect(roundDrawAvailability(season, [first, secondClosed], NOW)).toEqual({
      state: 'available',
      round_number: 3,
      previous_round: secondClosed,
    });
  });

  it('rodada cadastrada para o futuro não conta como sorteada', () => {
    const future = round(3, '2026-10-20T13:00:00.000Z', '2026-11-03T02:59:00.000Z');
    expect(roundDrawAvailability(season, [first, secondClosed, future], NOW)).toMatchObject({ state: 'available', round_number: 3 });
  });

  it('rodada de outra temporada não conta', () => {
    const otherSeason = { ...secondOpen, id: 'outra', season_id: 'season-antiga' };
    expect(roundDrawAvailability(season, [otherSeason], NOW)).toMatchObject({ state: 'available', round_number: 1 });
  });

  it('temporada encerrada: nenhuma ação', () => {
    expect(roundDrawAvailability(season, [first], new Date(season.ends_on))).toEqual({ state: 'season_ended' });
  });
});

describe('undrawnCategories', () => {
  const input: UndrawnCategoriesInput = {
    round: secondOpen,
    categories: [category('masc-b'), category('masc-a'), category('fem-c')],
    enrollments: [...enrollments('masc-b', 4), ...enrollments('masc-a', 2), ...enrollments('fem-c', 1)],
    seasonMatches: [
      definedMatch({ id: 'm1', categoryId: 'masc-b', roundId: secondOpen.id, sides: ['masc-b-u1', 'masc-b-u2'], createdAt: secondOpen.starts_at }),
      definedMatch({ id: 'm0', categoryId: 'masc-a', roundId: first.id, sides: ['masc-a-u1', 'masc-a-u2'], createdAt: first.starts_at }),
    ],
  };

  it('lista as categorias sem partidas na rodada, e se já dá para sortear', () => {
    expect(undrawnCategories(input, NOW)).toEqual([
      { category_id: 'masc-a', active_units: 2, drawable: true },
      { category_id: 'fem-c', active_units: 1, drawable: false },
    ]);
  });

  it('depois do prazo da rodada, a categoria espera a próxima', () => {
    expect(undrawnCategories(input, new Date(secondOpen.deadline))).toEqual([]);
  });
});
