import { describe, expect, it } from 'vitest';
import { mockCompetitionPageBySlug } from './competitionPage';
import { mockCompetitionsTab } from './competitionsTab';
import { mockExploreDomain } from './domain';
import { mockExploreRoutes } from './exploreRoutes';

// Todo link de competição dos mocks abre uma página (docs/EXPLORE.md, EX34):
// os da vitrine e da página da organização, e os da aba Competições

const COMPETITION_PATH = /^\/competicoes\/([^/?#]+)$/;

function pageOf(href: string) {
  const slug = COMPETITION_PATH.exec(href)?.[1];
  return slug === undefined ? undefined : mockCompetitionPageBySlug(slug);
}

describe('mockCompetitionPageBySlug', () => {
  it.each(mockExploreDomain.competitions.map((competition) => [competition.name, competition] as const))(
    'a vitrine leva à página de %s, com o mesmo tipo',
    (_, competition) => {
      const page = pageOf(mockExploreRoutes.competitionHref(competition.id));
      expect(page?.type).toBe(competition.type);
      // O ranking do domínio tem o ano no nome; o torneio nasce do domínio, com o mesmo nome
      if (competition.type === 'tournament') expect(page?.name).toBe(competition.name);
    },
  );

  it('cada competição da aba Competições abre a página dela', () => {
    for (const item of mockCompetitionsTab.player.competitions) {
      if (!COMPETITION_PATH.test(item.href)) continue; // ranking leva à classificação (RK1)
      expect(pageOf(item.href)?.name, item.href).toBe(item.competition_name);
    }
  });

  it('o torneio guarda data e local do domínio', () => {
    const [tournament] = mockExploreDomain.competitions.filter((competition) => competition.type === 'tournament');
    const page = pageOf(mockExploreRoutes.competitionHref(tournament.id));
    expect(page?.type === 'tournament' && [page.starts_on, page.ends_on, page.venue]).toEqual([
      tournament.starts_on,
      tournament.ends_on,
      tournament.venue,
    ]);
  });
});
