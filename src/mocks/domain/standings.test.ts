import { describe, expect, it } from 'vitest';
import type { FeedEvent, RankingMatch, Round, StandingSnapshot } from '@/src/types/domain';
import { confirmationTime } from './builders';
import { mockDomain } from './index';
import { byId, enrollmentPlayers, get, rankingMatches, roundsUpTo, sidePlayers, time } from './integrity.test-utils';

// Foto da classificação, marcos e eventos do feed batem com as partidas.

function pointsUpTo(enrollmentId: string, round: Round): number {
  const roundIds = new Set(roundsUpTo(round).map((r) => r.id));
  return rankingMatches
    .filter((match) => roundIds.has(match.round_id))
    .reduce((sum, match) => sum + pointsFor(match, enrollmentId, round.deadline), 0);
}

function pointsFor(match: RankingMatch, enrollmentId: string, deadline: string): number {
  if (match.status !== 'confirmed') return 0;
  // Confirmada depois do prazo entra na rodada seguinte (R46)
  if (time(confirmationTime(match.confirmation)) > time(deadline)) return 0;
  if (match.side_a_enrollment_id === enrollmentId) return match.points.a;
  if (match.side_b_enrollment_id === enrollmentId) return match.points.b;
  return 0;
}

function photoOf(roundId: string, categoryId: string): StandingSnapshot[] {
  return mockDomain.standingSnapshots
    .filter((s) => s.round_id === roundId && s.category_id === categoryId)
    .sort((a, b) => a.position - b.position);
}

function positionAt(enrollmentId: string, roundId: string): number | null {
  const snapshot = mockDomain.standingSnapshots.find((s) => s.enrollment_id === enrollmentId && s.round_id === roundId);
  return snapshot?.position ?? null;
}

const photos = [...new Set(mockDomain.standingSnapshots.map((s) => `${s.round_id}|${s.category_id}`))].map(
  (key) => key.split('|') as [string, string],
);

describe('mocks de domínio: foto da classificação (R46)', () => {
  it.each(photos)('%s / %s: posições 1..n, pontos decrescentes e sem empate', (roundId, categoryId) => {
    const photo = photoOf(roundId, categoryId);
    expect(photo.map((s) => s.position)).toEqual(photo.map((_, index) => index + 1));
    for (let i = 1; i < photo.length; i++) expect(photo[i].points).toBeLessThan(photo[i - 1].points);
  });

  it.each(photos)('%s / %s: pontos = soma das partidas confirmadas até o prazo (R8)', (roundId, categoryId) => {
    const round = get(byId.rounds, roundId);
    for (const snapshot of photoOf(roundId, categoryId)) {
      expect(snapshot.points, snapshot.enrollment_id).toBe(pointsUpTo(snapshot.enrollment_id, round));
    }
  });

  it.each(photos)('%s / %s: toda inscrição da categoria está na foto, encerrada inclusive (R45)', (roundId, categoryId) => {
    const round = get(byId.rounds, roundId);
    const expected = mockDomain.enrollments
      .filter((e) => e.category_id === categoryId && time(e.enrolled_at) <= time(round.deadline))
      .map((e) => e.id)
      .sort();
    expect(photoOf(roundId, categoryId).map((s) => s.enrollment_id).sort()).toEqual(expected);
  });
});

describe('mocks de domínio: marcos (R47)', () => {
  it.each(mockDomain.milestones.map((m) => [m.id, m] as const))('%s: é a primeira vez na temporada', (_id, milestone) => {
    const round = get(byId.rounds, milestone.round_id);
    const limit = milestone.type === 'leader' ? 1 : milestone.n;
    const reached = (roundId: string) => (positionAt(milestone.enrollment_id, roundId) ?? Infinity) <= limit;
    expect(reached(round.id)).toBe(true);
    const earlier = roundsUpTo(round).filter((r) => r.number < round.number);
    expect(earlier.some((r) => reached(r.id))).toBe(false);
    expect(milestone.achieved_at).toBe(round.deadline);
  });

  it('Top N usa N = classificados da final', () => {
    for (const milestone of mockDomain.milestones) {
      if (milestone.type !== 'top_n') continue;
      expect(milestone.n).toBe(get(byId.seasons, milestone.season_id).final?.qualifiers);
    }
  });
});

describe('mocks de domínio: eventos do feed', () => {
  it('vêm do mais recente para o mais antigo e nenhum está no futuro', () => {
    const times = mockDomain.feedEvents.map((event) => time(event.created_at));
    expect(times).toEqual([...times].sort((a, b) => b - a));
    for (const t of times) expect(t).toBeLessThanOrEqual(Date.now());
  });

  it.each(mockDomain.feedEvents.map((event) => [event.id, event] as const))(
    '%s: atores e conteúdo batem com a origem',
    (_id, event) => {
      expect([...event.actor_ids].sort()).toEqual(expectedActors(event).sort());
    },
  );

  it('resultado só de partida confirmada (R16)', () => {
    for (const event of mockDomain.feedEvents) {
      if (event.type === 'result') expect(get(byId.matches, event.match_id).status).toBe('confirmed');
    }
  });

  it('movimentação compara a foto da rodada com a anterior; caiu é privado (R22, R46)', () => {
    for (const event of mockDomain.feedEvents) {
      if (event.type !== 'ranking_up' && event.type !== 'ranking_down') continue;
      const round = get(byId.rounds, event.round_id);
      const previous = mockDomain.rounds.find((r) => r.season_id === round.season_id && r.number === round.number - 1);
      expect(positionAt(event.enrollment_id, event.round_id)).toBe(event.to_position);
      expect(positionAt(event.enrollment_id, previous?.id ?? '')).toBe(event.from_position);
      expect(event.visibility).toBe(event.to_position < event.from_position ? 'public' : 'private');
    }
  });

  it('Líder e Top N na mesma rodada geram um evento só, o de Líder (R47)', () => {
    const milestoneIds = mockDomain.feedEvents.flatMap((e) => (e.type === 'milestone' ? [e.milestone_id] : []));
    for (const id of milestoneIds) {
      const milestone = get(byId.milestones, id);
      const shadowed = milestone.type === 'top_n' && mockDomain.milestones.some((other) =>
        other.type === 'leader' && other.enrollment_id === milestone.enrollment_id && other.round_id === milestone.round_id);
      expect(shadowed, id).toBe(false);
    }
  });
});

function expectedActors(event: FeedEvent): string[] {
  switch (event.type) {
    case 'result':
    case 'match_defined': {
      const { a, b } = sidePlayers(get(byId.matches, event.match_id));
      return [...a, ...b];
    }
    case 'friendship': {
      const friendship = get(byId.friendships, event.friendship_id);
      return [friendship.requester_id, friendship.addressee_id];
    }
    case 'milestone':
      return enrollmentPlayers(get(byId.milestones, event.milestone_id).enrollment_id);
    default:
      return enrollmentPlayers(event.enrollment_id);
  }
}
