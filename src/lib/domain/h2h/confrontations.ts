import type { MatchSideKey } from '@/src/types/domain';
import { playerHeadToHead, unitHeadToHead } from '../match-count/headToHead';
import { resultOf, sideUnitsResolver, type ConfirmedMatch, type SideUnits } from '../match-count/playedMatch';
import { playedAt } from '../profile/recentMatches';
import { toScore } from '../profile-page/score';
import { isOnSide, sidePlayerIds } from './perspective';
import type { H2HConfrontation, H2HDomain, H2HLineup, H2HMatchContext, OrientedSides } from './types';

// "Confrontos" (docs/HEAD_TO_HEAD.md, HH14): uma linha por partida jogada
// entre os lados, da mais recente à mais antiga, lida do lado esquerdo. A
// lista sai da contagem do H2H (R19): W.O., W.O. duplo, partida anulada e
// parceiros do mesmo lado já ficam fora dela.

/** Ids das partidas jogadas entre os lados, com as vitórias do lado esquerdo. */
export function headToHeadOf(domain: H2HDomain, { left, right }: Pick<OrientedSides, 'left' | 'right'>) {
  if (left.kind === 'unit' && right.kind === 'unit') return unitHeadToHead(domain, left.unit_id, right.unit_id);
  return playerHeadToHead(domain, sidePlayerIds(left)[0], sidePlayerIds(right)[0]);
}

function contextOf(domain: H2HDomain, match: ConfirmedMatch): H2HMatchContext {
  if (match.kind === 'friendly') return { kind: 'friendly' };
  const { competition_id, category_id } = match;
  if (match.kind === 'tournament') return { kind: 'tournament', competition_id, category_id, stage: match.stage };
  const round = domain.rounds.find((candidate) => candidate.id === match.round_id);
  if (round === undefined) throw new Error(`H2H: rodada '${match.round_id}' da partida '${match.id}' não existe nas tabelas`);
  return { kind: 'ranking', competition_id, category_id, round_number: round.number };
}

// Só na página de jogadores, e só quando a partida foi de duplas
function lineupOf(sides: SideUnits, leftKey: MatchSideKey, view: OrientedSides): H2HLineup | null {
  const [leftUnit, rightUnit] = leftKey === 'a' ? [sides.a, sides.b] : [sides.b, sides.a];
  if (view.kind !== 'players' || leftUnit.modality !== 'doubles') return null;
  return { left_player_ids: leftUnit.player_ids, right_player_ids: rightUnit.player_ids };
}

function toConfrontation(domain: H2HDomain, match: ConfirmedMatch, sides: SideUnits, view: OrientedSides): H2HConfrontation {
  const result = resultOf(match);
  // A contagem do H2H só deixa passar resultado normal e desistência
  if (result.type !== 'normal' && result.type !== 'retired') {
    throw new Error(`H2H: a partida '${match.id}' tem resultado '${result.type}', esperado 'normal' ou 'retired'`);
  }
  const leftKey: MatchSideKey = isOnSide(sides.a, view.left) ? 'a' : 'b';
  const won = result.winner === leftKey;
  return {
    match_id: match.id,
    played_at: playedAt(match),
    outcome: won ? 'win' : 'loss',
    result_type: result.type,
    score: toScore(result),
    perspective: won ? 'winner' : 'loser',
    context: contextOf(domain, match),
    lineup: lineupOf(sides, leftKey, view),
  };
}

function byMostRecent(x: H2HConfrontation, y: H2HConfrontation): number {
  return Date.parse(y.played_at) - Date.parse(x.played_at) || x.match_id.localeCompare(y.match_id);
}

/**
 * Confrontos entre os lados, o mais recente primeiro.
 * Ex.: `h2hConfrontations(mockH2HDomain, orientSides(route.sides, viewerId))`.
 */
export function h2hConfrontations(domain: H2HDomain, view: OrientedSides): H2HConfrontation[] {
  const ids = new Set(headToHeadOf(domain, view).match_ids);
  const sidesOf = sideUnitsResolver(domain);
  return domain.matches
    .filter((match): match is ConfirmedMatch => ids.has(match.id) && match.status === 'confirmed')
    .map((match) => toConfrontation(domain, match, sidesOf(match), view))
    .sort(byMostRecent);
}
