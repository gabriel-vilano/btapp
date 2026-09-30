import { describe, expect, it } from 'vitest';
import { exploreEntities, mockDomain, mockEntities, mockExploreDomain } from '@/src/mocks/domain';
import { mockExploreRoutes } from '@/src/mocks/exploreRoutes';
import { competitionSituation, openCompetitionsText, organizationCompetitions, showcaseArenas, showcaseCompetitions } from '.';

// O cenário do Explorar cobre o que a vitrine e a página da organização
// precisam mostrar (ENG: mocks do Explorar). As datas dos mocks são relativas
// ao momento em que o módulo carrega.

const now = new Date().toISOString();
const { organizations: orgs, cajuiRanking, saqueCurtoTournament, valeAzulTournament, jenipapoTournament } =
  exploreEntities;
const { ranking, tournament, organizations } = mockEntities;

describe('mockExploreDomain', () => {
  it('estende o mockDomain sem mudar as tabelas que os outros testes contam', () => {
    for (const table of ['players', 'matches', 'enrollments', 'categories', 'feedEvents'] as const) {
      expect(mockExploreDomain[table]).toBe(mockDomain[table]);
    }
    expect(mockExploreDomain.competitions.slice(0, mockDomain.competitions.length)).toEqual(mockDomain.competitions);
  });

  it('tem os quatro tipos (arena, clube, federação e grupo) e uma organização sem contato', () => {
    const kinds = new Set(mockExploreDomain.organizations.map((org) => org.kind));
    expect([...kinds].sort()).toEqual(['arena', 'club', 'federation', 'group']);
    expect(mockExploreDomain.organizations.filter((org) => org.contact === null)).toEqual([orgs.grupoSaqueCurto]);
  });

  it('toda competição aponta para uma organização que existe', () => {
    const ids = new Set(mockExploreDomain.organizations.map((org) => org.id));
    for (const competition of mockExploreDomain.competitions) expect(ids).toContain(competition.organization_id);
  });

  it('vitrine: torneios abertos, ranking em andamento e ranking entre temporadas; o passado fica de fora', () => {
    expect(showcaseCompetitions(mockExploreDomain, now)).toEqual([
      tournament,
      saqueCurtoTournament,
      valeAzulTournament,
      ranking,
      cajuiRanking,
    ]);
  });

  it('situação de cada tipo de competição', () => {
    expect(competitionSituation(ranking, mockExploreDomain, now)).toBe('Rodada 3 de 4');
    expect(competitionSituation(cajuiRanking, mockExploreDomain, now)).toBe('Entre temporadas');
    expect(competitionSituation(jenipapoTournament, mockExploreDomain, now)).toBe('Encerrado');
    expect(competitionSituation(saqueCurtoTournament, mockExploreDomain, now)).toContain('Arena Mangaba');
  });

  it('seção Arenas: as três arenas, uma delas sem competição aberta', () => {
    expect(showcaseArenas(mockExploreDomain)).toEqual([orgs.arenaJenipapo, organizations.arenaMangaba, organizations.arenaTucum]);
    expect(openCompetitionsText(orgs.arenaJenipapo.id, mockExploreDomain, now)).toBe('Nenhuma competição aberta');
    expect(organizationCompetitions(orgs.arenaJenipapo.id, mockExploreDomain, now).closed).toEqual([jenipapoTournament]);
  });

  it('toda competição e organização tem rota, e o slug volta para o id', () => {
    for (const competition of mockExploreDomain.competitions) {
      const slug = mockExploreRoutes.competitionHref(competition.id).replace('/competicoes/', '');
      expect(mockExploreRoutes.competitionId(slug)).toBe(competition.id);
    }
    expect(mockExploreRoutes.organizationHref(orgs.clubeCajui.username)).toBe('/organizacoes/clubecajui');
  });
});
