import { describe, expect, it } from 'vitest';
import { mockCompetitionPageBySlug } from './competitionPage';
import { mockEntities } from './domain';
import { mockRankingRoutes } from './rankingRoutes';

// Os links da classificação caem em rotas que existem nos mocks

describe('mockRankingRoutes.rulesHref (RK5)', () => {
  it('leva à seção de pontuação de uma página da competição que existe', () => {
    const href = mockRankingRoutes.rulesHref(mockEntities.ranking.id);
    const [path, anchor] = href.split('#');
    expect(anchor).toBe('pontuacao');
    expect(mockCompetitionPageBySlug(path.replace('/competicoes/', ''))).toBeDefined();
  });
});

describe('mockRankingRoutes.categoryHref', () => {
  it('vai e volta pelo slug, com ?temporada= para outra temporada (RK21)', () => {
    const { masculinoB } = mockEntities.rankingCategories;
    expect(mockRankingRoutes.categoryHref(masculinoB.id)).toBe('/ranking/masculino-b');
    expect(mockRankingRoutes.categoryId('masculino-b')).toBe(masculinoB.id);
    expect(mockRankingRoutes.categoryHref(masculinoB.id, 'season-arena-mangaba-2026-1')).toBe(
      '/ranking/masculino-b?temporada=2026-1',
    );
  });
});
