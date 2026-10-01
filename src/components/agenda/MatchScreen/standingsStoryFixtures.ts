import type { StandingsScope } from "@/src/lib/domain/standingsStats";
import { matchPoints } from "@/src/lib/domain/matchPoints";
import { DEFAULT_SCORING_RULE, type Enrollment, type RankingMatch, type Round } from "@/src/types/domain";
import { MATCH } from "./storyFixtures";

// O Masculino B das stories antes da rodada 3, para o impacto no ranking
// depois da confirmação (docs/RESULTS.md, RG18). Os pontos saem do
// `matchPoints`, como na confirmação real. Antes do confronto da rodada 3:
// C 1º, E 2º, Pedro e Thiago (A) 3º, D 4º e Caio e Diego (B) 5º. A vitória
// de Pedro e Thiago os leva a 2º (▲ 1); a derrota, a 4º (▼ 1).

const SEASON_ID = "story-season-2026-2";

const round = (number: number, startsAt: string, deadline: string): Round => ({
  id: `story-round-${number}`,
  season_id: SEASON_ID,
  number,
  starts_at: startsAt,
  deadline,
});

const ROUNDS = [
  round(1, "2026-08-27T03:00:00.000Z", "2026-09-10T02:59:00.000Z"),
  round(2, "2026-09-10T03:00:00.000Z", "2026-09-24T02:59:00.000Z"),
  round(3, "2026-09-24T03:00:00.000Z", "2026-10-07T02:59:00.000Z"),
];

const enrollment = (slug: string, order: number): Enrollment => ({
  id: `story-enrollment-${slug}`,
  unit_id: `story-unit-${slug}`,
  category_id: MATCH.category_id,
  season_id: SEASON_ID,
  enrolled_at: new Date(Date.UTC(2026, 7, 1 + order)).toISOString(),
  status: "active",
});

const [A, B, C, D, E] = ["a", "b", "c", "d", "e"].map(enrollment);

/** Vitória do lado A por `gamesA`/`gamesB` num set de 6, confirmada pela Ana. */
function played(a: Enrollment, b: Enrollment, games: [number, number], roundIndex: number): RankingMatch {
  const result = { type: "normal" as const, winner: "a" as const, sets: [{ games_a: games[0], games_b: games[1], super_tiebreak: false, interrupted: false }] };
  const at = new Date(Date.parse(ROUNDS[roundIndex].starts_at) + 86_400_000).toISOString();
  return {
    ...MATCH,
    id: `story-${a.id}-${b.id}`,
    round_id: ROUNDS[roundIndex].id,
    side_a_enrollment_id: a.id,
    side_b_enrollment_id: b.id,
    status: "confirmed",
    result,
    report: null,
    confirmation: { via: "admin", admin_id: "story-ana", acted_at: at },
    correction: null,
    points: matchPoints(result, MATCH.format, DEFAULT_SCORING_RULE),
  };
}

const PREVIOUS_ROUNDS = [
  played(E, A, [6, 1], 0),
  played(C, D, [6, 0], 0),
  played(A, B, [6, 4], 1),
  played(E, C, [6, 4], 1),
  played(D, B, [6, 4], 1),
  played(C, B, [7, 5], 0),
];

/**
 * A categoria na temporada, com o confronto da rodada 3 na versão da story:
 * a tela troca pela partida ao vivo, e o impacto é calculado sobre ela.
 * @example storyStandings(RESULT_MATCHES.confirmedByOpponent)
 */
export function storyStandings(match: RankingMatch = MATCH): StandingsScope {
  return {
    season_id: SEASON_ID,
    category_id: MATCH.category_id,
    rounds: ROUNDS,
    enrollments: [A, B, C, D, E],
    matches: [...PREVIOUS_ROUNDS, match],
  };
}
