import { describe, expect, it } from 'vitest';
import { exploreEntities, mockEntities, mockExploreDomain } from './domain';
import { mockExploreShowcase, mockOrganizationPage } from './explorePage';

// Rotas do Explorar sobre os mocks (docs/EXPLORE.md, EX9 e EX22): toda
// organização abre, e o slug que não existe cai no 404 da página.

const now = new Date().toISOString();
const { ranking, tournament } = mockEntities;
const { jenipapoTournament, cajuiRanking } = exploreEntities;

describe('mockExploreShowcase', () => {
  it('o Lucas participa do Ranking Arena Mangaba e da Copa Tucum, e só deles', () => {
    const participating = mockExploreShowcase(now).competitions.filter((item) => item.participating);
    expect(participating.map((item) => item.id).sort()).toEqual([ranking.id, tournament.id].sort());
  });

  it('tem competição aberta e as três arenas', () => {
    const showcase = mockExploreShowcase(now);
    expect(showcase.hasOpenCompetition).toBe(true);
    expect(showcase.arenas).toHaveLength(3);
  });
});

describe('mockOrganizationPage', () => {
  it('abre para cada organização dos mocks', () => {
    for (const organization of mockExploreDomain.organizations) {
      expect(mockOrganizationPage(organization.username, now)?.name).toBe(organization.name);
    }
  });

  it('slug que não existe → null (404)', () => {
    expect(mockOrganizationPage('nao-existe', now)).toBeNull();
  });

  it('Arena Jenipapo: nenhuma aberta, o torneio passado em "Ver encerradas"', () => {
    const page = mockOrganizationPage(exploreEntities.organizations.arenaJenipapo.username, now);
    expect(page?.hasOpenCompetition).toBe(false);
    expect(page?.competitions).toEqual([]);
    expect(page?.closed.map((item) => item.id)).toEqual([jenipapoTournament.id]);
  });

  it('Clube Cajuí: o ranking entre temporadas fica na lista, sem competição aberta', () => {
    const page = mockOrganizationPage(exploreEntities.organizations.clubeCajui.username, now);
    expect(page?.competitions.map((item) => item.id)).toEqual([cajuiRanking.id]);
    expect(page?.hasOpenCompetition).toBe(false);
    expect(page?.closed).toEqual([]);
  });
});
