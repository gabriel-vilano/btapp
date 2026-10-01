import { describe, expect, it } from 'vitest';
import { mockEntities, mockProfileDomain } from '@/src/mocks/domain';
import { buildPlayerMatches } from './playerMatches';
import { buildProfilePage } from './buildProfilePage';

// Lista completa das partidas de outro jogador (PROFILE.md PF18) sobre os mocks do domínio.

const { players } = mockEntities;
const NOW = '2026-09-30T12:00:00Z';

function profileRecentMatches(username: string) {
  const page = buildProfilePage(mockProfileDomain, {
    username,
    viewerId: players.lucas.id,
    now: NOW,
    links: { rankingHref: () => '/ranking' },
  });
  if (page?.recent_matches.status !== 'ready') throw new Error(`Teste: perfil de @${username} sem partidas recentes`);
  return page.recent_matches.data;
}

describe('buildPlayerMatches', () => {
  it('@username inexistente: null, para "Jogador não encontrado"', () => {
    expect(buildPlayerMatches(mockProfileDomain, 'ninguem')).toBeNull();
  });

  it('todas as partidas, sem o limite de 5 da seção do perfil', () => {
    const list = buildPlayerMatches(mockProfileDomain, players.pedro.username);
    expect(list?.matches).toHaveLength(8);
  });

  it('a mais recente primeiro, e começa pelas mesmas linhas de "Partidas recentes"', () => {
    const matches = buildPlayerMatches(mockProfileDomain, players.pedro.username)?.matches ?? [];
    const dates = matches.map((item) => Date.parse(item.played_at));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
    expect(matches.slice(0, 5)).toEqual(profileRecentMatches(players.pedro.username));
  });

  it('o "Voltar" leva ao perfil público do dono da lista', () => {
    const list = buildPlayerMatches(mockProfileDomain, players.pedro.username);
    expect(list).toMatchObject({ owner: { name: 'Pedro Henrique', username: 'pedrohenrique' }, profile_href: '/jogadores/pedrohenrique' });
  });

  it('jogador sem partida: lista vazia', () => {
    expect(buildPlayerMatches(mockProfileDomain, players.marina.username)?.matches).toEqual([]);
  });
});
