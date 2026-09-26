import type { CompetitionMatch, Enrollment, Match, Round } from '@/src/types/domain';
import { mockDomain } from './index';

// Índices e atalhos para os testes de integridade dos mocks de domínio.

type WithId = { id: string };

function indexById<T extends WithId>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export const byId = {
  players: indexById(mockDomain.players),
  organizations: indexById(mockDomain.organizations),
  friendships: indexById(mockDomain.friendships),
  competitions: indexById(mockDomain.competitions),
  seasons: indexById(mockDomain.seasons),
  rounds: indexById(mockDomain.rounds),
  categories: indexById(mockDomain.categories),
  units: indexById(mockDomain.units),
  enrollments: indexById(mockDomain.enrollments),
  matches: indexById(mockDomain.matches),
  milestones: indexById(mockDomain.milestones),
};

/** Busca por id e falha com mensagem clara quando a referência está quebrada. */
export function get<T>(index: Map<string, T>, id: string): T {
  const found = index.get(id);
  if (found === undefined) throw new Error(`referência quebrada: '${id}' não existe`);
  return found;
}

export function enrollmentPlayers(enrollmentId: string): string[] {
  const enrollment = get(byId.enrollments, enrollmentId);
  return get(byId.units, enrollment.unit_id).player_ids;
}

/** Jogadores dos lados A e B de qualquer partida. */
export function sidePlayers(match: Match): { a: string[]; b: string[] } {
  if (match.kind === 'friendly') {
    return {
      a: get(byId.units, match.side_a_unit_id).player_ids,
      b: get(byId.units, match.side_b_unit_id).player_ids,
    };
  }
  return { a: enrollmentPlayers(match.side_a_enrollment_id), b: enrollmentPlayers(match.side_b_enrollment_id) };
}

export function sideOf(match: Match, playerId: string): 'a' | 'b' | null {
  const { a, b } = sidePlayers(match);
  if (a.includes(playerId)) return 'a';
  if (b.includes(playerId)) return 'b';
  return null;
}

export function isAdminOf(competitionId: string, playerId: string): boolean {
  return mockDomain.admins.some((admin) => admin.competition_id === competitionId && admin.player_id === playerId);
}

export const competitionMatches = mockDomain.matches.filter(
  (match): match is CompetitionMatch => match.kind !== 'friendly',
);

export const rankingMatches = mockDomain.matches.filter((match) => match.kind === 'ranking');

export function sidesOf(match: CompetitionMatch): Enrollment[] {
  return [get(byId.enrollments, match.side_a_enrollment_id), get(byId.enrollments, match.side_b_enrollment_id)];
}

export function roundsUpTo(round: Round): Round[] {
  return mockDomain.rounds.filter((other) => other.season_id === round.season_id && other.number <= round.number);
}

export const time = (iso: string): number => Date.parse(iso);
