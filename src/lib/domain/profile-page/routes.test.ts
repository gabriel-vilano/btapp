import { describe, expect, it } from 'vitest';
import { headToHeadPath, matchPath, playerMatchesPath, playerPath, rankingPath } from './routes';

describe('rotas do perfil', () => {
  it('perfil, partidas e H2H do jogador pelo @username', () => {
    expect([playerPath('lucassilva'), playerMatchesPath('lucassilva'), headToHeadPath('lucassilva')]).toEqual([
      '/jogadores/lucassilva',
      '/jogadores/lucassilva/partidas',
      '/jogadores/lucassilva/h2h',
    ]);
  });

  it('classificação da temporada atual e de uma encerrada (RK1, RK21)', () => {
    expect([rankingPath('cat-1'), rankingPath('cat-1', 'season-1')]).toEqual([
      '/ranking/cat-1',
      '/ranking/cat-1?temporada=season-1',
    ]);
  });

  it('escapa o segmento', () => {
    expect(matchPath('a/b')).toBe('/jogos/a%2Fb');
  });
});
