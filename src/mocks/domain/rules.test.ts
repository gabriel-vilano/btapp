import { describe, expect, it } from 'vitest';
import type { CompetitionMatch, CompetitionResult, Match, ResultReport } from '@/src/types/domain';
import { confirmationTime, hoursAfter } from './builders';
import { mockDomain } from './index';
import {
  byId,
  competitionMatches,
  get,
  isAdminOf,
  rankingMatches,
  sideOf,
  sidesOf,
  time,
} from './integrity.test-utils';

// Coerência dos mocks com as regras de docs/DOMAIN.md. Mock incoerente vira
// teste falso-positivo nas issues que dependem dele (pontuação, estados,
// contagens, sorteio, classificação).

describe('mocks de domínio: quem compete', () => {
  it('a dupla é o par: nenhum par repetido e ninguém em dupla consigo (R2)', () => {
    const pairs = mockDomain.units
      .filter((unit) => unit.modality === 'doubles')
      .map((unit) => [...unit.player_ids].sort().join('+'));
    expect(new Set(pairs).size).toBe(pairs.length);
    for (const pair of pairs) expect(new Set(pair.split('+')).size).toBe(2);
  });

  it('modalidade da unidade é a da categoria (R3)', () => {
    for (const enrollment of mockDomain.enrollments) {
      const unit = get(byId.units, enrollment.unit_id);
      expect(unit.modality, enrollment.id).toBe(get(byId.categories, enrollment.category_id).modality);
    }
  });

  it('uma inscrição ativa por unidade, categoria e temporada', () => {
    const keys = mockDomain.enrollments
      .filter((enrollment) => enrollment.status === 'active')
      .map((enrollment) => `${enrollment.unit_id}|${enrollment.category_id}|${enrollment.season_id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('idade da categoria conta pelo ano de nascimento (R33)', () => {
    for (const enrollment of mockDomain.enrollments) {
      const { min_age } = get(byId.categories, enrollment.category_id);
      if (min_age === null) continue;
      const seasonYear = new Date(get(byId.seasons, enrollment.season_id ?? '').starts_on).getUTCFullYear();
      for (const playerId of get(byId.units, enrollment.unit_id).player_ids) {
        const { birth_date } = get(byId.players, playerId);
        if (birth_date) expect(seasonYear - Number(birth_date.slice(0, 4)), playerId).toBeGreaterThanOrEqual(min_age);
      }
    }
  });

  it('amistoso junta unidades da mesma modalidade (R44)', () => {
    for (const match of mockDomain.matches) {
      if (match.kind !== 'friendly') continue;
      const a = get(byId.units, match.side_a_unit_id);
      expect(a.modality, match.id).toBe(get(byId.units, match.side_b_unit_id).modality);
    }
  });
});

describe('mocks de domínio: ciclo do resultado', () => {
  it.each(mockDomain.matches.map((match) => [match.id, match] as const))(
    '%s: quem lança e quem responde estão no lugar certo (R13, R38)',
    (_id, match) => {
      const report = reportOf(match);
      if (!report) return;
      if (match.kind === 'tournament') expect(isAdminOf(match.competition_id, report.reported_by)).toBe(true);
      else expect(sideOf(match, report.reported_by)).not.toBeNull();
      const responder = responderOf(match);
      if (responder) expect(sideOf(match, responder)).toBe(otherSide(sideOf(match, report.reported_by)));
    },
  );

  it.each(competitionMatches.map((match) => [match.id, match] as const))(
    '%s: todo ato de admin é de um admin da competição (R15)',
    (_id, match) => {
      if (match.status === 'confirmed' && match.confirmation.via === 'admin') {
        expect(isAdminOf(match.competition_id, match.confirmation.admin_id)).toBe(true);
      }
      if (match.status === 'cancelled') expect(isAdminOf(match.competition_id, match.cancellation.admin_id)).toBe(true);
    },
  );

  it('W.O. duplo só vem da decisão do admin, sem lançamento (R36)', () => {
    for (const match of competitionMatches) {
      if (match.status !== 'confirmed' || match.result.type !== 'double_wo') continue;
      expect(match.report, match.id).toBeNull();
      expect(match.confirmation.via, match.id).toBe('admin');
    }
  });

  it('confirmação pelo prazo sai exatamente no fim do prazo do ranking (R14)', () => {
    for (const match of rankingMatches) {
      if (match.status !== 'confirmed' || match.confirmation.via !== 'deadline') continue;
      const hours = rankingDeadlineHours(match);
      expect(match.confirmation.confirmed_at).toBe(hoursAfter(match.report?.reported_at ?? '', hours));
    }
  });

  it('partida aguardando confirmação ainda está dentro do prazo (R14)', () => {
    for (const match of rankingMatches) {
      if (match.status !== 'awaiting_confirmation') continue;
      expect(time(hoursAfter(match.report.reported_at, rankingDeadlineHours(match)))).toBeGreaterThan(Date.now());
    }
  });

  it('só há partida não realizada ou sem resultado depois do prazo da rodada quando é "not_played" (R40)', () => {
    for (const match of rankingMatches) {
      const deadlinePassed = time(get(byId.rounds, match.round_id).deadline) < Date.now();
      if (match.status === 'not_played') expect(deadlinePassed, match.id).toBe(true);
      if (match.status === 'defined') expect(deadlinePassed, match.id).toBe(false);
    }
  });

  it('só ranking confirmado tem pontos; torneio não pontua (R8, R38)', () => {
    for (const match of competitionMatches) {
      if (match.status !== 'confirmed') continue;
      if (match.kind === 'tournament') expect(match.points).toBeNull();
      if (match.kind === 'ranking' && match.result.type === 'wo') {
        expect([match.points.a, match.points.b].sort()).toEqual([0, 100]); // R10
      }
    }
  });
});

describe('mocks de domínio: linha do tempo', () => {
  it.each(competitionMatches.map((match) => [match.id, match] as const))(
    '%s: sorteio depois da inscrição e dentro da rodada; nada antes do sorteio',
    (_id, match) => {
      for (const side of sidesOf(match)) {
        expect(time(match.created_at)).toBeGreaterThanOrEqual(time(side.enrolled_at));
        if (side.status === 'closed') expect(time(match.created_at)).toBeLessThan(time(side.closed_at));
      }
      if (match.kind === 'ranking') {
        const round = get(byId.rounds, match.round_id);
        expect(time(match.created_at)).toBeGreaterThanOrEqual(time(round.starts_at));
        expect(time(match.created_at)).toBeLessThan(time(round.deadline));
      }
      const report = reportOf(match);
      if (report) expect(time(report.reported_at)).toBeGreaterThanOrEqual(time(match.created_at));
      if (match.status === 'confirmed' && report) {
        expect(time(confirmationTime(match.confirmation))).toBeGreaterThanOrEqual(time(report.reported_at));
      }
    },
  );

});

function reportOf(match: Match): ResultReport<CompetitionResult> | null {
  if (match.kind === 'friendly') return match.report;
  if ('report' in match) return match.report;
  return null;
}

function responderOf(match: Match): string | null {
  if (match.kind === 'friendly') return 'response' in match ? match.response.responded_by : null;
  if (match.status === 'in_arbitration') return match.contest.responded_by;
  if (match.status === 'confirmed' && match.confirmation.via === 'opponent') return match.confirmation.responded_by;
  return null;
}

function otherSide(side: 'a' | 'b' | null): 'a' | 'b' | null {
  if (side === null) return null;
  return side === 'a' ? 'b' : 'a';
}

function rankingDeadlineHours(match: CompetitionMatch): number {
  const competition = get(byId.competitions, match.competition_id);
  if (competition.type !== 'ranking') throw new Error(`'${match.id}' não é de ranking`);
  return competition.response_deadline_hours;
}
