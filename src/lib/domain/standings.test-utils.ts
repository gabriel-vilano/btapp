import {
  DEFAULT_SCORING_RULE,
  type CompetitionResult,
  type Enrollment,
  type Match,
  type RankingMatch,
  type Round,
  type ScoringRule,
} from '@/src/types/domain';
import { gameSet } from '@/src/mocks/domain/builders';
import { matchPoints } from './matchPoints';
import type { StandingsScope } from './standingsStats';

// Temporada mínima para os testes de classificação: uma categoria, duas
// rodadas e partidas em 1 set de 6. Os pontos saem do `matchPoints`, como na
// confirmação real.

export const SEASON_ID = 'season-test';
export const CATEGORY_ID = 'cat-test';

function round(number: number, startsAt: string, deadline: string): Round {
  return { id: `round-test-${number}`, season_id: SEASON_ID, number, starts_at: startsAt, deadline };
}

export const testRounds = {
  first: round(1, '2026-01-01T00:00:00Z', '2026-01-21T23:59:00Z'),
  second: round(2, '2026-01-22T00:00:00Z', '2026-02-11T23:59:00Z'),
};

/** Vitória 100, derrota 50 e games sem valor: facilita montar empate em pontos. */
export const FLAT_RULE: ScoringRule = { ...DEFAULT_SCORING_RULE, per_game_won: 0, per_game_lost: 0 };

/** Inscrição ativa. `order` define o `enrolled_at`, usado só como ordem estável. */
export function enrollment(slug: string, order = 0): Enrollment {
  return {
    id: `enr-${slug}`,
    unit_id: `unit-${slug}`,
    category_id: CATEGORY_ID,
    season_id: SEASON_ID,
    enrolled_at: new Date(Date.UTC(2025, 11, 1 + order)).toISOString(),
    status: 'active',
  };
}

export function closed(base: Enrollment, closedAt: string): Enrollment {
  return { ...base, status: 'closed', closed_at: closedAt, closed_reason: 'partner_change' };
}

/** Vitória do lado A por `gamesA`/`gamesB` em 1 set de 6. Ex.: `win(6, 4)`. */
export function win(gamesA: number, gamesB: number): CompetitionResult {
  return { type: 'normal', winner: 'a', sets: [gameSet(gamesA, gamesB)] };
}

interface PlayedOptions {
  rule?: ScoringRule;
  round?: Round;
  confirmedAt?: string; // padrão: 1 dia depois do início da rodada
}

/** Partida de ranking confirmada pelo admin, com os pontos da regra. */
export function played(a: Enrollment, b: Enrollment, result: CompetitionResult, options: PlayedOptions = {}): RankingMatch {
  const matchRound = options.round ?? testRounds.first;
  const confirmedAt = options.confirmedAt ?? new Date(Date.parse(matchRound.starts_at) + 86_400_000).toISOString();
  return {
    id: `match-${a.id}-${b.id}-${confirmedAt}`,
    kind: 'ranking',
    competition_id: 'comp-test',
    category_id: CATEGORY_ID,
    round_id: matchRound.id,
    undone_reports: [],
    side_a_enrollment_id: a.id,
    side_b_enrollment_id: b.id,
    format: 'one_set_of_6',
    scheduled_at: null,
    venue: null,
    created_at: matchRound.starts_at,
    status: 'confirmed',
    result,
    report: null,
    confirmation: { via: 'admin', admin_id: 'player-admin', acted_at: confirmedAt },
    correction: null,
    points: matchPoints(result, 'one_set_of_6', options.rule ?? DEFAULT_SCORING_RULE),
  };
}

export function testScope(enrollments: Enrollment[], matches: Match[]): StandingsScope {
  return {
    season_id: SEASON_ID,
    category_id: CATEGORY_ID,
    rounds: Object.values(testRounds),
    enrollments,
    matches,
  };
}
