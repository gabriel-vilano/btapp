import { exploreEntities, mockEntities } from './domain';

// Slugs das rotas do Explorar (docs/EXPLORE.md, EX10 e EX22) para o cenário
// de `mockExploreDomain`, no padrão de `rankingRoutes.ts`. O domínio não guarda
// slug de competição: a tradução vem com a integração. A organização usa o
// @username, que já é único (EX22).

const { ranking, tournament } = mockEntities;
const { cajuiRanking, saqueCurtoTournament, jenipapoTournament } = exploreEntities;

// Os mesmos slugs de `rankingRoutes.ts` e de `competitionsTab.ts`, para a
// vitrine e a aba Competições levarem à mesma página
const COMPETITION_SLUG: Record<string, string> = {
  [ranking.id]: 'ranking-arena-mangaba',
  [tournament.id]: 'copa-tucum',
  [cajuiRanking.id]: 'ranking-clube-cajui',
  [saqueCurtoTournament.id]: 'desafio-saque-curto',
  [jenipapoTournament.id]: 'torneio-inverno-jenipapo',
};

export const mockExploreRoutes = {
  /** Página da competição (NAV N9). Sem slug no mapa, cai no id. */
  competitionHref: (competitionId: string): string =>
    `/competicoes/${COMPETITION_SLUG[competitionId] ?? competitionId}`,
  /** `desafio-saque-curto` → id da competição; undefined se a rota não existe. */
  competitionId: (slug: string): string | undefined =>
    Object.entries(COMPETITION_SLUG).find(([, candidate]) => candidate === slug)?.[0],
  /** Página da organização (EX22): o @username é o slug. */
  organizationHref: (username: string): string => `/organizacoes/${username}`,
};
