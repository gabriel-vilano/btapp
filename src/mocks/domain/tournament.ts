import type {
  CompetitionAdmin,
  CompetitionCategory,
  CompetitorUnit,
  Enrollment,
  TournamentCompetition,
  TournamentMatch,
} from '@/src/types/domain';
import { daysAgo, daysFromNow, onTheHour } from '../relativeTime';
import { confirmedByAdmin, gameSet, hoursAfter, interruptedSet, reportBy } from './builders';
import { organizations, players as p, units } from './people';

// Torneio de fim de semana, em andamento: semifinais jogadas ontem e a final
// hoje. A chave vem de fora do app (R31), e o admin lança os resultados, que
// já nascem confirmados (R38). As duplas do Masculino B são as mesmas do
// ranking: a mesma unidade, inscrita em duas competições (R2).

const VENUE = 'Arena Sunset · Carandaí/MG';
const STARTS_ON = onTheHour(daysAgo(0.75));

export const tournament: TournamentCompetition = {
  id: 'comp-copa-sunset',
  organization_id: organizations.arenaSunset.id,
  name: 'Copa Sunset de Beach Tennis',
  type: 'tournament',
  default_match_format: 'one_set_of_6',
  starts_on: STARTS_ON,
  ends_on: onTheHour(daysFromNow(0.5)),
  venue: VENUE,
};

export const tournamentAdmin: CompetitionAdmin = {
  competition_id: tournament.id,
  player_id: p.fabio.id,
  granted_at: daysAgo(30),
};

export const tournamentCategories = {
  masculinoB: {
    id: 'cat-copa-sunset-masculino-b',
    competition_id: tournament.id,
    gender: 'M',
    modality: 'doubles',
    level_min: 'B',
    level_max: 'B',
    min_age: null,
  },
  masculinoCSimples: {
    id: 'cat-copa-sunset-masculino-c-simples',
    competition_id: tournament.id,
    gender: 'M',
    modality: 'singles',
    level_min: 'C',
    level_max: 'C',
    min_age: null,
  },
} satisfies Record<string, CompetitionCategory>;

function eventEnrollment(unit: CompetitorUnit, category: CompetitionCategory, weeksBefore: number): Enrollment {
  return {
    id: `enr-copa-sunset-${unit.id.replace('unit-', '')}`,
    unit_id: unit.id,
    category_id: category.id,
    season_id: null, // no torneio a inscrição é do evento
    enrolled_at: daysAgo(7 * weeksBefore),
    status: 'active',
  };
}

const doublesCat = tournamentCategories.masculinoB;
const singlesCat = tournamentCategories.masculinoCSimples;

export const tournamentEnrollments = {
  lucasRafael: eventEnrollment(units.lucasRafael, doublesCat, 4),
  pedroThiago: eventEnrollment(units.pedroThiago, doublesCat, 4),
  andreBruno: eventEnrollment(units.andreBruno, doublesCat, 3),
  eduardoFelipe: eventEnrollment(units.eduardoFelipe, doublesCat, 2),
  pedro: eventEnrollment(units.pedro, singlesCat, 3),
  andre: eventEnrollment(units.andre, singlesCat, 3),
  eduardo: eventEnrollment(units.eduardo, singlesCat, 2),
  henrique: eventEnrollment(units.henrique, singlesCat, 2),
};

const e = tournamentEnrollments;
// No primeiro beta os confrontos entram por carga do time (R31).
const LOADED_AT = daysAgo(2);

function base(slug: string, category: CompetitionCategory, sideA: Enrollment, sideB: Enrollment, stage: string) {
  return {
    id: `match-copa-sunset-${slug}`,
    kind: 'tournament' as const,
    competition_id: tournament.id,
    category_id: category.id,
    side_a_enrollment_id: sideA.id,
    side_b_enrollment_id: sideB.id,
    format: tournament.default_match_format,
    venue: VENUE,
    created_at: LOADED_AT,
    stage,
  };
}

const semi1At = hoursAfter(STARTS_ON, 1);
const semi2At = hoursAfter(STARTS_ON, 2);
const singlesSemiAt = hoursAfter(STARTS_ON, 3);

const semi1Report = reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 3)] }, p.fabio, hoursAfter(semi1At, 1));
const semi2Report = reportBy({ type: 'normal', winner: 'b', sets: [gameSet(5, 7)] }, p.fabio, hoursAfter(semi2At, 1));
// O Henrique sentiu a panturrilha perdendo por 3/1 e desistiu (R11).
const singlesSemiReport = reportBy(
  { type: 'retired', winner: 'a', sets: [interruptedSet(3, 1)] },
  p.fabio,
  hoursAfter(singlesSemiAt, 1),
);

export const tournamentMatches: TournamentMatch[] = [
  { ...base('mb-semi-1', doublesCat, e.lucasRafael, e.eduardoFelipe, 'Semifinal'), scheduled_at: semi1At,
    status: 'confirmed', result: semi1Report.result, report: semi1Report,
    confirmation: confirmedByAdmin(p.fabio, semi1Report.reported_at), correction: null, points: null },
  { ...base('mb-semi-2', doublesCat, e.pedroThiago, e.andreBruno, 'Semifinal'), scheduled_at: semi2At,
    status: 'confirmed', result: semi2Report.result, report: semi2Report,
    confirmation: confirmedByAdmin(p.fabio, semi2Report.reported_at), correction: null, points: null },
  // A final foge do padrão: 2 sets com super tiebreak (R29).
  { ...base('mb-final', doublesCat, e.lucasRafael, e.andreBruno, 'Final'), format: 'two_sets_of_6_stb',
    scheduled_at: onTheHour(daysFromNow(0.25)), status: 'defined' },
  { ...base('mc-semi-1', singlesCat, e.pedro, e.henrique, 'Semifinal'), scheduled_at: singlesSemiAt,
    status: 'confirmed', result: singlesSemiReport.result, report: singlesSemiReport,
    confirmation: confirmedByAdmin(p.fabio, singlesSemiReport.reported_at), correction: null, points: null },
  { ...base('mc-semi-2', singlesCat, e.andre, e.eduardo, 'Semifinal'), scheduled_at: onTheHour(daysFromNow(0.1)),
    status: 'defined' },
];
