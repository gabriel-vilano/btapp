import { describe, expect, it } from 'vitest';
import type { FeedEvent } from '@/src/types/domain';
import { mockDomain } from './index';
import { byId, competitionMatches, get, sidePlayers, sidesOf } from './integrity.test-utils';

// Integridade referencial: toda referência entre entidades aponta para algo
// que existe e é do tipo certo. É o que uma foreign key garantiria no banco.

describe('mocks de domínio: ids', () => {
  const withIds = (Object.entries(mockDomain) as [string, object[]][]).filter(([, items]) =>
    items.every((item) => 'id' in item),
  ) as [string, { id: string }[]][];

  it.each(withIds)(
    '%s não repete id',
    (_name, items) => {
      const ids = items.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    },
  );

  it('toda data é ISO 8601 válida', () => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/;
    const dates = JSON.stringify(mockDomain).match(/"\d{4}-\d{2}-\d{2}[^"]*"/g) ?? [];
    expect(dates.length).toBeGreaterThan(0);
    for (const quoted of dates) {
      const value = quoted.slice(1, -1);
      expect(value).toMatch(isoPattern);
      expect(Number.isNaN(Date.parse(value)), value).toBe(false);
    }
  });
});

describe('mocks de domínio: estrutura da competição', () => {
  it('competição, categoria, temporada e rodada se ligam', () => {
    for (const competition of mockDomain.competitions) get(byId.organizations, competition.organization_id);
    for (const category of mockDomain.categories) get(byId.competitions, category.competition_id);
    for (const season of mockDomain.seasons) {
      expect(get(byId.competitions, season.ranking_id).type).toBe('ranking');
      if (season.final?.tournament_id) {
        expect(get(byId.competitions, season.final.tournament_id).type).toBe('tournament');
      }
    }
    for (const round of mockDomain.rounds) get(byId.seasons, round.season_id);
  });

  it('admin é um jogador de uma competição existente', () => {
    for (const admin of mockDomain.admins) {
      get(byId.competitions, admin.competition_id);
      get(byId.players, admin.player_id);
    }
  });

  it('unidade aponta para jogadores existentes', () => {
    for (const unit of mockDomain.units) {
      for (const playerId of unit.player_ids) get(byId.players, playerId);
    }
  });

  it('amizade liga dois jogadores existentes e diferentes', () => {
    for (const friendship of mockDomain.friendships) {
      get(byId.players, friendship.requester_id);
      get(byId.players, friendship.addressee_id);
      expect(friendship.requester_id).not.toBe(friendship.addressee_id);
    }
  });
});

describe('mocks de domínio: inscrição', () => {
  it.each(mockDomain.enrollments.map((enrollment) => [enrollment.id, enrollment] as const))(
    '%s aponta para unidade, categoria e temporada coerentes',
    (_id, enrollment) => {
      get(byId.units, enrollment.unit_id);
      const category = get(byId.categories, enrollment.category_id);
      const competition = get(byId.competitions, category.competition_id);
      if (competition.type === 'tournament') {
        expect(enrollment.season_id).toBeNull();
        return;
      }
      expect(enrollment.season_id).not.toBeNull();
      expect(get(byId.seasons, enrollment.season_id ?? '').ranking_id).toBe(competition.id);
    },
  );
});

describe('mocks de domínio: partida', () => {
  it.each(competitionMatches.map((match) => [match.id, match] as const))(
    '%s: lados inscritos na categoria da partida',
    (_id, match) => {
      const category = get(byId.categories, match.category_id);
      expect(category.competition_id).toBe(match.competition_id);
      expect(get(byId.competitions, match.competition_id).type).toBe(match.kind);
      for (const side of sidesOf(match)) expect(side.category_id).toBe(match.category_id);
      if (match.kind === 'ranking') {
        const round = get(byId.rounds, match.round_id);
        for (const side of sidesOf(match)) expect(side.season_id).toBe(round.season_id);
      }
    },
  );

  it('amistoso aponta para unidades existentes', () => {
    for (const match of mockDomain.matches) {
      if (match.kind !== 'friendly') continue;
      get(byId.units, match.side_a_unit_id);
      get(byId.units, match.side_b_unit_id);
    }
  });

  it('ninguém joga dos dois lados', () => {
    for (const match of mockDomain.matches) {
      const { a, b } = sidePlayers(match);
      expect(a.filter((id) => b.includes(id)), match.id).toEqual([]);
    }
  });

  it('proposta de horário é de uma partida de competição existente', () => {
    for (const proposal of mockDomain.scheduleProposals) {
      expect(get(byId.matches, proposal.match_id).kind).not.toBe('friendly');
      get(byId.players, proposal.proposed_by);
    }
  });
});

describe('mocks de domínio: classificação e feed', () => {
  it('foto e marco apontam para inscrição, rodada e categoria coerentes', () => {
    for (const snapshot of mockDomain.standingSnapshots) {
      get(byId.rounds, snapshot.round_id);
      expect(get(byId.enrollments, snapshot.enrollment_id).category_id).toBe(snapshot.category_id);
    }
    for (const milestone of mockDomain.milestones) {
      expect(get(byId.enrollments, milestone.enrollment_id).season_id).toBe(milestone.season_id);
      expect(get(byId.rounds, milestone.round_id).season_id).toBe(milestone.season_id);
    }
  });

  it.each(mockDomain.feedEvents.map((event) => [event.id, event] as const))(
    '%s aponta para a origem e para jogadores existentes',
    (_id, event) => {
      expect(event.actor_ids.length).toBeGreaterThan(0);
      for (const playerId of event.actor_ids) get(byId.players, playerId);
      expect(sourceExists(event)).toBe(true);
    },
  );
});

function sourceExists(event: FeedEvent): boolean {
  switch (event.type) {
    case 'result':
    case 'match_defined':
      return byId.matches.has(event.match_id);
    case 'enrollment':
      return byId.enrollments.has(event.enrollment_id);
    case 'friendship':
      return byId.friendships.has(event.friendship_id);
    case 'milestone':
      return byId.milestones.has(event.milestone_id);
    case 'final_qualification':
      return byId.enrollments.has(event.enrollment_id) && byId.seasons.has(event.season_id);
    default:
      return byId.enrollments.has(event.enrollment_id) && byId.rounds.has(event.round_id);
  }
}
