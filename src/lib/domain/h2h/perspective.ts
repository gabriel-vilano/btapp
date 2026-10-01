import type { CompetitorUnit } from '@/src/types/domain';
import type { H2HSide, OrientedSides } from './types';

// Perspectiva (docs/HEAD_TO_HEAD.md, HH6): o lado de quem vê fica à
// esquerda, mesmo com a URL na ordem inversa. Quem vê de fora (o H2H de dois
// amigos) lê na ordem da URL.

/** Os jogadores do lado: um na página de jogadores, dois na de duplas. */
export function sidePlayerIds(side: H2HSide): string[] {
  return side.kind === 'player' ? [side.player_id] : side.player_ids;
}

/** A unidade da partida é este lado: a dupla exata, ou qualquer unidade com o jogador. */
export function isOnSide(unit: CompetitorUnit, side: H2HSide): boolean {
  return side.kind === 'unit' ? unit.id === side.unit_id : unit.player_ids.includes(side.player_id);
}

function hasViewer(side: H2HSide, viewerId: string): boolean {
  return sidePlayerIds(side).includes(viewerId);
}

/**
 * Lados na ordem da tela.
 * Ex.: `orientSides([pedro, lucas], lucasId)` → Lucas à esquerda, `viewer_is_left: true`.
 */
export function orientSides([a, b]: [H2HSide, H2HSide], viewerId: string): OrientedSides {
  const kind = a.kind === 'player' ? 'players' : 'doubles';
  if (hasViewer(b, viewerId)) return { kind, left: b, right: a, viewer_is_left: true };
  return { kind, left: a, right: b, viewer_is_left: hasViewer(a, viewerId) };
}
