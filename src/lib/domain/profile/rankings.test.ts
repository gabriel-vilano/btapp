import { describe, expect, it } from 'vitest';
import { mockDomain, mockEntities, mockProfileDomain } from '@/src/mocks/domain';
import { doubles, rankingMatch, win } from '../match-count/matchCount.test-utils';
import { closed } from '../standings.test-utils';
import { bestPosition, profileRankings } from './rankings';
import { DURING, enrolledIn, profileDomain, snapshot, testSeason } from './profile.test-utils';

// Seção "Rankings" do perfil (docs/PROFILE.md, PF10–PF15).

const { players, masculinoB, mistaC40, rankingCategories } = mockEntities;
const NOW = new Date().toISOString();

describe('bestPosition (PF14)', () => {
  const enrollment = enrolledIn(doubles('x', 'z'), 'cat-test');
  const photos = [snapshot(enrollment, 4), snapshot(enrollment, 2, 'round-test-2')];

  it('é a menor entre as fotos de fim de rodada e a posição ao vivo', () => {
    expect(bestPosition(photos, enrollment.id, 5)).toBe(2);
  });

  it('some quando é igual à atual: ao vivo em 2º, com 2º como melhor foto', () => {
    expect(bestPosition(photos, enrollment.id, 2)).toBeNull();
  });

  it('some quando a posição ao vivo é a melhor da temporada', () => {
    expect(bestPosition(photos, enrollment.id, 1)).toBeNull();
  });

  it('some sem foto (primeira rodada) e sem posição ao vivo', () => {
    expect(bestPosition([], enrollment.id, 3)).toBeNull();
    expect(bestPosition(photos, enrollment.id, null)).toBeNull();
  });

  it('ignora as fotos de outras inscrições', () => {
    const other = snapshot(enrolledIn(doubles('y', 'w'), 'cat-test'), 1);
    expect(bestPosition([...photos, other], enrollment.id, 3)).toBe(2);
  });
});

describe('profileRankings: mocks do domínio', () => {
  it('próprio perfil do Lucas: 3º ao vivo, com "Melhor: 1º" da foto da rodada 1', () => {
    // Ao vivo, a r3-6 confirmada levou a T5 (402) para cima da T1 (364)
    const view = { playerId: players.lucas.id, viewerId: players.lucas.id, now: NOW };
    expect(profileRankings(mockDomain, view)).toEqual([
      {
        enrollment_id: masculinoB.t1.id,
        competition_id: mockEntities.ranking.id,
        category_id: rankingCategories.masculinoB.id,
        season_id: mockEntities.season.id,
        partner_id: players.rafael.id,
        position: 3,
        best_position: 1,
      },
    ]);
  });

  it('perfil do Lucas visto por outro jogador: mesma posição, sem melhor posição (PF3)', () => {
    const [row] = profileRankings(mockDomain, { playerId: players.lucas.id, viewerId: players.pedro.id, now: NOW });
    expect([row.position, row.best_position]).toEqual([3, null]);
  });

  it('inscrição encerrada por troca de parceiro fica fora (PF15)', () => {
    // A Júlia jogou com o Roberto (M4, encerrada) e hoje joga com o Vinícius (M5)
    const rows = profileRankings(mockDomain, { playerId: players.julia.id, viewerId: players.julia.id, now: NOW });
    expect(rows.map((row) => row.enrollment_id)).toEqual([mistaC40.m5.id]);
  });

  it('temporada encerrada fica fora: vai para "Temporadas" (PF19)', () => {
    const rows = profileRankings(mockProfileDomain, { playerId: players.lucas.id, viewerId: players.lucas.id, now: NOW });
    expect(rows.map((row) => row.enrollment_id)).toEqual([masculinoB.t1.id]);
  });

  it('jogador sem inscrição ativa: seção vazia (PF2)', () => {
    // A Marina organiza o ranking e não joga nele
    expect(profileRankings(mockDomain, { playerId: players.marina.id, viewerId: players.lucas.id, now: NOW })).toEqual([]);
  });

  it('inscrição de torneio não entra: não tem classificação', () => {
    // O Henrique joga o Masculino B com o Gustavo e o torneio de simples
    const rows = profileRankings(mockDomain, { playerId: players.henrique.id, viewerId: players.henrique.id, now: NOW });
    expect(rows.map((row) => row.enrollment_id)).toEqual([masculinoB.t6.id]);
  });
});

describe('profileRankings: regras', () => {
  const [xz, yw, xv, uv] = [doubles('x', 'z'), doubles('y', 'w'), doubles('x', 'v'), doubles('u', 'v')];
  // O X joga a categoria de teste (com Z) e a "cat-other" (com V)
  const xzTest = enrolledIn(xz, 'cat-test');
  const ywTest = enrolledIn(yw, 'cat-test');
  const xvOther = enrolledIn(xv, 'cat-other');
  const uvOther = enrolledIn(uv, 'cat-other');
  const enrollments = [xzTest, ywTest, xvOther, uvOther];
  const units = [xz, yw, xv, uv];
  // X é 2º na categoria de teste e 1º na "cat-other"
  const matches = [
    { ...rankingMatch(yw, xz, win(6, 4)), side_a_enrollment_id: ywTest.id, side_b_enrollment_id: xzTest.id },
    {
      ...rankingMatch(xv, uv, win(6, 2)),
      category_id: 'cat-other',
      side_a_enrollment_id: xvOther.id,
      side_b_enrollment_id: uvOther.id,
    },
  ];
  const domain = profileDomain({ units, enrollments, matches });
  const view = (viewerId: string) => ({ playerId: 'player-x', viewerId, now: DURING });

  it('próprio perfil: a melhor posição primeiro (PF12)', () => {
    expect(profileRankings(domain, view('player-x')).map((row) => [row.category_id, row.position])).toEqual([
      ['cat-other', 1],
      ['cat-test', 2],
    ]);
  });

  it('outro jogador: a categoria em comum com quem vê vem primeiro, mesmo pior (PF12)', () => {
    // Y está inscrito só na categoria de teste
    expect(profileRankings(domain, view('player-y')).map((row) => row.category_id)).toEqual(['cat-test', 'cat-other']);
  });

  it('quem vê sem categoria em comum: a melhor posição primeiro', () => {
    expect(profileRankings(domain, view('player-u')).map((row) => row.category_id)).toEqual(['cat-other', 'cat-test']);
  });

  it('o parceiro é o da inscrição: uma posição por dupla (PF11)', () => {
    expect(profileRankings(domain, view('player-x')).map((row) => row.partner_id)).toEqual(['player-v', 'player-z']);
  });

  it('categoria sem partida confirmada: sem posição, no fim da lista (RK20)', () => {
    const noMatches = profileDomain({ units, enrollments, matches: [matches[1]] });
    expect(profileRankings(noMatches, view('player-x')).map((row) => [row.category_id, row.position])).toEqual([
      ['cat-other', 1],
      ['cat-test', null],
    ]);
  });

  it('inscrito sem partida numa categoria com jogos: a posição da tabela', () => {
    const newcomer = doubles('q', 'r');
    const withNewcomer = profileDomain({
      units: [...units, newcomer],
      enrollments: [...enrollments, enrolledIn(newcomer, 'cat-test')],
      matches,
    });
    const rows = profileRankings(withNewcomer, { playerId: 'player-q', viewerId: 'player-q', now: DURING });
    expect(rows.map((row) => row.position)).toEqual([3]);
  });

  it('inscrição encerrada fica fora e temporada encerrada também', () => {
    const closedDomain = profileDomain({
      units,
      enrollments: [closed(xzTest, DURING), ywTest, xvOther, uvOther],
      matches,
      seasons: [testSeason()],
    });
    expect(profileRankings(closedDomain, view('player-x')).map((row) => row.category_id)).toEqual(['cat-other']);
    expect(profileRankings(domain, { ...view('player-x'), now: '2026-07-01T00:00:00Z' })).toEqual([]);
  });
});
