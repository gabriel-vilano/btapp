import type {
  CompetitionCategory,
  ConfirmedState,
  Enrollment,
  MatchConfirmation,
  RankingMatch,
  ResultReport,
  Round,
  ScheduleOption,
  ScheduleProposal,
  SidePoints,
} from '@/src/types/domain';
import { daysAgo, daysFromNow, hoursAgo, onTheHour } from '../relativeTime';
import {
  adminAction,
  confirmedByAdmin,
  confirmedByDeadline,
  confirmedByOpponent,
  gameSet,
  hoursAfter,
  interruptedSet,
  reportBy,
  responseBy,
} from './builders';
import { players as p } from './people';
import { masculinoB as mb, mistaC40 as mx, ranking, rankingCategories, rounds } from './ranking';

// Partidas do ranking. Os confrontos seguem a R30: cada dupla joga 2 por
// rodada, sem repetir confronto enquanto sobra combinação nova. No Masculino B
// (6 duplas, 15 confrontos possíveis) a rodada 3 já precisa repetir três, o
// risco citado na §7 da spec.
//
// Os pontos foram calculados à mão pela regra padrão (R9–R11): ex. 6/4 dá
// 100 + 12 − 8 = 104 ao vencedor e 50 + 8 − 12 = 46 ao perdedor.

const VENUE = 'Arena RM – Beach · Nova Lima/MG';
const DEADLINE_HOURS = ranking.response_deadline_hours;

function base(
  slug: string,
  round: Round,
  category: CompetitionCategory,
  sideA: Enrollment,
  sideB: Enrollment,
  createdAt: string = round.starts_at,
) {
  return {
    id: `match-arena-rm-${slug}`,
    kind: 'ranking' as const,
    competition_id: ranking.id,
    category_id: category.id,
    round_id: round.id,
    side_a_enrollment_id: sideA.id,
    side_b_enrollment_id: sideB.id,
    format: ranking.match_format,
    venue: VENUE,
    created_at: createdAt, // o sorteio da rodada cria a partida
  };
}

function confirmed(
  report: ResultReport,
  confirmation: MatchConfirmation,
  points: SidePoints,
): ConfirmedState<SidePoints> {
  return { status: 'confirmed', result: report.result, report, confirmation, correction: null, points };
}

const masc = (slug: string, round: Round, a: Enrollment, b: Enrollment) =>
  base(`mb-${slug}`, round, rankingCategories.masculinoB, a, b);

const mista = (slug: string, round: Round, a: Enrollment, b: Enrollment, createdAt?: string) =>
  base(`mx-${slug}`, round, rankingCategories.mistaC40, a, b, createdAt);

// --- Masculino B, rodada 1: todas confirmadas, um exemplo de cada tipo ---

const r1Dates = [55, 52, 48, 47, 45, 43].map((n) => onTheHour(daysAgo(n)));
const r1Reports = {
  m1: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 4)] }, p.lucas, hoursAfter(r1Dates[0], 2)),
  m2: reportBy({ type: 'normal', winner: 'b', sets: [gameSet(3, 6)] }, p.andre, hoursAfter(r1Dates[1], 2)),
  m3: reportBy({ type: 'wo', winner: 'a' }, p.bruno, hoursAfter(r1Dates[2], 1)),
  // O Caio (T4) vencia por 4/2 e se lesionou: o placar completado é 4/6 (R11).
  m4: reportBy({ type: 'retired', winner: 'b', sets: [interruptedSet(4, 2)] }, p.felipe, hoursAfter(r1Dates[3], 2)),
  m5: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(7, 5)] }, p.eduardo, hoursAfter(r1Dates[4], 2)),
  m6: reportBy({ type: 'normal', winner: 'b', sets: [gameSet(2, 6)] }, p.rafael, hoursAfter(r1Dates[5], 2)),
};

const masculinoBRound1: RankingMatch[] = [
  { ...masc('r1-1', rounds.first, mb.t1, mb.t2), scheduled_at: r1Dates[0],
    ...confirmed(r1Reports.m1, confirmedByOpponent(p.pedro, hoursAfter(r1Dates[0], 5)), { a: 104, b: 46 }) },
  { ...masc('r1-2', rounds.first, mb.t2, mb.t3), scheduled_at: r1Dates[1],
    ...confirmed(r1Reports.m2, confirmedByDeadline(r1Reports.m2, DEADLINE_HOURS), { a: 44, b: 106 }) },
  { ...masc('r1-3', rounds.first, mb.t3, mb.t4), scheduled_at: r1Dates[2],
    ...confirmed(r1Reports.m3, confirmedByDeadline(r1Reports.m3, DEADLINE_HOURS), { a: 100, b: 0 }) },
  { ...masc('r1-4', rounds.first, mb.t4, mb.t5), scheduled_at: r1Dates[3],
    ...confirmed(r1Reports.m4, confirmedByOpponent(p.caio, hoursAfter(r1Dates[3], 6)), { a: 46, b: 104 }) },
  { ...masc('r1-5', rounds.first, mb.t5, mb.t6), scheduled_at: r1Dates[4],
    ...confirmed(r1Reports.m5, confirmedByOpponent(p.gustavo, hoursAfter(r1Dates[4], 4)), { a: 104, b: 46 }) },
  { ...masc('r1-6', rounds.first, mb.t6, mb.t1), scheduled_at: r1Dates[5],
    ...confirmed(r1Reports.m6, confirmedByOpponent(p.henrique, hoursAfter(r1Dates[5], 3)), { a: 42, b: 108 }) },
];

// --- Masculino B, rodada 2: arbitragem, não realizada e cancelada ---

const r2Dates = {
  m1: onTheHour(daysAgo(35)),
  m2: onTheHour(daysAgo(30)),
  m3: onTheHour(daysAgo(27)),
  m6: onTheHour(daysAgo(22)),
};
const r2Reports = {
  // O Lucas lançou 7/6 para a T1; o André contestou e a Marina definiu 6/7.
  m1: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(7, 6)] }, p.lucas, hoursAfter(r2Dates.m1, 2)),
  m2: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 1)] }, p.andre, hoursAfter(r2Dates.m2, 2)),
  m3: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 4)] }, p.rafael, hoursAfter(r2Dates.m3, 2)),
  m6: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 0)] }, p.pedro, hoursAfter(r2Dates.m6, 1)),
};

const masculinoBRound2: RankingMatch[] = [
  { ...masc('r2-1', rounds.second, mb.t1, mb.t3), scheduled_at: r2Dates.m1,
    status: 'confirmed',
    result: { type: 'normal', winner: 'b', sets: [gameSet(6, 7)] },
    report: r2Reports.m1,
    confirmation: confirmedByAdmin(p.marina, daysAgo(33)),
    correction: null,
    points: { a: 48, b: 102 } },
  { ...masc('r2-2', rounds.second, mb.t3, mb.t5), scheduled_at: r2Dates.m2,
    ...confirmed(r2Reports.m2, confirmedByOpponent(p.eduardo, hoursAfter(r2Dates.m2, 4)), { a: 110, b: 40 }) },
  { ...masc('r2-3', rounds.second, mb.t1, mb.t5), scheduled_at: r2Dates.m3,
    ...confirmed(r2Reports.m3, confirmedByDeadline(r2Reports.m3, DEADLINE_HOURS), { a: 104, b: 46 }) },
  // Sem acordo de data: a proposta do Thiago nunca foi respondida. Está na
  // fila do admin, e o histórico é a evidência para o W.O. (R40).
  { ...masc('r2-4', rounds.second, mb.t2, mb.t4), scheduled_at: null, status: 'not_played' },
  { ...masc('r2-5', rounds.second, mb.t4, mb.t6), scheduled_at: null,
    status: 'cancelled', reason: 'not_played', cancellation: adminAction(p.marina, daysAgo(16)) },
  { ...masc('r2-6', rounds.second, mb.t2, mb.t6), scheduled_at: r2Dates.m6,
    ...confirmed(r2Reports.m6, confirmedByOpponent(p.gustavo, hoursAfter(r2Dates.m6, 3)), { a: 112, b: 38 }) },
];

// --- Masculino B, rodada 3 (em andamento): um exemplo de cada pendência ---

const r3Options = {
  m2: [
    { starts_at: onTheHour(daysFromNow(1)), venue: VENUE },
    { starts_at: onTheHour(daysFromNow(2)), venue: VENUE },
    { starts_at: onTheHour(daysFromNow(2.5)), venue: null },
  ],
  m3: [
    { starts_at: onTheHour(daysFromNow(1.2)), venue: VENUE },
    { starts_at: onTheHour(daysFromNow(2.2)), venue: VENUE },
  ],
  m4: [
    { starts_at: onTheHour(daysAgo(1)), venue: VENUE },
    { starts_at: onTheHour(daysAgo(0.5)), venue: VENUE },
  ],
} satisfies Record<string, ScheduleOption[]>;

const r3Reports = {
  m4: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 3)] }, p.rafael, hoursAfter(r3Options.m4[0].starts_at, 2)),
  m5: reportBy({ type: 'normal', winner: 'b', sets: [gameSet(4, 6)] }, p.caio, hoursAfter(onTheHour(daysAgo(4)), 2)),
  m6: reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 2)] }, p.felipe, hoursAfter(onTheHour(daysAgo(6)), 2)),
};

const masculinoBRound3: RankingMatch[] = [
  { ...masc('r3-1', rounds.third, mb.t1, mb.t4), scheduled_at: null, status: 'defined' },
  { ...masc('r3-2', rounds.third, mb.t2, mb.t5), scheduled_at: r3Options.m2[1].starts_at, status: 'defined' },
  { ...masc('r3-3', rounds.third, mb.t3, mb.t6), scheduled_at: null, status: 'defined' },
  { ...masc('r3-4', rounds.third, mb.t1, mb.t2), scheduled_at: r3Options.m4[0].starts_at,
    status: 'awaiting_confirmation', report: r3Reports.m4 },
  { ...masc('r3-5', rounds.third, mb.t3, mb.t4), scheduled_at: onTheHour(daysAgo(4)),
    status: 'in_arbitration', report: r3Reports.m5, contest: responseBy(p.andre, hoursAfter(r3Reports.m5.reported_at, 5)) },
  { ...masc('r3-6', rounds.third, mb.t5, mb.t6), scheduled_at: onTheHour(daysAgo(6)),
    ...confirmed(r3Reports.m6, confirmedByOpponent(p.henrique, hoursAfter(r3Reports.m6.reported_at, 3)), { a: 108, b: 42 }) },
];

// --- Mista C 40+: rodadas 1 e 2; a rodada 3 ainda não foi sorteada ---

// O sorteio da rodada 2 saiu depois que a Júlia se inscreveu com o Vinícius.
const MISTA_R2_DRAW = daysAgo(36);
const mxDates = [56, 53, 49, 44, 33, 29, 26, 21].map((n) => onTheHour(daysAgo(n)));
const mxReports = [
  reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 3)] }, p.marcos, hoursAfter(mxDates[0], 2)),
  reportBy({ type: 'normal', winner: 'b', sets: [gameSet(5, 7)] }, p.sergio, hoursAfter(mxDates[1], 2)),
  reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 2)] }, p.carla, hoursAfter(mxDates[2], 2)),
  reportBy({ type: 'normal', winner: 'b', sets: [gameSet(4, 6)] }, p.ana, hoursAfter(mxDates[3], 2)),
  reportBy({ type: 'normal', winner: 'b', sets: [gameSet(4, 6)] }, p.sergio, hoursAfter(mxDates[4], 2)),
  reportBy({ type: 'normal', winner: 'a', sets: [gameSet(6, 1)] }, p.carla, hoursAfter(mxDates[5], 2)),
  reportBy({ type: 'normal', winner: 'a', sets: [gameSet(7, 6)] }, p.vinicius, hoursAfter(mxDates[6], 2)),
  reportBy({ type: 'normal', winner: 'b', sets: [gameSet(3, 6)] }, p.ana, hoursAfter(mxDates[7], 2)),
];

const mistaMatches: RankingMatch[] = [
  { ...mista('r1-1', rounds.first, mx.m1, mx.m2), scheduled_at: mxDates[0],
    ...confirmed(mxReports[0], confirmedByOpponent(p.paulo, hoursAfter(mxDates[0], 4)), { a: 106, b: 44 }) },
  { ...mista('r1-2', rounds.first, mx.m2, mx.m3), scheduled_at: mxDates[1],
    ...confirmed(mxReports[1], confirmedByDeadline(mxReports[1], DEADLINE_HOURS), { a: 46, b: 104 }) },
  { ...mista('r1-3', rounds.first, mx.m3, mx.m4), scheduled_at: mxDates[2],
    ...confirmed(mxReports[2], confirmedByOpponent(p.julia, hoursAfter(mxDates[2], 5)), { a: 108, b: 42 }) },
  { ...mista('r1-4', rounds.first, mx.m4, mx.m1), scheduled_at: mxDates[3],
    ...confirmed(mxReports[3], confirmedByOpponent(p.roberto, hoursAfter(mxDates[3], 3)), { a: 46, b: 104 }) },
  // Com a M4 encerrada, sobram quatro duplas: repetir M2 × M1 é inevitável (R30).
  { ...mista('r2-1', rounds.second, mx.m1, mx.m3, MISTA_R2_DRAW), scheduled_at: mxDates[4],
    ...confirmed(mxReports[4], confirmedByOpponent(p.marcos, hoursAfter(mxDates[4], 4)), { a: 46, b: 104 }) },
  { ...mista('r2-2', rounds.second, mx.m3, mx.m5, MISTA_R2_DRAW), scheduled_at: mxDates[5],
    ...confirmed(mxReports[5], confirmedByDeadline(mxReports[5], DEADLINE_HOURS), { a: 110, b: 40 }) },
  { ...mista('r2-3', rounds.second, mx.m5, mx.m2, MISTA_R2_DRAW), scheduled_at: mxDates[6],
    ...confirmed(mxReports[6], confirmedByOpponent(p.beatriz, hoursAfter(mxDates[6], 6)), { a: 102, b: 48 }) },
  { ...mista('r2-4', rounds.second, mx.m2, mx.m1, MISTA_R2_DRAW), scheduled_at: mxDates[7],
    ...confirmed(mxReports[7], confirmedByOpponent(p.paulo, hoursAfter(mxDates[7], 5)), { a: 44, b: 106 }) },
];

export const rankingMatches: RankingMatch[] = [
  ...masculinoBRound1,
  ...masculinoBRound2,
  ...masculinoBRound3,
  ...mistaMatches,
];

function matchId(slug: string): string {
  return `match-arena-rm-mb-${slug}`;
}

export const scheduleProposals: ScheduleProposal[] = [
  {
    id: 'proposal-mb-r2-4',
    match_id: matchId('r2-4'),
    proposed_by: p.thiago.id,
    created_at: daysAgo(34),
    options: [
      { starts_at: onTheHour(daysAgo(31)), venue: VENUE },
      { starts_at: onTheHour(daysAgo(29)), venue: VENUE },
      { starts_at: onTheHour(daysAgo(26)), venue: null },
    ],
    status: 'pending',
  },
  {
    id: 'proposal-mb-r3-2',
    match_id: matchId('r3-2'),
    proposed_by: p.pedro.id,
    created_at: daysAgo(15),
    options: [r3Options.m2[0], r3Options.m2[1], r3Options.m2[2]],
    status: 'accepted',
    accepted_option_index: 1,
    responded_by: p.eduardo.id,
    responded_at: daysAgo(14),
  },
  {
    id: 'proposal-mb-r3-3',
    match_id: matchId('r3-3'),
    proposed_by: p.gustavo.id,
    created_at: hoursAgo(20),
    options: [r3Options.m3[0], r3Options.m3[1]],
    status: 'pending',
  },
  {
    id: 'proposal-mb-r3-4',
    match_id: matchId('r3-4'),
    proposed_by: p.lucas.id,
    created_at: daysAgo(12),
    options: [r3Options.m4[0], r3Options.m4[1]],
    status: 'accepted',
    accepted_option_index: 0,
    responded_by: p.thiago.id,
    responded_at: daysAgo(11),
  },
];
