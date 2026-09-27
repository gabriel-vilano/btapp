import type {
  CompetitionResult,
  CompetitorUnit,
  DoublesUnit,
  Enrollment,
  FriendlyMatch,
  FriendlyResult,
  NormalResult,
  RetiredResult,
  SinglesUnit,
  TournamentMatch,
} from '@/src/types/domain';
import { gameSet, interruptedSet } from '@/src/mocks/domain/builders';
import { enrollment, played } from '../standings.test-utils';
import type { MatchCountDomain } from './playedMatch';

// Cenários mínimos para as contagens (R18, R19). As partidas de ranking vêm
// do `played` da classificação; aqui entram a unidade, o torneio e o amistoso.

const PLAYED_AT = '2026-01-10T12:00:00Z';

/** Vitória do lado A em 1 set de 6. Serve à competição e ao amistoso. Ex.: `win(6, 4)`. */
export function win(gamesA: number, gamesB: number): NormalResult {
  return { type: 'normal', winner: 'a', sets: [gameSet(gamesA, gamesB)] };
}

/** O lado B desistiu com o placar parcial pedido (R11). */
export function retiredB(gamesA: number, gamesB: number): RetiredResult {
  return { type: 'retired', winner: 'a', sets: [interruptedSet(gamesA, gamesB)] };
}

/** Unidade de simples do jogador `player-<slug>`, com id `unit-<slug>`. */
export function singles(slug: string): SinglesUnit {
  return { id: `unit-${slug}`, modality: 'singles', player_ids: [`player-${slug}`] };
}

/** Dupla `unit-<x>-<y>` dos jogadores `player-<x>` e `player-<y>`. */
export function doubles(x: string, y: string): DoublesUnit {
  return { id: `unit-${x}-${y}`, modality: 'doubles', player_ids: [`player-${x}`, `player-${y}`] };
}

/** Inscrição da unidade: o `enrollment` da classificação aponta para `unit-<slug>`. */
export function enrolled(unit: CompetitorUnit): Enrollment {
  return enrollment(unit.id.replace(/^unit-/, ''));
}

/** Partida de ranking confirmada entre as unidades, com o resultado pedido. */
export function rankingMatch(a: CompetitorUnit, b: CompetitorUnit, result: CompetitionResult) {
  return { ...played(enrolled(a), enrolled(b), result), id: `match-ranking-${a.id}-${b.id}-${result.type}` };
}

/** Partida de torneio confirmada pelo admin (R38), sem pontos. */
export function tournamentMatch(a: CompetitorUnit, b: CompetitorUnit, result: CompetitionResult): TournamentMatch {
  return {
    id: `match-tournament-${a.id}-${b.id}`,
    kind: 'tournament',
    competition_id: 'comp-tournament-test',
    category_id: 'cat-tournament-test',
    stage: 'Final',
    side_a_enrollment_id: enrolled(a).id,
    side_b_enrollment_id: enrolled(b).id,
    format: 'one_set_of_6',
    scheduled_at: PLAYED_AT,
    venue: null,
    created_at: PLAYED_AT,
    status: 'confirmed',
    result,
    report: null,
    confirmation: { via: 'admin', admin_id: 'player-admin', acted_at: PLAYED_AT },
    correction: null,
    points: null,
  };
}

type FriendlyStatus = FriendlyMatch['status'];

/** Amistoso lançado pelo lado A, no estado pedido (R42, R43). */
export function friendly(
  a: CompetitorUnit,
  b: CompetitorUnit,
  result: FriendlyResult,
  status: FriendlyStatus = 'confirmed',
): FriendlyMatch {
  const base = {
    id: `match-friendly-${a.id}-${b.id}-${status}`,
    kind: 'friendly' as const,
    side_a_unit_id: a.id,
    side_b_unit_id: b.id,
    format: 'one_set_of_6' as const,
    played_at: PLAYED_AT,
    venue: null,
    created_at: PLAYED_AT,
    report: { result, reported_by: a.player_ids[0], reported_at: PLAYED_AT },
  };
  const response = { responded_by: b.player_ids[0], responded_at: PLAYED_AT };
  if (status === 'confirmed' || status === 'discarded') return { ...base, status, response };
  if (status === 'cancelled') return { ...base, status, cancelled_at: PLAYED_AT };
  return { ...base, status };
}

/** Domínio com as unidades, as inscrições delas e as partidas recebidas. */
export function testDomain(units: CompetitorUnit[], matches: MatchCountDomain['matches']): MatchCountDomain {
  return { units, enrollments: units.map(enrolled), matches };
}
