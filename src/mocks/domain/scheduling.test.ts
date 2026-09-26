import { describe, expect, it } from 'vitest';
import type {
  Match,
  RankingMatch,
  ReportedScheduleDate,
  ScheduleProposal,
  ScheduleReplacement,
} from '@/src/types/domain';
import { mockDomain } from './index';
import { byId, get, sideOf, time } from './integrity.test-utils';
import { scheduleHistoryOf } from './scheduling';

// Coerência da marcação mockada com docs/SCHEDULING.md (M1…M25). As issues
// de regras da marcação e da tela do confronto partem destes mocks.

const { scheduleProposals, reportedScheduleDates, playerPhones } = mockDomain;

describe('mocks da marcação: proposta', () => {
  it.each(scheduleProposals.map((proposal) => [proposal.id, proposal] as const))(
    '%s: do lado de quem enviou, 2 a 3 opções distintas, futuras e antes do prazo (M2, M5, M6)',
    (_id, proposal) => {
      const match = rankingMatchOf(proposal.match_id);
      expect(sideOf(match, proposal.proposed_by)).toBe(proposal.side);
      expect(time(proposal.created_at)).toBeGreaterThanOrEqual(time(match.created_at));
      const starts = proposal.options.map((option) => option.starts_at);
      expect(new Set(starts).size).toBe(starts.length);
      const deadline = time(get(byId.rounds, match.round_id).deadline);
      for (const start of starts) {
        expect(time(start)).toBeGreaterThan(time(proposal.created_at));
        expect(time(start)).toBeLessThan(deadline);
      }
    },
  );

  it('aceite é do outro lado, antes do horário da opção aceita (M3, M4, M12)', () => {
    for (const proposal of scheduleProposals) {
      if (proposal.status !== 'accepted') continue;
      const match = rankingMatchOf(proposal.match_id);
      expect(sideOf(match, proposal.responded_by), proposal.id).toBe(proposal.side === 'a' ? 'b' : 'a');
      const accepted = proposal.options[proposal.accepted_option_index];
      expect(accepted, proposal.id).toBeDefined();
      expect(time(proposal.responded_at)).toBeGreaterThan(time(proposal.created_at));
      expect(time(proposal.responded_at)).toBeLessThan(time(accepted?.starts_at ?? ''));
    }
  });

  it('pendente só em "Confronto definido", uma por confronto e com opção ainda aceitável (M1, M8, M12)', () => {
    const pending = scheduleProposals.filter((proposal) => proposal.status === 'pending');
    for (const proposal of pending) {
      expect(rankingMatchOf(proposal.match_id).status, proposal.id).toBe('defined');
      expect(proposal.options.some((option) => time(option.starts_at) > Date.now()), proposal.id).toBe(true);
    }
    const matchIds = pending.map((proposal) => proposal.match_id);
    expect(new Set(matchIds).size).toBe(matchIds.length);
  });

  it('expirada fecha no horário da última opção (M12)', () => {
    for (const proposal of scheduleProposals) {
      if (proposal.status !== 'expired') continue;
      const last = Math.max(...proposal.options.map((option) => time(option.starts_at)));
      expect(time(proposal.closed_at), proposal.id).toBe(last);
    }
  });

  it('substituída fecha quando o substituto do mesmo confronto é registrado (M9, M15)', () => {
    for (const proposal of scheduleProposals) {
      if (proposal.status !== 'superseded') continue;
      const replacement = replacementOf(proposal.superseded_by);
      expect(replacement.match_id, proposal.id).toBe(proposal.match_id);
      expect(proposal.closed_at, proposal.id).toBe(recordedAt(replacement));
    }
  });

  it('retirada: por jogador do lado que propôs, ou pelo sistema quando a partida saiu do confronto (M10)', () => {
    for (const proposal of scheduleProposals) {
      if (proposal.status !== 'withdrawn') continue;
      const match = rankingMatchOf(proposal.match_id);
      if (proposal.withdrawal.by === 'player') {
        expect(sideOf(match, proposal.withdrawal.player_id), proposal.id).toBe(proposal.side);
        continue;
      }
      expect(match.status, proposal.id).not.toBe('defined');
      if (proposal.withdrawal.reason === 'result_reported' && 'report' in match) {
        expect(proposal.closed_at, proposal.id).toBe(match.report?.reported_at);
      }
    }
  });
});

describe('mocks da marcação: data do confronto', () => {
  it('data informada é de um jogador do confronto (M14)', () => {
    for (const reported of reportedScheduleDates) {
      const match = rankingMatchOf(reported.match_id);
      expect(sideOf(match, reported.reported_by), reported.id).not.toBeNull();
      expect(time(reported.reported_at)).toBeGreaterThanOrEqual(time(match.created_at));
    }
  });

  it('data acordada é a do acordo mais recente: aceite ou data informada (M11, M13, M14)', () => {
    const matchIds = new Set([...scheduleProposals, ...reportedScheduleDates].map((record) => record.match_id));
    for (const matchId of matchIds) {
      const latest = latestAgreement(matchId);
      const match = rankingMatchOf(matchId);
      expect(match.scheduled_at, matchId).toBe(latest?.starts_at ?? null);
    }
  });

  it('histórico do confronto junta propostas e datas informadas (M16)', () => {
    const history = scheduleHistoryOf('match-arena-rm-mb-r3-1');
    expect(history.proposals.map((proposal) => proposal.status)).toEqual(['expired', 'superseded', 'withdrawn']);
    expect(history.reported_dates).toEqual([]);
  });

  it('os mocks cobrem todos os status e a remarcação', () => {
    const statuses = new Set(scheduleProposals.map((proposal) => proposal.status));
    expect([...statuses].sort()).toEqual(['accepted', 'expired', 'pending', 'superseded', 'withdrawn']);
    const rescheduling = scheduleProposals.some(
      (proposal) => proposal.status === 'pending' && rankingMatchOf(proposal.match_id).scheduled_at !== null,
    );
    expect(rescheduling).toBe(true);
    expect(reportedScheduleDates.length).toBeGreaterThan(0);
  });
});

describe('mocks da marcação: telefone', () => {
  it('telefone em E.164 e sempre com consentimento (M21)', () => {
    for (const phone of playerPhones) {
      expect(phone.number, phone.player_id).toMatch(/^\+[1-9]\d{7,14}$/);
      expect(Number.isNaN(time(phone.consented_at)), phone.player_id).toBe(false);
    }
  });
});

function rankingMatchOf(matchId: string): RankingMatch {
  const match: Match = get(byId.matches, matchId);
  if (match.kind !== 'ranking') throw new Error(`marcação só existe no ranking (M1): '${matchId}' é '${match.kind}'`);
  return match;
}

function replacementOf(replacement: ScheduleReplacement): ScheduleProposal | ReportedScheduleDate {
  if (replacement.kind === 'proposal') {
    return get(new Map(scheduleProposals.map((proposal) => [proposal.id, proposal])), replacement.proposal_id);
  }
  return get(new Map(reportedScheduleDates.map((reported) => [reported.id, reported])), replacement.reported_date_id);
}

function recordedAt(record: ScheduleProposal | ReportedScheduleDate): string {
  return 'reported_at' in record ? record.reported_at : record.created_at;
}

interface Agreement {
  starts_at: string;
  agreed_at: string;
}

function latestAgreement(matchId: string): Agreement | null {
  const { proposals, reported_dates } = scheduleHistoryOf(matchId);
  const agreements: Agreement[] = [
    ...proposals.flatMap((proposal) =>
      proposal.status === 'accepted'
        ? [{ starts_at: proposal.options[proposal.accepted_option_index]?.starts_at ?? '', agreed_at: proposal.responded_at }]
        : [],
    ),
    ...reported_dates.map((reported) => ({ starts_at: reported.starts_at, agreed_at: reported.reported_at })),
  ];
  agreements.sort((first, second) => time(first.agreed_at) - time(second.agreed_at));
  return agreements.at(-1) ?? null;
}
