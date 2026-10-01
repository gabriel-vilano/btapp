import type { CompetitorUnit, FriendlyMatch, FriendlyResult, MatchFormat, Player } from '@/src/types/domain';
import { daysAgo, onTheHour } from '../relativeTime';
import { gameSet, hoursAfter, reportBy, responseBy, superTiebreak } from './builders';
import { players as p, units } from './people';

// Cenário do H2H (docs/HEAD_TO_HEAD.md): amistosos antigos que dão à rivalidade
// Lucas e Rafael × Pedro e Thiago uma derrota, e aos pares cruzados números
// diferentes dos da dupla (HH2). Ficam fora do `mockDomain` para não mudar as
// contagens do feed e do perfil.

/** Duplas que só jogaram estes amistosos: o mesmo jogador com outro parceiro. */
export const h2hUnits = {
  rafaelEduardo: { id: 'unit-rafael-eduardo', modality: 'doubles', player_ids: [p.rafael.id, p.eduardo.id] },
  pedroGustavo: { id: 'unit-pedro-gustavo', modality: 'doubles', player_ids: [p.pedro.id, p.gustavo.id] },
} satisfies Record<string, CompetitorUnit>;

function confirmedFriendly(
  slug: string,
  [sideA, sideB]: [CompetitorUnit, CompetitorUnit],
  [reporter, responder]: [Player, Player],
  format: MatchFormat,
  playedDaysAgo: number,
  result: FriendlyResult,
): FriendlyMatch {
  const playedAt = onTheHour(daysAgo(playedDaysAgo));
  const report = reportBy(result, reporter, hoursAfter(playedAt, 2));
  return {
    id: `match-friendly-h2h-${slug}`,
    kind: 'friendly',
    side_a_unit_id: sideA.id,
    side_b_unit_id: sideB.id,
    format,
    played_at: playedAt,
    venue: 'Arena Mangaba – Beach · Nova Lima/MG',
    created_at: report.reported_at,
    report,
    status: 'confirmed',
    response: responseBy(responder, hoursAfter(report.reported_at, 4)),
  };
}

/**
 * Com os mocks do perfil, dá: dupla 3 × 1; Lucas × Pedro 3 × 2; Lucas × Thiago
 * 4 × 1; Rafael × Pedro 3 × 2; Rafael × Thiago 3 × 1 (do lado de Lucas e Rafael).
 */
export const h2hFriendlies: FriendlyMatch[] = [
  // A única vitória de Pedro e Thiago sobre Lucas e Rafael, no super tiebreak
  confirmedFriendly('pedro-thiago-lucas-rafael', [units.pedroThiago, units.lucasRafael], [p.pedro, p.lucas],
    'two_sets_of_6_stb', 45, { type: 'normal', winner: 'a', sets: [gameSet(4, 6), gameSet(6, 3), superTiebreak(10, 7)] }),
  confirmedFriendly('pedro-lucas', [units.pedro, units.lucas], [p.pedro, p.lucas],
    'one_set_of_6', 60, { type: 'normal', winner: 'a', sets: [gameSet(6, 2)] }),
  confirmedFriendly('pedro-gustavo-rafael-eduardo', [h2hUnits.pedroGustavo, h2hUnits.rafaelEduardo], [p.gustavo, p.rafael],
    'one_set_of_6', 75, { type: 'normal', winner: 'a', sets: [gameSet(7, 5)] }),
];
