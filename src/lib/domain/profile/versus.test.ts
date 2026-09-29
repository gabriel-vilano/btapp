import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { doubles, rankingMatch, win } from '../match-count/matchCount.test-utils';
import { profileVersus } from './versus';
import { definedMatch, enrolledIn, profileDomain } from './profile.test-utils';

// Bloco "Vocês" (docs/PROFILE.md, PF16 e PF17).

const { players } = mockEntities;

describe('profileVersus: mocks do domínio', () => {
  it('Lucas vendo o André: final do torneio marcada e a derrota na r2-1', () => {
    expect(profileVersus(mockDomain, players.andre.id, players.lucas.id)).toEqual({
      next_match_id: 'match-copa-sunset-mb-final',
      head_to_head: { match_ids: ['match-arena-rm-mb-r2-1'], wins: 0, losses: 1 },
    });
  });

  it('Lucas vendo o Pedro: H2H de quem vê, sem confronto definido', () => {
    // r1-1 do ranking e o amistoso; a r3-4 aguarda confirmação e não é "definido"
    expect(profileVersus(mockDomain, players.pedro.id, players.lucas.id)).toEqual({
      next_match_id: null,
      head_to_head: { match_ids: ['match-arena-rm-mb-r1-1', 'match-friendly-lucas-rafael-pedro-thiago'], wins: 2, losses: 0 },
    });
  });

  it('H2H sem confronto: só o próximo jogo, ainda sem data', () => {
    // r3-1 (T1 × T4) sem data acordada; a r2-5 entre eles foi cancelada
    expect(profileVersus(mockDomain, players.caio.id, players.lucas.id)).toEqual({
      next_match_id: 'match-arena-rm-mb-r3-1',
      head_to_head: null,
    });
  });

  it('só W.O. entre os dois: o bloco some', () => {
    // André e Bruno × Caio e Diego só têm a r1-3, W.O.; a r3-5 está em arbitragem
    expect(profileVersus(mockDomain, players.caio.id, players.andre.id)).toBeNull();
  });

  it('sem confronto nem H2H: o bloco some (PF2)', () => {
    expect(profileVersus(mockDomain, players.marcos.id, players.lucas.id)).toBeNull();
  });

  it('próprio perfil: o bloco não existe (PF3)', () => {
    expect(profileVersus(mockDomain, players.lucas.id, players.lucas.id)).toBeNull();
  });

  it('parceiro do mesmo lado não é adversário', () => {
    expect(profileVersus(mockDomain, players.rafael.id, players.lucas.id)).toBeNull();
  });
});

describe('profileVersus: próximo confronto (PF16)', () => {
  const [xz, yw, xv] = [doubles('x', 'z'), doubles('y', 'w'), doubles('x', 'v')];
  const units = [xz, yw, xv];
  const [xzTest, ywTest, xvOther] = [enrolledIn(xz, 'cat-test'), enrolledIn(yw, 'cat-test'), enrolledIn(xv, 'cat-other')];
  const enrollments = [xzTest, ywTest, xvOther];

  it('com data acordada vence o sem data; entre datas, a mais próxima', () => {
    const matches = [
      definedMatch(xzTest, ywTest, null, 'sem-data'),
      definedMatch(ywTest, xvOther, '2026-02-10T14:00:00Z', 'depois'),
      definedMatch(xzTest, ywTest, '2026-02-05T14:00:00Z', 'antes'),
    ];
    const versus = profileVersus(profileDomain({ units, enrollments, matches }), 'player-y', 'player-x');
    expect(versus?.next_match_id).toBe(matches[2].id);
  });

  it('confronto com qualquer parceiro de quem vê conta', () => {
    const matches = [definedMatch(ywTest, xvOther, null)];
    const versus = profileVersus(profileDomain({ units, enrollments, matches }), 'player-y', 'player-x');
    expect(versus).toEqual({ next_match_id: matches[0].id, head_to_head: null });
  });

  it('partida já jogada não é próximo confronto', () => {
    const played = { ...rankingMatch(xz, yw, win(6, 4)), side_a_enrollment_id: xzTest.id, side_b_enrollment_id: ywTest.id };
    const versus = profileVersus(profileDomain({ units, enrollments, matches: [played] }), 'player-y', 'player-x');
    expect(versus).toEqual({ next_match_id: null, head_to_head: { match_ids: [played.id], wins: 1, losses: 0 } });
  });
});
