import { describe, expect, it } from 'vitest';
import { mockEntities, mockExploreDomain } from '@/src/mocks/domain';
import type { CompetitionCategory, Enrollment, Friendship, Player } from '@/src/types/domain';
import { exploreDomain, NOW, organization, ranking, season, tournament } from './explore.test-utils';
import { FRIEND_SUPPORT_TEXT, searchPlayers, type SearchDomain } from './playerSearch';

// Cenário: o Lucas busca "silva". Cada jogador cai num nível da ordem da EX16.

function player(slug: string, name: string, username = slug): Player {
  return { id: slug, name, username, avatar_url: null, birth_date: '1990-01-01', total_matches: 10 };
}

function category(id: string, competitionId: string, level: string): CompetitionCategory {
  return { id, competition_id: competitionId, gender: 'M', modality: 'singles', level_min: level, level_max: level, min_age: null };
}

// Um jogador numa categoria: a unidade de simples é `unit-<jogador>`
function enrollment(playerId: string, cat: CompetitionCategory, seasonId: string | null): Enrollment {
  const id = `${playerId}-${cat.id}`;
  return { id, unit_id: `unit-${playerId}`, category_id: cat.id, season_id: seasonId, enrolled_at: NOW, status: 'active' };
}

function friendship(other: string, status: 'accepted' | 'pending'): Friendship {
  const base = { id: `f-${other}`, requester_id: 'lucas', addressee_id: other, requested_at: NOW };
  return status === 'accepted' ? { ...base, status, accepted_at: NOW } : { ...base, status };
}

const players = [
  player('lucas', 'Lucas Silva'),
  player('zeca', 'Zeca Silva'),
  player('aline', 'Aline Silva'),
  player('eva', 'Eva Silva'),
  player('caio', 'Caio Silva'),
  player('beto', 'Beto Silva'),
  player('ana', 'Ana Silva'),
  player('davi', 'Davi Costa', 'silva'),
  player('fora', 'Fora Souza'),
];

const rankingB = category('rk-b', 'rk', 'B');
const rankingC = category('rk-c', 'rk', 'C');
const oldRanking = category('old-b', 'rk-old', 'B');
const openC = category('open-c', 'open-t', 'C');
const openD = category('open-d', 'open-t', 'D');
const pastC = category('past-c', 'past-t', 'C');

const domain: SearchDomain = {
  ...exploreDomain({
    organizations: [organization('org-a', 'Arena Teste')],
    competitions: [
      ranking('rk', 'Ranking Teste'),
      ranking('rk-old', 'Ranking Antigo'),
      tournament('open-t', 'Copa Aberta', '2026-10-10T12:00:00.000Z', '2026-10-11T21:00:00.000Z'),
      tournament('past-t', 'Copa Passada', '2026-08-10T12:00:00.000Z', '2026-08-11T21:00:00.000Z'),
    ],
    seasons: [
      season('s-rk', 'rk', '2026-08-01T15:00:00.000Z', '2026-12-20T15:00:00.000Z'),
      season('s-old', 'rk-old', '2026-02-01T15:00:00.000Z', '2026-07-01T15:00:00.000Z'),
    ],
  }),
  players,
  friendships: [friendship('ana', 'accepted'), friendship('beto', 'pending')],
  categories: [rankingB, rankingC, oldRanking, openC, openD, pastC],
  units: players.map((p) => ({ id: `unit-${p.id}`, modality: 'singles', player_ids: [p.id] })),
  enrollments: [
    enrollment('lucas', rankingB, 's-rk'),
    enrollment('lucas', openC, null),
    enrollment('lucas', oldRanking, 's-old'),
    enrollment('lucas', pastC, null),
    enrollment('ana', rankingB, 's-rk'), // amiga e na mesma categoria: vale "Amigo"
    enrollment('beto', rankingC, 's-rk'),
    enrollment('beto', openC, null), // a categoria do Lucas vem antes
    enrollment('caio', openD, null),
    enrollment('eva', oldRanking, 's-old'), // temporada terminou
    enrollment('zeca', pastC, null), // torneio terminou
  ],
  matches: [],
  standingSnapshots: [],
  milestones: [],
};

const viewer = { viewerId: 'lucas', now: NOW };

describe('searchPlayers (EX14, EX16, EX17)', () => {
  it('ordem: @username igual, amigo, competição em comum, os demais; empate pelo nome', () => {
    expect(searchPlayers(domain, 'silva', viewer).map((r) => r.username)).toEqual([
      'silva',
      'ana',
      'beto',
      'caio',
      'aline',
      'eva',
      'zeca',
    ]);
  });

  it('não traz quem busca, e busca pelo @username com @', () => {
    expect(searchPlayers(domain, 'lucas', viewer)).toEqual([]);
    expect(searchPlayers(domain, '@dav', viewer).map((r) => r.name)).toEqual(['Davi Costa']);
  });

  it('linha de apoio: "Amigo", a competição em comum ou nada', () => {
    const support = Object.fromEntries(searchPlayers(domain, 'silva', viewer).map((r) => [r.username, r.support]));
    expect(support).toEqual({
      silva: null,
      ana: FRIEND_SUPPORT_TEXT,
      beto: 'Copa Aberta · Masculino C · Simples',
      caio: 'Copa Aberta · Masculino D · Simples',
      aline: null,
      eva: null,
      zeca: null,
    });
  });

  it('o resultado traz só nome, @username, avatar e a linha de apoio (§7.1)', () => {
    const results = searchPlayers(mockExploreDomain, 'mar', { viewerId: mockEntities.players.lucas.id, now: NOW });
    // O Marcos informou a data de nascimento: ela não pode sair no resultado
    expect(results.map((r) => r.username)).toContain(mockEntities.players.marcos.username);
    for (const result of results) {
      expect(Object.keys(result).sort()).toEqual(['avatar_url', 'name', 'support', 'username']);
    }
  });
});
