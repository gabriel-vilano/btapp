import type {
  Enrollment,
  Milestone,
  RankingMatch,
  ReportableResult,
  Round,
  Season,
  SidePoints,
  StandingSnapshot,
} from '@/src/types/domain';
import { daysAgo, onTheHour } from '../relativeTime';
import { confirmedByOpponent, gameSet, hoursAfter, reportBy } from './builders';
import { players as p, units } from './people';
import { ranking, rankingCategories } from './ranking';
import { RANKING_VENUE } from './scheduling';

// Temporada encerrada do mesmo ranking, para a seção "Temporadas" do perfil
// (docs/PROFILE.md, PF19). Fica fora do `mockDomain` de propósito: as
// contagens e o feed dos outros testes seguem só a temporada atual. Quem
// precisa do histórico usa o `mockProfileDomain`.
//
// Masculino B, 4 duplas, 2 rodadas e final para as 2 primeiras. Os pontos
// saem da regra padrão (R9): 6/3 dá 106 e 44; 6/2, 108 e 42; 6/4, 104 e 46;
// 6/1, 110 e 40.
//
// | Dupla            | Rodada 1 | Rodada 2 | Final | Marcos           |
// | André e Bruno    | 1º (108) | 1º (212) | 1º    | Líder, Top 2     |
// | Lucas e Rafael   | 2º (106) | 3º (152) | 3º    | Top 2            |
// | Pedro e Thiago   | 3º (44)  | 2º (154) | 2º    | Top 2 (rodada 2) |
// | Caio e Diego     | 4º (42)  | 4º (82)  | 4º    | —                |

export const pastSeason: Season = {
  id: 'season-arena-rm-2026-1',
  ranking_id: ranking.id,
  name: '1º semestre de 2026',
  starts_on: daysAgo(240),
  ends_on: daysAgo(80),
  final: { name: 'Saideira', qualifiers: 2, cutoff_date: daysAgo(95), tournament_id: null },
};

function round(number: number, startsAt: string, deadline: string): Round {
  return { id: `round-arena-rm-2026-1-${number}`, season_id: pastSeason.id, number, starts_at: startsAt, deadline };
}

export const pastRounds = {
  first: round(1, daysAgo(240), daysAgo(170)),
  second: round(2, daysAgo(170), daysAgo(100)),
};

type UnitKey = keyof typeof units;

function pastEnrollment(unit: UnitKey): Enrollment {
  return {
    id: `enr-arena-rm-2026-1-${units[unit].id.replace('unit-', '')}`,
    unit_id: units[unit].id,
    category_id: rankingCategories.masculinoB.id,
    season_id: pastSeason.id,
    enrolled_at: daysAgo(242),
    status: 'active',
  };
}

export const pastMasculinoB = {
  p1: pastEnrollment('lucasRafael'),
  p2: pastEnrollment('pedroThiago'),
  p3: pastEnrollment('andreBruno'),
  p4: pastEnrollment('caioDiego'),
};

const { p1, p2, p3, p4 } = pastMasculinoB;
type PlayerKey = keyof typeof p;

function pastMatch(
  slug: string,
  matchRound: Round,
  [a, b]: [Enrollment, Enrollment],
  playedDaysAgo: number,
  result: ReportableResult,
  [reporter, responder]: [PlayerKey, PlayerKey],
  points: SidePoints,
): RankingMatch {
  const playedAt = onTheHour(daysAgo(playedDaysAgo));
  const report = reportBy(result, p[reporter], hoursAfter(playedAt, 2));
  return {
    id: `match-arena-rm-2026-1-${slug}`,
    kind: 'ranking',
    competition_id: ranking.id,
    category_id: rankingCategories.masculinoB.id,
    round_id: matchRound.id,
    undone_reports: [],
    side_a_enrollment_id: a.id,
    side_b_enrollment_id: b.id,
    format: ranking.match_format,
    scheduled_at: playedAt,
    venue: RANKING_VENUE,
    created_at: matchRound.starts_at,
    status: 'confirmed',
    result,
    report,
    confirmation: confirmedByOpponent(p[responder], hoursAfter(playedAt, 5)),
    correction: null,
    points,
  };
}

const wonByA = (gamesA: number, gamesB: number): ReportableResult =>
  ({ type: 'normal', winner: 'a', sets: [gameSet(gamesA, gamesB)] });

export const pastMatches: RankingMatch[] = [
  pastMatch('r1-1', pastRounds.first, [p1, p2], 200, wonByA(6, 3), ['lucas', 'pedro'], { a: 106, b: 44 }),
  pastMatch('r1-2', pastRounds.first, [p3, p4], 195, wonByA(6, 2), ['andre', 'caio'], { a: 108, b: 42 }),
  pastMatch('r2-1', pastRounds.second, [p3, p1], 140, wonByA(6, 4), ['bruno', 'rafael'], { a: 104, b: 46 }),
  pastMatch('r2-2', pastRounds.second, [p2, p4], 135, wonByA(6, 1), ['thiago', 'diego'], { a: 110, b: 40 }),
];

const MB = rankingCategories.masculinoB.id;

function photo(matchRound: Round, ordered: [Enrollment, number][]): StandingSnapshot[] {
  return ordered.map(([enrollment, points], index) => ({
    round_id: matchRound.id,
    category_id: MB,
    enrollment_id: enrollment.id,
    position: index + 1,
    points,
  }));
}

export const pastSnapshots: StandingSnapshot[] = [
  ...photo(pastRounds.first, [[p3, 108], [p1, 106], [p2, 44], [p4, 42]]),
  ...photo(pastRounds.second, [[p3, 212], [p2, 154], [p1, 152], [p4, 82]]),
];

function milestone(enrollment: Enrollment, matchRound: Round, type: Milestone['type']): Milestone {
  const base = {
    id: `milestone-${type}-${enrollment.id.replace('enr-', '')}`,
    enrollment_id: enrollment.id,
    season_id: pastSeason.id,
    round_id: matchRound.id,
    achieved_at: matchRound.deadline,
  };
  return type === 'leader' ? { ...base, type } : { ...base, type, n: pastSeason.final?.qualifiers ?? 2 };
}

export const pastMilestones: Milestone[] = [
  milestone(p3, pastRounds.first, 'leader'),
  milestone(p3, pastRounds.first, 'top_n'),
  milestone(p1, pastRounds.first, 'top_n'),
  milestone(p2, pastRounds.second, 'top_n'),
];
