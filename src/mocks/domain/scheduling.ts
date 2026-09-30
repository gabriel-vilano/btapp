import type {
  PlayerPhone,
  ReportedScheduleDate,
  ScheduleHistory,
  ScheduleOption,
  ScheduleProposal,
} from '@/src/types/domain';
import { daysAgo, daysFromNow, hoursAgo, onTheHour } from '../relativeTime';
import { hoursAfter } from './builders';
import { players as p } from './people';

// Marcação dos confrontos do Masculino B (docs/SCHEDULING.md). Cada confronto
// conta uma história, e juntos cobrem todos os status da proposta:
//
// - r2-4 (não realizada): a T2 propôs duas vezes, a T4 nunca respondeu e as
//   duas propostas expiraram. É a evidência que o admin vê (M17).
// - r3-1 (sem data): proposta expirada, contraproposta (M9) e retirada (M10).
// - r3-2 (data acordada): proposta aceita, jogo daqui a 2 dias.
// - r3-3 (data passou sem resultado): o jogo aceito era ontem e não saiu; a T6
//   propôs novos horários, e a data acordada vale até alguém aceitar (M13).
// - r3-4 (aguardando confirmação): o resultado foi lançado com uma remarcação
//   pendente, que o sistema encerrou como retirada.
// - r3-5 (em arbitragem): a data foi combinada no WhatsApp e informada pelo
//   Diego (M14), o que substituiu a proposta do André (M15).

export const RANKING_VENUE = 'Arena Mangaba – Beach · Nova Lima/MG';

const at = (iso: string, venue: string | null = RANKING_VENUE): ScheduleOption => ({
  starts_at: onTheHour(iso),
  venue,
});

const matchId = (slug: string): string => `match-arena-mangaba-mb-${slug}`;

/** Encerramento da proposta expirada: o horário da última opção (M12). */
const lastStart = (options: ScheduleOption[]): string =>
  options.reduce((latest, option) => (option.starts_at > latest ? option.starts_at : latest), '');

/** Data acordada de cada confronto, lida pelas partidas (`scheduled_at`). */
export const agreedDates = {
  r3_2: at(daysFromNow(2)).starts_at,
  r3_3: at(daysAgo(1)).starts_at,
  r3_4: at(daysAgo(1)).starts_at,
  r3_5: at(daysAgo(4)).starts_at,
};

/** O resultado da r3-4 foi lançado 2h depois do jogo. */
export const r3_4ReportedAt = hoursAfter(agreedDates.r3_4, 2);

// Momentos compartilhados entre a proposta substituída e o seu substituto.
const R3_1_COUNTER_AT = daysAgo(4);
const R3_5_REPORTED_AT = daysAgo(7);

const options = {
  r2_4_1: [at(daysAgo(31)), at(daysAgo(29)), at(daysAgo(26), null)],
  r2_4_2: [at(daysAgo(21)), at(daysAgo(20))],
  r3_1_1: [at(daysAgo(14)), at(daysAgo(13))],
} satisfies Record<string, ScheduleOption[]>;

const expiredR2: ScheduleProposal[] = [
  {
    id: 'proposal-mb-r2-4-1',
    match_id: matchId('r2-4'),
    side: 'a',
    proposed_by: p.thiago.id,
    created_at: daysAgo(34),
    options: [options.r2_4_1[0], options.r2_4_1[1], options.r2_4_1[2]],
    status: 'expired',
    closed_at: lastStart(options.r2_4_1),
  },
  {
    id: 'proposal-mb-r2-4-2',
    match_id: matchId('r2-4'),
    side: 'a',
    proposed_by: p.pedro.id,
    created_at: daysAgo(24),
    options: [options.r2_4_2[0], options.r2_4_2[1]],
    status: 'expired',
    closed_at: lastStart(options.r2_4_2),
  },
];

const noDateR3: ScheduleProposal[] = [
  {
    id: 'proposal-mb-r3-1-1',
    match_id: matchId('r3-1'),
    side: 'a',
    proposed_by: p.lucas.id,
    created_at: daysAgo(16),
    options: [options.r3_1_1[0], options.r3_1_1[1]],
    status: 'expired',
    closed_at: lastStart(options.r3_1_1),
  },
  {
    id: 'proposal-mb-r3-1-2',
    match_id: matchId('r3-1'),
    side: 'b',
    proposed_by: p.diego.id,
    created_at: daysAgo(5),
    options: [at(daysFromNow(1)), at(daysFromNow(2))],
    status: 'superseded',
    superseded_by: { kind: 'proposal', proposal_id: 'proposal-mb-r3-1-3' },
    closed_at: R3_1_COUNTER_AT,
  },
  // O Rafael contrapropôs, e o Lucas, parceiro dele, retirou (M10).
  {
    id: 'proposal-mb-r3-1-3',
    match_id: matchId('r3-1'),
    side: 'a',
    proposed_by: p.rafael.id,
    created_at: R3_1_COUNTER_AT,
    options: [at(daysFromNow(1.5)), at(daysFromNow(2.5), 'Arena Tucum · Belo Horizonte/MG')],
    status: 'withdrawn',
    withdrawal: { by: 'player', player_id: p.lucas.id },
    closed_at: daysAgo(2),
  },
];

const agreedR3: ScheduleProposal[] = [
  {
    id: 'proposal-mb-r3-2',
    match_id: matchId('r3-2'),
    side: 'a',
    proposed_by: p.pedro.id,
    created_at: daysAgo(15),
    options: [at(daysFromNow(1)), { starts_at: agreedDates.r3_2, venue: RANKING_VENUE }, at(daysFromNow(2.5), null)],
    status: 'accepted',
    accepted_option_index: 1,
    responded_by: p.eduardo.id,
    responded_at: daysAgo(14),
  },
  {
    id: 'proposal-mb-r3-3-1',
    match_id: matchId('r3-3'),
    side: 'a',
    proposed_by: p.bruno.id,
    created_at: daysAgo(10),
    options: [at(daysAgo(1.5)), { starts_at: agreedDates.r3_3, venue: RANKING_VENUE }],
    status: 'accepted',
    accepted_option_index: 1,
    responded_by: p.henrique.id,
    responded_at: daysAgo(9),
  },
  {
    id: 'proposal-mb-r3-3-2',
    match_id: matchId('r3-3'),
    side: 'b',
    proposed_by: p.gustavo.id,
    created_at: hoursAgo(20),
    options: [at(daysFromNow(1.2)), at(daysFromNow(2.2))],
    status: 'pending',
  },
];

const frozenR3: ScheduleProposal[] = [
  {
    id: 'proposal-mb-r3-4-1',
    match_id: matchId('r3-4'),
    side: 'a',
    proposed_by: p.lucas.id,
    created_at: daysAgo(12),
    options: [{ starts_at: agreedDates.r3_4, venue: RANKING_VENUE }, at(daysAgo(0.5))],
    status: 'accepted',
    accepted_option_index: 0,
    responded_by: p.thiago.id,
    responded_at: daysAgo(11),
  },
  // O Thiago pediu para remarcar, mas o jogo saiu na data acordada. O
  // lançamento do resultado encerrou a remarcação pendente.
  {
    id: 'proposal-mb-r3-4-2',
    match_id: matchId('r3-4'),
    side: 'b',
    proposed_by: p.thiago.id,
    created_at: daysAgo(3),
    options: [at(daysFromNow(1)), at(daysFromNow(2))],
    status: 'withdrawn',
    withdrawal: { by: 'system', reason: 'result_reported' },
    closed_at: r3_4ReportedAt,
  },
  {
    id: 'proposal-mb-r3-5',
    match_id: matchId('r3-5'),
    side: 'a',
    proposed_by: p.andre.id,
    created_at: daysAgo(9),
    options: [at(daysAgo(3.5)), at(daysAgo(3)), at(daysAgo(2.5))],
    status: 'superseded',
    superseded_by: { kind: 'reported_date', reported_date_id: 'reported-date-mb-r3-5' },
    closed_at: R3_5_REPORTED_AT,
  },
];

export const scheduleProposals: ScheduleProposal[] = [...expiredR2, ...noDateR3, ...agreedR3, ...frozenR3];

export const reportedScheduleDates: ReportedScheduleDate[] = [
  {
    id: 'reported-date-mb-r3-5',
    match_id: matchId('r3-5'),
    reported_by: p.diego.id,
    reported_at: R3_5_REPORTED_AT,
    starts_at: agreedDates.r3_5,
    venue: RANKING_VENUE,
  },
];

// Números fictícios. Só três jogadores informaram o telefone (M20).
export const playerPhones: PlayerPhone[] = [
  { player_id: p.lucas.id, number: '+5531999990001', consented_at: daysAgo(20) },
  { player_id: p.gustavo.id, number: '+5531999990002', consented_at: daysAgo(3) },
  { player_id: p.diego.id, number: '+5531999990003', consented_at: daysAgo(8) },
];

/** Histórico da marcação de um confronto. Ex.: `scheduleHistoryOf('match-arena-mangaba-mb-r2-4')`. */
export function scheduleHistoryOf(matchId: string): ScheduleHistory {
  return {
    match_id: matchId,
    proposals: scheduleProposals.filter((proposal) => proposal.match_id === matchId),
    reported_dates: reportedScheduleDates.filter((reported) => reported.match_id === matchId),
  };
}
