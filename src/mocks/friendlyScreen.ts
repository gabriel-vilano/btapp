import type { FriendlyScreenData } from '@/src/components/agenda/FriendlyScreen';
import type { Player } from '@/src/types/domain';
import { mockDomain } from './domain';
import { MOCK_VIEWER_ID } from './matchScreen';

// Tela do amistoso (docs/RESULTS.md §6.2) montada das tabelas mockadas, do
// ponto de vista do Lucas. Com o Supabase, esta montagem vira a consulta da página.

/**
 * Dados da tela do amistoso, ou `null` quando a partida não existe ou não é amistoso.
 * @example friendlyScreenDataOf('match-friendly-lucas-thiago')?.sideNames // { a: "Lucas", b: "Thiago" }
 */
export function friendlyScreenDataOf(matchId: string, viewerId: string = MOCK_VIEWER_ID): FriendlyScreenData | null {
  const match = mockDomain.matches.find((candidate) => candidate.id === matchId);
  if (match?.kind !== 'friendly') return null;
  const sides = { a: playersOfUnit(match.side_a_unit_id), b: playersOfUnit(match.side_b_unit_id) };
  return {
    match,
    sides,
    sideNames: { a: sideName(sides.a), b: sideName(sides.b) },
    playerNames: Object.fromEntries([...sides.a, ...sides.b].map((id) => [id, firstName(playerOf(id))])),
    viewerId,
  };
}

function playersOfUnit(unitId: string): string[] {
  return [...findOrThrow(mockDomain.units, unitId, 'unidade').player_ids];
}

function playerOf(playerId: string): Player {
  return findOrThrow(mockDomain.players, playerId, 'jogador');
}

function sideName(playerIds: readonly string[]): string {
  return playerIds.map((id) => firstName(playerOf(id))).join(' e ');
}

function firstName(player: Player): string {
  return player.name.split(' ')[0] ?? player.name;
}

function findOrThrow<T extends { id: string }>(items: readonly T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Tela do amistoso: ${what} '${id}' não existe nos mocks`);
  return found;
}
