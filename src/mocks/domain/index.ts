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
  PlayerPhone,
  ReportedScheduleDate,
  Round,
  ScheduleProposal,
  Season,
  StandingSnapshot,
} from '@/src/types/domain';
import {
  cajuiRanking,
  cajuiRounds,
  cajuiSeasons,
  exploreOrganizations,
  jenipapoTournament,
  saqueCurtoTournament,
  valeAzulTournament,
} from './explore';
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
import {
  pastMasculinoB,
  pastMatches,
  pastMilestones,
  pastRounds,
  pastSeason,
  pastSnapshots,
} from './pastSeason';
import { rankingMatches } from './rankingMatches';
import { playerPhones, reportedScheduleDates, scheduleProposals } from './scheduling';
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
  reportedScheduleDates: ReportedScheduleDate[];
  playerPhones: PlayerPhone[];
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
  reportedScheduleDates,
  playerPhones,
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

/**
 * O `mockDomain` com uma temporada encerrada do mesmo ranking (1º semestre),
 * para a seção "Temporadas" do perfil (PF19). Separado para que as contagens
 * e o feed dos outros testes sigam só a temporada atual.
 * Ex.: `profileSeasons(mockProfileDomain, mockEntities.players.lucas.id, now)`.
 */
export const mockProfileDomain: DomainMocks = {
  ...mockDomain,
  seasons: [pastSeason, ...mockDomain.seasons],
  rounds: [...Object.values(pastRounds), ...mockDomain.rounds],
  enrollments: [...Object.values(pastMasculinoB), ...mockDomain.enrollments],
  matches: [...pastMatches, ...mockDomain.matches],
  standingSnapshots: [...pastSnapshots, ...mockDomain.standingSnapshots],
  milestones: [...pastMilestones, ...mockDomain.milestones],
};

/**
 * O `mockDomain` com as organizações e competições da vitrine do Explorar
 * (docs/EXPLORE.md, EX8 a EX11 e EX22): um ranking entre temporadas, um
 * torneio futuro, um passado e os tipos arena, clube, federação e grupo. Separado para
 * que as contagens dos outros testes não mudem.
 * Ex.: `showcaseCompetitions(mockExploreDomain, now)`.
 */
export const mockExploreDomain: DomainMocks = {
  ...mockDomain,
  organizations: [...mockDomain.organizations, ...Object.values(exploreOrganizations)],
  competitions: [...mockDomain.competitions, cajuiRanking, saqueCurtoTournament, valeAzulTournament, jenipapoTournament],
  seasons: [...mockDomain.seasons, ...Object.values(cajuiSeasons)],
  rounds: [...mockDomain.rounds, ...cajuiRounds],
};

export const exploreEntities = {
  organizations: exploreOrganizations,
  cajuiRanking,
  cajuiSeasons,
  saqueCurtoTournament,
  valeAzulTournament,
  jenipapoTournament,
};

export const pastSeasonEntities = { season: pastSeason, rounds: pastRounds, masculinoB: pastMasculinoB };

export { scheduleHistoryOf } from './scheduling';
