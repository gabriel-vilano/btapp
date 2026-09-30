import { SCORING_ANCHOR } from '@/src/lib/navigation/competitionAnchors';
import { mockEntities, pastSeasonEntities } from './domain';

// Slugs das rotas da classificação (docs/RANKING.md, RK1 e RK21) para o
// cenário de `src/mocks/domain/`. O domínio não guarda slug: a tradução vem
// com a integração. Os slugs são os mesmos dos hrefs de
// `src/mocks/competitionsTab.ts`, para a aba Competições levar à tela certa.

const { players, ranking, rankingCategories, season } = mockEntities;

const CATEGORY_BY_SLUG: Record<string, string> = {
  'masculino-b': rankingCategories.masculinoB.id,
  'mista-c-40': rankingCategories.mistaC40.id,
};

const SEASON_BY_SLUG: Record<string, string> = {
  '2026-1': pastSeasonEntities.season.id,
  '2026-2': season.id,
};

const COMPETITION_SLUG: Record<string, string> = {
  [ranking.id]: 'ranking-arena-rm',
};

function slugOf(table: Record<string, string>, id: string): string | undefined {
  return Object.entries(table).find(([, candidate]) => candidate === id)?.[0];
}

/** Quem vê a classificação nos mocks: o Lucas, o mesmo da aba Competições. */
export const MOCK_VIEWER_ID = players.lucas.id;

export const mockRankingRoutes = {
  /** `masculino-b` → id da categoria; undefined se a rota não existe. */
  categoryId: (slug: string): string | undefined => CATEGORY_BY_SLUG[slug],
  /** `2026-1` → id da temporada; undefined se não existe. */
  seasonId: (slug: string): string | undefined => SEASON_BY_SLUG[slug],
  /** Classificação da categoria, com `?temporada=` quando é outra temporada (RK21). */
  categoryHref: (categoryId: string, seasonId?: string): string => {
    const path = `/ranking/${slugOf(CATEGORY_BY_SLUG, categoryId) ?? categoryId}`;
    if (seasonId === undefined) return path;
    return `${path}?temporada=${slugOf(SEASON_BY_SLUG, seasonId) ?? seasonId}`;
  },
  /** Regras da competição, na seção de pontuação (RK5, RK17): a mesma âncora da página. */
  rulesHref: (competitionId: string): string =>
    `/competicoes/${COMPETITION_SLUG[competitionId] ?? competitionId}#${SCORING_ANCHOR}`,
};
