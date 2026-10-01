import { describe, expect, it } from 'vitest';
import { doubles } from '../match-count/matchCount.test-utils';
import { playerSide, unitSide } from './h2h.test-utils';
import { orientSides } from './perspective';

// Perspectiva (docs/HEAD_TO_HEAD.md, HH6).

const [lucas, pedro] = [playerSide('lucas'), playerSide('pedro')];

describe('orientSides', () => {
  it('quem vê no lado da direita da URL vai para a esquerda', () => {
    expect(orientSides([pedro, lucas], 'player-lucas')).toEqual({
      kind: 'players',
      left: lucas,
      right: pedro,
      viewer_is_left: true,
    });
  });

  it('quem vê já à esquerda mantém a ordem', () => {
    expect(orientSides([lucas, pedro], 'player-lucas')).toMatchObject({ left: lucas, viewer_is_left: true });
  });

  it('quem vê de fora lê na ordem da URL', () => {
    expect(orientSides([pedro, lucas], 'player-marina')).toMatchObject({ left: pedro, right: lucas, viewer_is_left: false });
  });

  it('em duplas, basta quem vê ser um dos dois da dupla', () => {
    const [lr, pt] = [unitSide(doubles('lucas', 'rafael')), unitSide(doubles('pedro', 'thiago'))];
    expect(orientSides([pt, lr], 'player-rafael')).toEqual({ kind: 'doubles', left: lr, right: pt, viewer_is_left: true });
  });
});
