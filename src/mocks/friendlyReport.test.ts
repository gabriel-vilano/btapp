import { describe, expect, it } from 'vitest';
import { friendlyReportDataOf } from './friendlyReport';
import { MOCK_VIEWER_ID } from './matchScreen';

describe('dados do registro de amistoso nos mocks', () => {
  it('quem lança é o Lucas, fora da lista de quem pode ser escolhido', () => {
    const data = friendlyReportDataOf();
    expect(data.viewer.id).toBe(MOCK_VIEWER_ID);
    expect(data.players.map((player) => player.id)).not.toContain(MOCK_VIEWER_ID);
  });

  it('marca como amigo só a amizade aceita (RG17)', () => {
    const friends = friendlyReportDataOf().players.filter((player) => player.isFriend).map((player) => player.id);
    expect(friends).toEqual(['player-pedro']);
  });

  it('o formato padrão é o do último amistoso que ele lançou (§6.1)', () => {
    expect(friendlyReportDataOf().lastFormat).toBe('one_set_of_8');
  });

  it('sem amistoso lançado, não há formato anterior', () => {
    expect(friendlyReportDataOf('player-gustavo').lastFormat).toBeNull();
  });

  it('jogador inexistente é erro com o id recebido', () => {
    expect(() => friendlyReportDataOf('player-ninguem')).toThrow("'player-ninguem'");
  });
});
