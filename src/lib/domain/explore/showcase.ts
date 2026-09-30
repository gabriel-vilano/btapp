import type { Competition, Organization, RankingCompetition, TournamentCompetition } from '@/src/types/domain';
import { isCompetitionOpen, type ExploreDomain } from './competitionStatus';

// Ordem das competições na vitrine (docs/EXPLORE.md, EX8) e na página da
// organização (EX22), e a contagem de abertas do item de arena (EX11).

type StatusTables = Pick<ExploreDomain, 'seasons'>;

const byName = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name, 'pt-BR');

// Do mais próximo ao mais distante; no mesmo horário, por nome
const byStart = (a: TournamentCompetition, b: TournamentCompetition): number =>
  Date.parse(a.starts_on) - Date.parse(b.starts_on) || byName(a, b);

// O mais recente primeiro: é o que o jogador lembra
const byMostRecentEnd = (a: TournamentCompetition, b: TournamentCompetition): number =>
  Date.parse(b.ends_on) - Date.parse(a.ends_on) || byName(a, b);

interface CompetitionGroups {
  openTournaments: TournamentCompetition[];
  runningRankings: RankingCompetition[];
  rankingsBetweenSeasons: RankingCompetition[];
  pastTournaments: TournamentCompetition[];
}

function groupCompetitions(competitions: Competition[], domain: StatusTables, now: string): CompetitionGroups {
  const open = (competition: Competition) => isCompetitionOpen(competition, domain, now);
  const tournaments = competitions.filter((c): c is TournamentCompetition => c.type === 'tournament');
  const rankings = competitions.filter((c): c is RankingCompetition => c.type === 'ranking');
  return {
    openTournaments: tournaments.filter(open).sort(byStart),
    runningRankings: rankings.filter(open).sort(byName),
    rankingsBetweenSeasons: rankings.filter((c) => !open(c)).sort(byName),
    pastTournaments: tournaments.filter((c) => !open(c)).sort(byMostRecentEnd),
  };
}

/**
 * Competições da vitrine, na ordem da EX8: torneios abertos pela data,
 * rankings em andamento e rankings entre temporadas, os dois por nome.
 * Torneio que já aconteceu fica de fora: não há o que fazer com ele.
 */
export function showcaseCompetitions(domain: ExploreDomain, now: string): Competition[] {
  const groups = groupCompetitions(domain.competitions, domain, now);
  return [...groups.openTournaments, ...groups.runningRankings, ...groups.rankingsBetweenSeasons];
}

/** Competições da página da organização (EX22): abertas na ordem da EX8; encerradas atrás de "Ver encerradas (N)". */
export interface OrganizationCompetitions {
  open: Competition[];
  closed: Competition[]; // rankings entre temporadas por nome, depois torneios do mais recente
}

/**
 * As competições que a organização promove, separadas em abertas e encerradas.
 * Aqui o ranking entre temporadas é encerrada (§1, "Termos"): na vitrine ele
 * aparece no fim da lista (EX8), mas na página da organização vai para trás
 * de "Ver encerradas", e "Nenhuma competição aberta agora." vale quando só há ele.
 */
export function organizationCompetitions(
  organizationId: string,
  domain: ExploreDomain,
  now: string,
): OrganizationCompetitions {
  const own = domain.competitions.filter((competition) => competition.organization_id === organizationId);
  const groups = groupCompetitions(own, domain, now);
  return {
    open: [...groups.openTournaments, ...groups.runningRankings],
    closed: [...groups.rankingsBetweenSeasons, ...groups.pastTournaments],
  };
}

/** Organizações do tipo arena, por nome: a seção "Arenas" da vitrine (EX11). */
export function showcaseArenas(domain: Pick<ExploreDomain, 'organizations'>): Organization[] {
  return domain.organizations.filter((organization) => organization.kind === 'arena').sort(byName);
}

/**
 * Linha do item de arena (EX11): quantas competições da organização estão abertas.
 * @example openCompetitionsText('org-arena-mangaba', domain, now) // "1 competição aberta"
 */
export function openCompetitionsText(organizationId: string, domain: ExploreDomain, now: string): string {
  const count = organizationCompetitions(organizationId, domain, now).open.length;
  if (count === 0) return 'Nenhuma competição aberta';
  return count === 1 ? '1 competição aberta' : `${count} competições abertas`;
}
