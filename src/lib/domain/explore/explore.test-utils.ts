import {
  DEFAULT_RESPONSE_DEADLINE_HOURS,
  DEFAULT_SCORING_RULE,
  type Organization,
  type RankingCompetition,
  type Round,
  type Season,
  type TournamentCompetition,
} from '@/src/types/domain';
import type { ExploreDomain } from './competitionStatus';

// Cenário de datas fixas para os testes da vitrine. Meio-dia em Brasília (15h
// UTC), longe da virada do dia nos dois fusos.

export const NOW = '2026-09-30T15:00:00.000Z';

export function organization(id: string, name: string, kind: Organization['kind'] = 'arena'): Organization {
  return { id, name, username: id, avatar_url: null, kind, city: 'Belo Horizonte', contact: null };
}

export function ranking(id: string, name: string, organizationId = 'org-a'): RankingCompetition {
  return {
    id,
    organization_id: organizationId,
    name,
    type: 'ranking',
    match_format: 'one_set_of_6',
    response_deadline_hours: DEFAULT_RESPONSE_DEADLINE_HOURS,
    matches_per_round: 2,
    partner_change_policy: 'new_team',
    scoring_rule: DEFAULT_SCORING_RULE,
  };
}

export function tournament(
  id: string,
  name: string,
  startsOn: string,
  endsOn: string,
  organizationId = 'org-a',
): TournamentCompetition {
  return {
    id,
    organization_id: organizationId,
    name,
    type: 'tournament',
    default_match_format: 'one_set_of_6',
    starts_on: startsOn,
    ends_on: endsOn,
    venue: 'Quadra Central · Belo Horizonte/MG',
  };
}

export function season(id: string, rankingId: string, startsOn: string, endsOn: string): Season {
  return { id, ranking_id: rankingId, name: id, starts_on: startsOn, ends_on: endsOn, final: null };
}

export function round(seasonId: string, number: number, startsAt: string): Round {
  return { id: `${seasonId}-r${number}`, season_id: seasonId, number, starts_at: startsAt, deadline: startsAt };
}

export function exploreDomain(tables: Partial<ExploreDomain>): ExploreDomain {
  return { organizations: [], competitions: [], seasons: [], rounds: [], ...tables };
}
