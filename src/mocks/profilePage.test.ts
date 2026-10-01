import { describe, expect, it } from 'vitest';
import type { ProfileSection } from '@/src/lib/domain/profile-page';
import { mockProfilePages } from './profilePage';
import { mockRankingRoutes } from './rankingRoutes';

// Regressão: o perfil montava `/ranking/<id-da-categoria>`, e a rota da
// classificação só aceita o slug. O link de "Rankings" caía no 404.

function dataOf<T>(section: ProfileSection<T>): T {
  if (section.status !== 'ready') throw new Error('Teste: seção com erro');
  return section.data;
}

// O que a página `app/(app)/ranking/[categoria]` faz com o href: slug → id
function resolves(href: string): boolean {
  const url = new URL(href, 'https://letzplay.test');
  const [, root, slug] = url.pathname.split('/');
  const season = url.searchParams.get('temporada');
  const seasonOk = season === null || mockRankingRoutes.seasonId(season) !== undefined;
  return root === 'ranking' && mockRankingRoutes.categoryId(slug) !== undefined && seasonOk;
}

describe('mockProfilePages: rotas da classificação', () => {
  it('"Rankings" leva à classificação pelo slug da categoria (RK1)', () => {
    const hrefs = dataOf(mockProfilePages.own.rankings).map((item) => item.href);
    expect(hrefs).toContain('/ranking/masculino-b');
    expect(hrefs.every(resolves)).toBe(true);
  });

  it('"Temporadas" leva à temporada encerrada pelo slug (RK21)', () => {
    const hrefs = dataOf(mockProfilePages.own.seasons).map((item) => item.href);
    expect(hrefs).toEqual(['/ranking/masculino-b?temporada=2026-1']);
    expect(hrefs.every(resolves)).toBe(true);
  });
});
