import { describe, expect, it } from 'vitest';
import { headToHeadPath, matchPath, playerMatchesPath, playerPath } from './routes';

describe('rotas do perfil', () => {
  it('perfil, partidas e H2H do jogador pelo @username', () => {
    expect([playerPath('lucassilva'), playerMatchesPath('lucassilva'), headToHeadPath('lucassilva')]).toEqual([
      '/jogadores/lucassilva',
      '/jogadores/lucassilva/partidas',
      '/jogadores/lucassilva/h2h',
    ]);
  });

  it('escapa o segmento', () => {
    expect(matchPath('a/b')).toBe('/jogos/a%2Fb');
  });
});
