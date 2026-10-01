import { describe, expect, it } from 'vitest';
import { exploreEntities, mockEntities, mockExploreDomain } from '@/src/mocks/domain';
import { exploreDomain, NOW, organization, ranking, season, tournament } from './explore.test-utils';
import { SEARCH_PAGE_SIZE, searchAllScopes, searchArenas, searchCompetitions, searchCounts, searchPage } from './search';

const RUNNING = ['2026-08-01T15:00:00.000Z', '2026-12-20T15:00:00.000Z'] as const;
const ENDED = ['2026-02-01T15:00:00.000Z', '2026-07-01T15:00:00.000Z'] as const;

const ids = (list: { id: string }[]) => list.map((item) => item.id);

function arena(id: string, name: string, city: string) {
  return { ...organization(id, name), city };
}

describe('searchCompetitions (EX14, EX16)', () => {
  const domain = exploreDomain({
    organizations: [organization('org-a', 'Arena Praia'), organization('org-b', 'Clube Norte', 'club')],
    competitions: [
      tournament('antigo', 'Copa Praia Antiga', '2026-03-10T12:00:00.000Z', '2026-03-11T21:00:00.000Z'),
      ranking('pausa', 'Ranking Praia Pausa'),
      tournament('recente', 'Copa Praia Recente', '2026-08-10T12:00:00.000Z', '2026-08-11T21:00:00.000Z'),
      ranking('ativo', 'Ranking do Norte', 'org-b'),
      tournament('aberto', 'Copa Praia Aberta', '2026-10-10T12:00:00.000Z', '2026-10-11T21:00:00.000Z'),
      ranking('outro', 'Ranking Sul', 'org-b'),
    ],
    seasons: [season('s-ativo', 'ativo', ...RUNNING), season('s-pausa', 'pausa', ...ENDED), season('s-outro', 'outro', ...RUNNING)],
  });

  it('busca no nome da competição e no da organização, abertas e encerradas', () => {
    expect(ids(searchCompetitions(domain, 'praia', NOW))).toEqual(['aberto', 'pausa', 'recente', 'antigo']);
    expect(ids(searchCompetitions(domain, 'norte', NOW))).toEqual(['ativo', 'outro']);
  });

  it('ordem da vitrine, com os torneios encerrados no fim, do mais recente ao mais antigo', () => {
    expect(ids(searchCompetitions(domain, 'a', NOW))).toEqual(['aberto', 'pausa', 'recente', 'antigo']);
  });
});

describe('searchArenas (EX14, EX16)', () => {
  const domain = exploreDomain({
    organizations: [
      arena('cidade-z', 'Arena Zebu', 'Contagem'),
      arena('nome', 'Arena Contorno', 'Belo Horizonte'),
      arena('cidade-a', 'Arena Açaí', 'Contagem'),
      organization('clube', 'Clube Contagem', 'club'),
    ],
  });

  it('nome que começa pelo termo antes da cidade; empate em ordem alfabética', () => {
    expect(ids(searchArenas(domain, 'cont'))).toEqual(['nome', 'cidade-a', 'cidade-z']);
  });

  it('só organizações do tipo arena', () => {
    expect(ids(searchArenas(domain, 'clube'))).toEqual([]);
  });
});

describe('searchAllScopes e searchCounts (EX5)', () => {
  const viewer = { viewerId: mockEntities.players.lucas.id, now: new Date().toISOString() };

  it('a contagem de cada escopo bate com o total de resultados dele', () => {
    for (const term of ['ar', 'caju', 'sete', 'silva', 'zz']) {
      const results = searchAllScopes(mockExploreDomain, term, viewer);
      expect(searchCounts(results)).toEqual({
        players: results.players.length,
        competitions: results.competitions.length,
        arenas: results.arenas.length,
      });
    }
  });

  it('o mesmo termo em escopos diferentes', () => {
    const results = searchAllScopes(mockExploreDomain, 'cajui', viewer);
    expect(searchCounts(results)).toEqual({ players: 0, competitions: 1, arenas: 0 });
    expect(results.competitions).toEqual([exploreEntities.cajuiRanking]);
    expect(searchArenas(mockExploreDomain, 'sete')).toEqual([exploreEntities.organizations.arenaJenipapo]);
  });
});

describe('searchPage (EX18)', () => {
  const results = Array.from({ length: 45 }, (_, index) => index);

  it('corta em 20, com o total para o "Mostrar mais"', () => {
    const page = searchPage(results);
    expect(page.items).toHaveLength(SEARCH_PAGE_SIZE);
    expect(page).toMatchObject({ total: 45, hasMore: true });
  });

  it('cada "Mostrar mais" soma 20, até acabar', () => {
    expect(searchPage(results, 40).items).toHaveLength(40);
    expect(searchPage(results, 60)).toMatchObject({ total: 45, hasMore: false });
    expect(searchPage(results, 60).items).toHaveLength(45);
  });

  it('lista curta cabe inteira', () => {
    expect(searchPage([1, 2, 3])).toEqual({ items: [1, 2, 3], total: 3, hasMore: false });
  });
});
