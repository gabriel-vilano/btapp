import type {
  PendingScheduleProposal,
  ScheduleHistory,
  ScheduleOption,
  ScheduleProposal,
} from '@/src/types/domain';

// Leituras do histórico da marcação. O histórico é a fonte: a data acordada da
// partida (`scheduled_at`, `venue`) é derivada dele, não guardada à parte.

/** A proposta pendente do confronto, se houver. Há no máximo uma (M8). */
export function pendingProposalOf(history: ScheduleHistory): PendingScheduleProposal | null {
  return history.proposals.find((proposal) => proposal.status === 'pending') ?? null;
}

/** Uma opção só pode ser aceita antes do horário dela (M12). */
export function isOptionOpen(option: ScheduleOption, at: string): boolean {
  return Date.parse(option.starts_at) > Date.parse(at);
}

/** Horário da última opção: é quando a proposta sem aceite expira (M12). */
export function lastOptionStart(proposal: ScheduleProposal): string {
  const times = proposal.options.map((option) => Date.parse(option.starts_at));
  return new Date(Math.max(...times)).toISOString();
}

/** Como a data acordada foi definida: proposta aceita (M11) ou data informada (M14). */
export type AgreedScheduleSource =
  | { kind: 'proposal'; proposal_id: string; accepted_by: string }
  | { kind: 'reported_date'; reported_date_id: string; reported_by: string };

export interface AgreedSchedule {
  starts_at: string; // ISO 8601
  venue: string | null;
  agreed_at: string; // ISO 8601: aceite da proposta ou registro da data informada
  source: AgreedScheduleSource;
}

/**
 * Data acordada do confronto: a do aceite ou da data informada mais recente.
 * Uma remarcação pendente não muda nada até ser aceita (M13).
 */
export function agreedScheduleOf(history: ScheduleHistory): AgreedSchedule | null {
  const candidates = [...acceptedSchedules(history), ...reportedSchedules(history)];
  return candidates.reduce<AgreedSchedule | null>(
    (latest, candidate) => (latest === null || isAfter(candidate.agreed_at, latest.agreed_at) ? candidate : latest),
    null,
  );
}

function acceptedSchedules(history: ScheduleHistory): AgreedSchedule[] {
  return history.proposals.flatMap((proposal) => {
    if (proposal.status !== 'accepted') return [];
    const option = proposal.options[proposal.accepted_option_index];
    if (option === undefined) return [];
    const source = { kind: 'proposal' as const, proposal_id: proposal.id, accepted_by: proposal.responded_by };
    return [{ starts_at: option.starts_at, venue: option.venue, agreed_at: proposal.responded_at, source }];
  });
}

function reportedSchedules(history: ScheduleHistory): AgreedSchedule[] {
  return history.reported_dates.map((reported) => ({
    starts_at: reported.starts_at,
    venue: reported.venue,
    agreed_at: reported.reported_at,
    source: { kind: 'reported_date', reported_date_id: reported.id, reported_by: reported.reported_by },
  }));
}

function isAfter(a: string, b: string): boolean {
  return Date.parse(a) > Date.parse(b);
}

/**
 * Expira a proposta pendente cujas opções já passaram todas (M12). A expiração
 * fica datada no horário da última opção, não na hora em que rodou. As ações da
 * marcação chamam antes de agir: a proposta já expirou mesmo que a rotina
 * automática ainda não tenha rodado.
 */
export function expireProposals(history: ScheduleHistory, at: string): ScheduleHistory {
  const pending = pendingProposalOf(history);
  if (pending === null || pending.options.some((option) => isOptionOpen(option, at))) return history;
  return replaceProposal(history, { ...proposalBase(pending), status: 'expired', closed_at: lastOptionStart(pending) });
}

/** Troca a proposta de mesmo id no histórico. Nada é apagado (M16). */
export function replaceProposal(history: ScheduleHistory, updated: ScheduleProposal): ScheduleHistory {
  const proposals = history.proposals.map((proposal) => (proposal.id === updated.id ? updated : proposal));
  return { ...history, proposals };
}

/**
 * Campos comuns da proposta, sem os do estado. Espalhar a proposta inteira
 * levaria junto campos do estado anterior, que o tipo não enxerga mas o banco
 * gravaria (mesmo cuidado do `matchBase` da máquina de estados da partida).
 */
export function proposalBase(proposal: ScheduleProposal): Omit<PendingScheduleProposal, 'status'> {
  return {
    id: proposal.id,
    match_id: proposal.match_id,
    side: proposal.side,
    proposed_by: proposal.proposed_by,
    created_at: proposal.created_at,
    options: proposal.options,
  };
}
