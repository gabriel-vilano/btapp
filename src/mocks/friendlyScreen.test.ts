import { describe, expect, it } from 'vitest';
import { friendlyScreenDataOf } from './friendlyScreen';
import { MOCK_VIEWER_ID } from './matchScreen';

describe('dados da tela do amistoso nos mocks', () => {
  it('resolve os lados pelas unidades do amistoso', () => {
    const data = friendlyScreenDataOf('match-friendly-lucas-rafael-andre-bruno');
    expect(data?.sideNames).toEqual({ a: 'Lucas e Rafael', b: 'André e Bruno' });
    expect(data?.sides).toEqual({ a: ['player-lucas', 'player-rafael'], b: ['player-andre', 'player-bruno'] });
    expect(data?.viewerId).toBe(MOCK_VIEWER_ID);
  });

  it('o Lucas tem um amistoso para confirmar, lançado pelo Pedro', () => {
    const data = friendlyScreenDataOf('match-friendly-pedro-lucas');
    expect(data?.match.status).toBe('awaiting_confirmation');
    expect(data?.match.report.reported_by).toBe('player-pedro');
    expect(data?.playerNames).toEqual({ 'player-pedro': 'Pedro', 'player-lucas': 'Lucas' });
  });

  it('partida de competição e partida inexistente não são amistoso', () => {
    expect(friendlyScreenDataOf('match-arena-mangaba-mb-r3-1')).toBeNull();
    expect(friendlyScreenDataOf('match-inexistente')).toBeNull();
  });
});
