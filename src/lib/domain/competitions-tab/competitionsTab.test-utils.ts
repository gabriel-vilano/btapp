import type { AdminPendingItem, CompetitionsTabData, MyRankingItem, MyTournamentItem } from './types';

// Construtores mínimos para os testes: só o que muda de um caso para outro
// é passado; o resto tem um valor neutro.

export function rankingItem(id: string, enrolledAt: string): MyRankingItem {
  return {
    kind: 'ranking',
    enrollment_id: id,
    competition_name: 'Ranking BH',
    category_name: 'Masculino B',
    partner_name: 'Rafael',
    href: `/ranking/${id}`,
    enrolled_at: enrolledAt,
    position: 5,
    delta: null,
  };
}

export function tournamentItem(id: string, startsOn: string, nextMatchAt?: string): MyTournamentItem {
  return {
    kind: 'tournament',
    enrollment_id: id,
    competition_name: 'Open Umbu',
    category_name: 'Masculino B',
    partner_name: 'Rafael',
    href: `/competicoes/${id}`,
    starts_on: startsOn,
    ends_on: startsOn,
    next_match: nextMatchAt === undefined ? null : { starts_at: nextMatchAt, court: 'Quadra 3' },
  };
}

export function pendingItem(id: string, since: string): AdminPendingItem {
  return {
    id,
    kind: 'contested',
    competition_name: 'Ranking BH',
    category_name: 'Masculino B',
    sides: 'Lucas e Rafael x Pedro e Thiago',
    since,
    href: '/competicoes/ranking-bh/administrar',
  };
}

export function tabData(overrides: Partial<CompetitionsTabData>): CompetitionsTabData {
  return { is_admin: false, admin_pendings: [], competitions: [], last_season: null, ...overrides };
}
