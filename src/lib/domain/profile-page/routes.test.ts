import { describe, expect, it } from 'vitest';
import { headToHeadPath, matchPath, playerMatchesPath, playerPath } from './routes';

describe('rotas do perfil', () => {
  it('perfil e partidas do jogador pelo @username', () => {
    expect([playerPath('lucassilva'), playerMatchesPath('lucassilva')]).toEqual([
      '/jogadores/lucassilva',
      '/jogadores/lucassilva/partidas',
    ]);
  });

  it('H2H jogador × jogador, com quem vê à esquerda (HH5)', () => {
    expect(headToHeadPath('lucassilva', 'pedrohenrique')).toBe('/h2h/lucassilva/pedrohenrique');
  });

  it('escapa o segmento', () => {
    expect(matchPath('a/b')).toBe('/jogos/a%2Fb');
  });
});
