import type { CompetitionResult, Match, MatchSideKey } from '@/src/types/domain';
import { confirmedAt } from '../standingsStats';
import {
  hasPlayer,
  resultOf,
  sideUnitsResolver,
  type ConfirmedMatch,
  type MatchCountDomain,
  type SideUnits,
} from '../match-count/playedMatch';

// "Partidas recentes" do perfil (docs/PROFILE.md, PF18): as partidas
// confirmadas mais recentes do jogador, de qualquer tipo. O W.O. em que o lado
// dele não compareceu e o W.O. duplo ficam fora, como no cartel (PF6): o
// perfil não mostra ausências no MVP.

/** Quantas partidas a seção mostra antes do "Ver todas". */
export const RECENT_MATCHES_LIMIT = 5;

/** Resultado que aparece no perfil: tem vencedor. */
export type RecentMatchResult = Exclude<CompetitionResult, { type: 'double_wo' }>;

/** Uma linha de "Partidas recentes", do ponto de vista do dono do perfil. */
export interface RecentMatchRow {
  match_id: string;
  kind: ConfirmedMatch['kind'];
  competition_id: string | null; // amistoso: null
  category_id: string | null;
  played_at: string; // ISO 8601
  side: MatchSideKey; // o lado do dono do perfil
  result: RecentMatchResult;
  opponent_ids: string[]; // jogadores do outro lado
}

/**
 * Quando a partida foi jogada: a data acordada; sem ela, o lançamento; e,
 * na partida decidida pelo admin sem lançamento, a confirmação.
 */
export function playedAt(match: ConfirmedMatch): string {
  if (match.kind === 'friendly') return match.played_at;
  return match.scheduled_at ?? match.report?.reported_at ?? confirmedAt(match.confirmation);
}

function isShown(result: CompetitionResult, side: MatchSideKey): result is RecentMatchResult {
  if (result.type === 'double_wo') return false;
  return result.type !== 'wo' || result.winner === side;
}

function toRow(match: ConfirmedMatch, side: MatchSideKey, result: RecentMatchResult, opponentIds: string[]): RecentMatchRow {
  const isFriendly = match.kind === 'friendly';
  return {
    match_id: match.id,
    kind: match.kind,
    competition_id: isFriendly ? null : match.competition_id,
    category_id: isFriendly ? null : match.category_id,
    played_at: playedAt(match),
    side,
    result,
    opponent_ids: opponentIds,
  };
}

function playerSide(sides: SideUnits, playerId: string): MatchSideKey | null {
  if (hasPlayer(sides.a, playerId)) return 'a';
  if (hasPlayer(sides.b, playerId)) return 'b';
  return null;
}

function rowOf(match: Match, sidesOf: (match: Match) => SideUnits, playerId: string): RecentMatchRow | null {
  if (match.status !== 'confirmed') return null;
  const sides = sidesOf(match);
  const side = playerSide(sides, playerId);
  const result = resultOf(match);
  if (side === null || !isShown(result, side)) return null;
  return toRow(match, side, result, sides[side === 'a' ? 'b' : 'a'].player_ids);
}

/**
 * Partidas recentes do jogador, a mais recente primeiro.
 * Ex.: `recentMatches(mockDomain, players.lucas.id)` → as 5 últimas do Lucas.
 */
export function recentMatches(domain: MatchCountDomain, playerId: string, limit = RECENT_MATCHES_LIMIT): RecentMatchRow[] {
  const sidesOf = sideUnitsResolver(domain);
  return domain.matches
    .map((match) => rowOf(match, sidesOf, playerId))
    .filter((row): row is RecentMatchRow => row !== null)
    .sort(byMostRecent)
    .slice(0, limit);
}

function byMostRecent(x: RecentMatchRow, y: RecentMatchRow): number {
  return Date.parse(y.played_at) - Date.parse(x.played_at) || x.match_id.localeCompare(y.match_id);
}
