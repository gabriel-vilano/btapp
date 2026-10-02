import type { CompetitorUnit, Match, Player, RankingMatch } from '@/src/types/domain';
import { testDomain } from '../match-count/matchCount.test-utils';
import { testRounds } from '../standings.test-utils';
import type { H2HDomain, H2HSide } from './types';

// Cenários mínimos do H2H: as unidades e partidas de `match-count`, com
// data e id próprios (as de lá saem todas no mesmo dia) e os jogadores
// `player-<slug>` com @username `<slug>`.

function playerOf(id: string): Player {
  const slug = id.replace(/^player-/, '');
  return { id, name: slug, username: slug, avatar_url: null, birth_date: null, total_matches: 0 };
}

/** Domínio do H2H com as unidades, os jogadores delas e as partidas recebidas. */
export function h2hTestDomain(units: CompetitorUnit[], matches: Match[]): H2HDomain {
  const playerIds = [...new Set(units.flatMap((unit) => unit.player_ids))];
  return {
    ...testDomain(units, matches),
    players: playerIds.map(playerOf),
    seasons: [],
    rounds: Object.values(testRounds),
    standingSnapshots: [],
    milestones: [],
  };
}

/** A partida com id próprio, jogada em `iso`. Ex.: `dated(friendly(x, y, win(6, 4)), 'f1', '2026-03-01T12:00:00Z')`. */
export function dated<M extends Match>(match: M, id: string, iso: string): M {
  return match.kind === 'friendly' ? { ...match, id, played_at: iso } : { ...match, id, scheduled_at: iso };
}

/** A partida confirmada, anulada pelo admin depois (R41). */
export function annulled(match: RankingMatch): RankingMatch {
  if (match.status !== 'confirmed') throw new Error(`Teste: recebi a partida '${match.id}' em '${match.status}', esperado 'confirmed'`);
  const { id, competition_id, category_id, round_id, undone_reports, format, scheduled_at, venue, created_at } = match;
  return {
    id, kind: 'ranking', competition_id, category_id, round_id, undone_reports, format, scheduled_at, venue, created_at,
    side_a_enrollment_id: match.side_a_enrollment_id,
    side_b_enrollment_id: match.side_b_enrollment_id,
    status: 'cancelled',
    reason: 'annulled',
    cancellation: { admin_id: 'player-admin', acted_at: '2026-06-01T12:00:00Z' },
  };
}

export function playerSide(slug: string): H2HSide {
  return { kind: 'player', player_id: `player-${slug}` };
}

export function unitSide(unit: CompetitorUnit): H2HSide {
  if (unit.modality !== 'doubles') throw new Error(`Teste: recebi a unidade '${unit.id}' de simples, esperado uma dupla`);
  return { kind: 'unit', unit_id: unit.id, player_ids: unit.player_ids };
}
