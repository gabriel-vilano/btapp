import { playerHeadToHead } from '../match-count/headToHead';
import { sidePlayerIds } from './perspective';
import type { H2HCrossPair, H2HDomain, OrientedSides } from './types';

// "Jogador contra jogador" (docs/HEAD_TO_HEAD.md, HH2 e §4.6): na página de
// duplas, os 4 pares cruzados, cada um com o H2H jogador × jogador (qualquer
// parceiro). Os números podem divergir muito dos da dupla, e a seção deixa os
// dois à vista. Par sem confronto não aparece.

// HH6: os pares com quem vê primeiro, depois os demais
function viewerFirst(playerIds: string[], viewerId: string): string[] {
  return [...playerIds].sort((x, y) => Number(y === viewerId) - Number(x === viewerId));
}

/**
 * Pares cruzados com pelo menos um confronto, do lado do jogador da esquerda.
 * Fora da página de duplas, a lista vem vazia.
 * Ex.: `h2hCrossPairs(mockH2HDomain, view, viewerId)` → `[{ left_player_id: 'player-lucas', … }]`.
 */
export function h2hCrossPairs(domain: H2HDomain, view: OrientedSides, viewerId: string): H2HCrossPair[] {
  if (view.kind !== 'doubles') return [];
  const rightIds = sidePlayerIds(view.right);
  return viewerFirst(sidePlayerIds(view.left), viewerId).flatMap((leftId) =>
    rightIds
      .map((rightId) => ({ rightId, record: playerHeadToHead(domain, leftId, rightId) }))
      .filter(({ record }) => record.match_ids.length > 0)
      .map(({ rightId, record }) => ({
        left_player_id: leftId,
        right_player_id: rightId,
        left_wins: record.wins,
        right_wins: record.losses,
      })),
  );
}
