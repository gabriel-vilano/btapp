import { describe, expect, it } from 'vitest';
import type { Milestone } from '@/src/types/domain';
import { mockDomain, mockEntities, mockProfileDomain, pastSeasonEntities } from '@/src/mocks/domain';
import { doubles, rankingMatch, win } from '../match-count/matchCount.test-utils';
import { closed, SEASON_ID, testRounds } from '../standings.test-utils';
import { profileSeasons } from './seasons';
import { AFTER, DURING, enrolledIn, profileDomain, testSeason } from './profile.test-utils';

// Seção "Temporadas" do perfil (docs/PROFILE.md, PF19).

const { players, ranking, rankingCategories } = mockEntities;
const { season: past, masculinoB: pastMB } = pastSeasonEntities;
const NOW = new Date().toISOString();

describe('profileSeasons: mocks da temporada encerrada', () => {
  const row = (partial: object) => ({
    season_id: past.id,
    competition_id: ranking.id,
    category_id: rankingCategories.masculinoB.id,
    ...partial,
  });

  it('Lucas: 3º no fim, Top 2 na rodada 1, fora da Saideira', () => {
    expect(profileSeasons(mockProfileDomain, players.lucas.id, NOW)).toEqual([
      row({ enrollment_id: pastMB.p1.id, partner_id: players.rafael.id, final_position: 3,
        milestones: [{ type: 'top_n', n: 2 }], final_name: null }),
    ]);
  });

  it('Pedro: 2º, Top 2 e classificado para a Saideira', () => {
    const [pedro] = profileSeasons(mockProfileDomain, players.pedro.id, NOW);
    expect([pedro.final_position, pedro.milestones, pedro.final_name]).toEqual([
      2, [{ type: 'top_n', n: 2 }], 'Saideira',
    ]);
  });

  it('André: Líder antes de Top 2', () => {
    const [andre] = profileSeasons(mockProfileDomain, players.andre.id, NOW);
    expect([andre.final_position, andre.milestones]).toEqual([1, [{ type: 'leader' }, { type: 'top_n', n: 2 }]]);
  });

  it('temporada aberta não entra: está em "Rankings"', () => {
    expect(profileSeasons(mockDomain, players.lucas.id, NOW)).toEqual([]);
  });

  it('jogador sem temporada encerrada: seção vazia (PF2)', () => {
    expect(profileSeasons(mockProfileDomain, players.marcos.id, NOW)).toEqual([]);
  });
});

describe('profileSeasons: regras', () => {
  const [xz, yw, xv] = [doubles('x', 'z'), doubles('y', 'w'), doubles('x', 'v')];
  const [xzTest, ywTest] = [enrolledIn(xz, 'cat-test'), enrolledIn(yw, 'cat-test')];
  const matches = [{ ...rankingMatch(xz, yw, win(6, 4)), side_a_enrollment_id: xzTest.id, side_b_enrollment_id: ywTest.id }];

  it('inscrição encerrada por troca de parceiro aparece, com a posição congelada (PF15)', () => {
    const domain = profileDomain({ units: [xz, yw], enrollments: [closed(xzTest, DURING), ywTest], matches });
    const [row] = profileSeasons(domain, 'player-x', AFTER);
    expect([row.enrollment_id, row.final_position]).toEqual([xzTest.id, 1]);
  });

  it('mais recente primeiro', () => {
    const older = testSeason({ id: 'season-older', ends_on: '2025-12-31' });
    const olderEnrollment = enrolledIn(xv, 'cat-test', older.id);
    const domain = profileDomain({
      units: [xz, yw, xv],
      enrollments: [olderEnrollment, xzTest, ywTest],
      matches,
      seasons: [older, testSeason()],
    });
    expect(profileSeasons(domain, 'player-x', AFTER).map((row) => row.season_id)).toEqual([SEASON_ID, older.id]);
  });

  it('temporada sem final: sem classificação; sem marco: lista vazia', () => {
    const domain = profileDomain({ units: [xz, yw], enrollments: [xzTest, ywTest], matches });
    const [row] = profileSeasons(domain, 'player-y', AFTER);
    expect([row.final_position, row.milestones, row.final_name]).toEqual([2, [], null]);
  });

  it('classificação para a final vem da posição na data de corte (R28)', () => {
    const final = { name: 'Finals', qualifiers: 1, cutoff_date: '2026-03-01T00:00:00Z', tournament_id: null };
    const domain = profileDomain({ units: [xz, yw], enrollments: [xzTest, ywTest], matches, seasons: [testSeason({ final })] });
    expect(profileSeasons(domain, 'player-x', AFTER)[0].final_name).toBe('Finals');
    expect(profileSeasons(domain, 'player-y', AFTER)[0].final_name).toBeNull();
  });

  it('marcos da própria inscrição, não de outra do jogador', () => {
    const leader: Milestone = {
      id: 'milestone-yw', type: 'leader', enrollment_id: ywTest.id, season_id: SEASON_ID,
      round_id: testRounds.first.id, achieved_at: testRounds.first.deadline,
    };
    const domain = profileDomain({ units: [xz, yw], enrollments: [xzTest, ywTest], matches, milestones: [leader] });
    expect(profileSeasons(domain, 'player-x', AFTER)[0].milestones).toEqual([]);
  });
});
