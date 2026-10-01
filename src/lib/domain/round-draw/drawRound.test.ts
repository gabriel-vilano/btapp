import { describe, expect, it } from 'vitest';
import type { Enrollment, RankingMatch } from '@/src/types/domain';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { drawRound, RoundDrawError, type RoundDrawInput } from './drawRound';
import { pairKey, type Pairing } from './pairHistory';
import { gamesPerUnit, hasDuplicateInRound } from './roundDraw.test-utils';
import { createSeededRandom } from './seededRandom';

// Sorteio da rodada com o cenário dos mocks: ranking no modelo do Vila
// (2 jogos por rodada). A Mista C 40+ ainda não sorteou a rodada 3, e o
// Masculino B ainda não sorteou a 4.

const { ranking, rounds, rankingCategories, masculinoB, mistaC40, tournamentCategories } = mockEntities;
const DRAWN_AT = '2026-09-26T12:00:00.000Z';
const DRAWN_BY = mockEntities.players.marina.id; // a admin do ranking nos mocks
const rankingMatches = mockDomain.matches.filter((m): m is RankingMatch => m.kind === 'ranking');

function idSequence(): () => string {
  let next = 0;
  return () => `match-draw-${++next}`;
}

function input(overrides: Partial<RoundDrawInput> = {}): RoundDrawInput {
  return {
    ranking,
    round: rounds.third,
    category: rankingCategories.mistaC40,
    enrollments: mockDomain.enrollments,
    seasonMatches: rankingMatches,
    drawnBy: DRAWN_BY,
    drawnAt: DRAWN_AT,
    random: createSeededRandom(1),
    createMatchId: idSequence(),
    ...overrides,
  };
}

function pairingsOf(matches: RankingMatch[]): Pairing[] {
  return matches.map((m) => [m.side_a_enrollment_id, m.side_b_enrollment_id]);
}

describe('drawRound: partidas criadas', () => {
  it('cria as partidas em "Confronto definido", na rodada, com o formato do ranking e quem sorteou (R51)', () => {
    const matches = drawRound(input());
    expect(matches).toHaveLength(4);
    for (const match of matches) {
      expect(match).toMatchObject({
        kind: 'ranking',
        status: 'defined',
        competition_id: ranking.id,
        category_id: rankingCategories.mistaC40.id,
        round_id: rounds.third.id,
        format: ranking.match_format,
        scheduled_at: null,
        venue: null,
        created_at: DRAWN_AT,
        drawn_by: DRAWN_BY,
        undone_reports: [],
      });
    }
    expect(matches.map((m) => m.id)).toEqual(['match-draw-1', 'match-draw-2', 'match-draw-3', 'match-draw-4']);
  });

  it('cada dupla ativa joga os 2 jogos do ranking; a inscrição encerrada fica de fora (R45)', () => {
    const games = gamesPerUnit(pairingsOf(drawRound(input())));
    expect(games.get(mistaC40.m4.id)).toBeUndefined();
    expect([mistaC40.m1, mistaC40.m2, mistaC40.m3, mistaC40.m5].map((e) => games.get(e.id))).toEqual([2, 2, 2, 2]);
  });

  it('usa o confronto novo e evita o que mais se repetiu na temporada (R30)', () => {
    // Na temporada: M1 × M2 jogaram 2 vezes; M1 × M5 nunca jogaram. O único
    // ciclo de 4 duplas com a menor repetição deixa de fora M1 × M2 e M3 × M5.
    for (let seed = 1; seed <= 20; seed++) {
      const keys = pairingsOf(drawRound(input({ random: createSeededRandom(seed) }))).map((p) => pairKey(...p));
      expect(keys).toContain(pairKey(mistaC40.m1.id, mistaC40.m5.id));
      expect(keys).not.toContain(pairKey(mistaC40.m1.id, mistaC40.m2.id));
      expect(keys).not.toContain(pairKey(mistaC40.m3.id, mistaC40.m5.id));
    }
  });

  it('a mesma semente reproduz o mesmo sorteio', () => {
    const round4 = { round: rounds.fourth, category: rankingCategories.masculinoB };
    const first = drawRound(input({ ...round4, random: createSeededRandom(5) }));
    const second = drawRound(input({ ...round4, random: createSeededRandom(5) }));
    expect(first).toEqual(second);
    expect(first).toHaveLength(6);
  });

  it('ignora inscrições de outra temporada', () => {
    const otherSeason: Enrollment = { ...masculinoB.t1, id: 'enr-outra-temporada', season_id: 'season-antiga' };
    const matches = drawRound(input({ enrollments: [...mockDomain.enrollments, otherSeason] }));
    expect(pairingsOf(matches).flat()).not.toContain('enr-outra-temporada');
  });

  it('sem fonte de aleatoriedade nem gerador de id, usa os padrões do runtime', () => {
    const matches = drawRound({ ...input(), random: undefined, createMatchId: undefined });
    expect(matches).toHaveLength(4);
    expect(new Set(matches.map((m) => m.id)).size).toBe(4);
  });
});

describe('drawRound: partida cancelada não conta como confronto (R30)', () => {
  // Histórico montado à mão na Mista C 40+, com as 4 duplas ativas da rodada 3.
  // A cancelada e a anulada não aconteceram, então o confronto delas volta
  // para o sorteio (decisão do Gabriel de 27/09).
  type CancelledMatch = Extract<RankingMatch, { status: 'cancelled' }>;
  const playedTemplate = rankingMatches.find((m) => m.status === 'confirmed');
  const cancelledTemplate = rankingMatches.find((m): m is CancelledMatch => m.status === 'cancelled');
  if (!playedTemplate || !cancelledTemplate) throw new Error('Mocks sem partida confirmada ou cancelada no ranking');
  const annulledTemplate: CancelledMatch = { ...cancelledTemplate, reason: 'annulled' };
  const { m1, m2, m3, m5 } = mistaC40;
  let nextHistoryId = 0;

  function pastMatch(template: RankingMatch, a: Enrollment, b: Enrollment): RankingMatch {
    return {
      ...template,
      id: `match-hist-${++nextHistoryId}`,
      category_id: rankingCategories.mistaC40.id,
      round_id: rounds.first.id,
      side_a_enrollment_id: a.id,
      side_b_enrollment_id: b.id,
    };
  }

  it('o confronto cancelado ou anulado volta ao sorteio antes de repetir um confronto jogado', () => {
    // Jogados: M1×M2, M3×M5, M1×M3 e M2×M5. Cancelado: M1×M5. Anulado: M2×M3.
    // Se as duas não contassem como jogo feito, todo ciclo repetiria 4 confrontos;
    // sem contar, o melhor ciclo usa M1×M5 e M2×M3 e repete só 2.
    const seasonMatches = [
      pastMatch(playedTemplate, m1, m2),
      pastMatch(playedTemplate, m3, m5),
      pastMatch(playedTemplate, m1, m3),
      pastMatch(playedTemplate, m2, m5),
      pastMatch(cancelledTemplate, m1, m5),
      pastMatch(annulledTemplate, m2, m3),
    ];
    for (let seed = 1; seed <= 20; seed++) {
      const keys = pairingsOf(drawRound(input({ seasonMatches, random: createSeededRandom(seed) }))).map((p) => pairKey(...p));
      expect(keys).toContain(pairKey(m1.id, m5.id));
      expect(keys).toContain(pairKey(m2.id, m3.id));
    }
  });

  it('o mesmo confronto continua sem sair duas vezes na mesma rodada', () => {
    // M1×M5 cancelado três vezes e 4 jogos por rodada: cada dupla só tem 3
    // adversários, então enfrenta cada um uma vez (a rodada fica com 6 jogos).
    const seasonMatches = [1, 2, 3].map(() => pastMatch(cancelledTemplate, m1, m5));
    const rankin = { ...ranking, matches_per_round: 4 };
    for (let seed = 1; seed <= 20; seed++) {
      const pairings = pairingsOf(drawRound(input({ ranking: rankin, seasonMatches, random: createSeededRandom(seed) })));
      expect(pairings).toHaveLength(6);
      expect(hasDuplicateInRound(pairings)).toBe(false);
    }
  });
});

describe('drawRound: recusas', () => {
  it('recusa sortear de novo uma rodada que já tem partidas na categoria', () => {
    const call = () => drawRound(input({ category: rankingCategories.masculinoB }));
    expect(call).toThrow(RoundDrawError);
    expect(call).toThrow(rounds.third.id);
  });

  it('recusa categoria de outra competição', () => {
    const call = () => drawRound(input({ category: tournamentCategories.masculinoB }));
    expect(call).toThrow(expect.objectContaining({ code: 'category_mismatch' }));
  });

  it('recusa categoria com menos de duas inscrições ativas', () => {
    const call = () => drawRound(input({ enrollments: [mistaC40.m1, mistaC40.m4] }));
    expect(call).toThrow(expect.objectContaining({ code: 'not_enough_units' }));
  });
});
