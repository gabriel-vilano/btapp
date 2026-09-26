import type {
  Competition,
  CompetitionAdmin,
  CompetitionCategory,
  CompetitorUnit,
  Enrollment,
  FeedEvent,
  Friendship,
  Match,
  Milestone,
  Organization,
  Player,
  Round,
  ScheduleProposal,
  Season,
  StandingSnapshot,
} from '@/src/types/domain';
import { feedEvents } from './feedEvents';
import { friendlyMatches } from './friendlies';
import { friendships, organizations, players, units } from './people';
import {
  masculinoB,
  mistaC40,
  ranking,
  rankingAdmin,
  rankingCategories,
  rounds,
  season,
} from './ranking';
import { rankingMatches, scheduleProposals } from './rankingMatches';
import { milestones, standingSnapshots } from './standings';
import {
  tournament,
  tournamentAdmin,
  tournamentCategories,
  tournamentEnrollments,
  tournamentMatches,
} from './tournament';

/** Todas as entidades do domínio, como tabelas. Uma lista por entidade. */
export interface DomainMocks {
  players: Player[];
  organizations: Organization[];
  friendships: Friendship[];
  competitions: Competition[];
  admins: CompetitionAdmin[];
  seasons: Season[];
  rounds: Round[];
  categories: CompetitionCategory[];
  units: CompetitorUnit[];
  enrollments: Enrollment[];
  matches: Match[];
  scheduleProposals: ScheduleProposal[];
  standingSnapshots: StandingSnapshot[];
  milestones: Milestone[];
  feedEvents: FeedEvent[];
}

/**
 * Cenário completo: um ranking no modelo do Vila do Tênis (temporada na
 * rodada 3, duas categorias, partidas em todos os estados), um torneio em
 * andamento e amistosos. Ex.: `mockDomain.matches.filter((m) => m.kind === 'friendly')`.
 */
export const mockDomain: DomainMocks = {
  players: Object.values(players),
  organizations: Object.values(organizations),
  friendships: Object.values(friendships),
  competitions: [ranking, tournament],
  admins: [rankingAdmin, tournamentAdmin],
  seasons: [season],
  rounds: Object.values(rounds),
  categories: [...Object.values(rankingCategories), ...Object.values(tournamentCategories)],
  units: Object.values(units),
  enrollments: [
    ...Object.values(masculinoB),
    ...Object.values(mistaC40),
    ...Object.values(tournamentEnrollments),
  ],
  matches: [...rankingMatches, ...tournamentMatches, ...friendlyMatches],
  scheduleProposals,
  standingSnapshots,
  milestones,
  feedEvents,
};

// Acesso direto às entidades nomeadas, para stories e testes que precisam de
// um caso específico (ex.: `mockEntities.masculinoB.t1`).
export const mockEntities = {
  players,
  organizations,
  units,
  friendships,
  ranking,
  season,
  rounds,
  rankingCategories,
  masculinoB,
  mistaC40,
  tournament,
  tournamentCategories,
  tournamentEnrollments,
};
