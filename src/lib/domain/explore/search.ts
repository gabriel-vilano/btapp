import type { Competition, Organization } from '@/src/types/domain';
import type { ExploreDomain } from './competitionStatus';
import { searchPlayers, type PlayerSearchResult, type SearchDomain, type SearchViewer } from './playerSearch';
import { matchesSearchTerm } from './searchMatch';
import { searchCompetitionOrder, showcaseArenas } from './showcase';

// Escopos Competições e Arenas da busca (docs/EXPLORE.md, EX14 e EX16), a
// contagem das abas (EX5) e o corte em 20 com "Mostrar mais" (EX18).

/** Até 20 resultados por vez (EX18). */
export const SEARCH_PAGE_SIZE = 20;

/**
 * Rankings e torneios, abertos e encerrados, cujo nome ou o nome da
 * organização tem uma palavra começando pelo termo, na ordem da EX16.
 * @example searchCompetitions(mockExploreDomain, 'cajui', now) // [Ranking Clube Cajuí]
 */
export function searchCompetitions(domain: ExploreDomain, term: string, now: string): Competition[] {
  const organizationName = new Map(domain.organizations.map((org) => [org.id, org.name]));
  const found = domain.competitions.filter(
    (competition) =>
      matchesSearchTerm(competition.name, term) ||
      matchesSearchTerm(organizationName.get(competition.organization_id) ?? '', term),
  );
  return searchCompetitionOrder(found, domain, now);
}

/**
 * Organizações do tipo arena cujo nome ou cidade tem uma palavra começando
 * pelo termo. O nome vem antes da cidade; no empate, ordem alfabética (EX16).
 * @example searchArenas(mockExploreDomain, 'sete') // [Arena Jenipapo], de Sete Lagoas
 */
export function searchArenas(domain: Pick<ExploreDomain, 'organizations'>, term: string): Organization[] {
  const arenas = showcaseArenas(domain).filter(
    (arena) => matchesSearchTerm(arena.name, term) || matchesSearchTerm(arena.city, term),
  );
  const byName = arenas.filter((arena) => matchesSearchTerm(arena.name, term));
  return [...byName, ...arenas.filter((arena) => !byName.includes(arena))];
}

/** Os três escopos para o mesmo termo. */
export interface SearchResults {
  players: PlayerSearchResult[];
  competitions: Competition[];
  arenas: Organization[];
}

/** A contagem de cada aba de escopo (EX5). */
export type SearchCounts = Record<keyof SearchResults, number>;

/** Busca o termo nos três escopos: o escopo aberto mostra a lista, os outros a contagem (EX5, EX19). */
export function searchAllScopes(domain: SearchDomain, term: string, viewer: SearchViewer): SearchResults {
  return {
    players: searchPlayers(domain, term, viewer),
    competitions: searchCompetitions(domain, term, viewer.now),
    arenas: searchArenas(domain, term),
  };
}

/** Quantos resultados cada escopo tem. Ex.: `{ players: 0, competitions: 1, arenas: 1 }`. */
export function searchCounts(results: SearchResults): SearchCounts {
  return { players: results.players.length, competitions: results.competitions.length, arenas: results.arenas.length };
}

/** O que a lista mostra: os primeiros resultados e o total, para o "Mostrar mais" (EX18). */
export interface SearchPage<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

/**
 * Corta a lista em `shown` itens. Cada "Mostrar mais" soma mais 20.
 * @example searchPage(results.players, 2 * SEARCH_PAGE_SIZE)
 */
export function searchPage<T>(results: T[], shown: number = SEARCH_PAGE_SIZE): SearchPage<T> {
  return { items: results.slice(0, shown), total: results.length, hasMore: results.length > shown };
}
