import type {
  CompetitionCategory,
  DefinedState,
  Enrollment,
  RankingCompetition,
  RankingMatch,
  Round,
} from '@/src/types/domain';
import { drawPairings } from './drawPairings';
import { countPairs, type Pairing } from './pairHistory';
import type { RandomSource } from './seededRandom';

// Sorteio da rodada do ranking (docs/DOMAIN.md, R7 e R30). O sorteio não é
// guardado como entidade: ele cria as partidas, todas em "Confronto definido".

export type DrawnMatch = Extract<RankingMatch, DefinedState>;

export type RoundDrawErrorCode =
  | 'category_mismatch' // a categoria não é do ranking
  | 'already_drawn' // a rodada já tem partidas nesta categoria
  | 'not_enough_units'; // menos de duas inscrições ativas

/** Recusa do sorteio. O `code` é para a interface; o texto, para quem depura. */
export class RoundDrawError extends Error {
  readonly code: RoundDrawErrorCode;

  constructor(code: RoundDrawErrorCode, message: string) {
    super(message);
    this.name = 'RoundDrawError';
    this.code = code;
  }
}

export interface RoundDrawInput {
  ranking: RankingCompetition;
  round: Round;
  category: CompetitionCategory;
  enrollments: readonly Enrollment[]; // pode vir com as de outras categorias: o sorteio filtra
  seasonMatches: readonly RankingMatch[]; // partidas já sorteadas na temporada da rodada
  drawnAt: string; // ISO 8601: vira o created_at das partidas
  random?: RandomSource; // padrão: Math.random; o teste passa createSeededRandom
  createMatchId?: () => string; // padrão: crypto.randomUUID
}

// A inscrição encerrada fica congelada na classificação e não joga mais (R17, R45).
function drawableEnrollmentIds({ enrollments, category, round }: RoundDrawInput): string[] {
  return enrollments
    .filter((e) => e.status === 'active' && e.category_id === category.id && e.season_id === round.season_id)
    .map((e) => e.id);
}

// Toda partida sorteada conta como confronto, até a cancelada: o sorteio já
// pôs as duas duplas frente a frente naquela rodada.
function categoryHistory({ seasonMatches, category }: RoundDrawInput): Pairing[] {
  return seasonMatches
    .filter((match) => match.category_id === category.id)
    .map((match) => [match.side_a_enrollment_id, match.side_b_enrollment_id]);
}

function assertDrawable(input: RoundDrawInput, unitIds: readonly string[]): void {
  const { ranking, round, category, seasonMatches } = input;
  if (category.competition_id !== ranking.id) {
    throw new RoundDrawError('category_mismatch', `Categoria '${category.id}' é da competição '${category.competition_id}', esperado '${ranking.id}'`);
  }
  if (seasonMatches.some((m) => m.round_id === round.id && m.category_id === category.id)) {
    throw new RoundDrawError('already_drawn', `Rodada '${round.id}' já sorteada na categoria '${category.id}'`);
  }
  if (unitIds.length < 2) {
    throw new RoundDrawError('not_enough_units', `Categoria '${category.id}' tem ${unitIds.length} inscrição(ões) ativa(s), esperado ao menos 2`);
  }
}

function toMatch(input: RoundDrawInput, [sideA, sideB]: Pairing, id: string): DrawnMatch {
  return {
    id,
    kind: 'ranking',
    competition_id: input.ranking.id,
    category_id: input.category.id,
    round_id: input.round.id,
    side_a_enrollment_id: sideA,
    side_b_enrollment_id: sideB,
    format: input.ranking.match_format, // o ranking tem um formato só (R29)
    scheduled_at: null, // a data sai das propostas de horário (R34, R35)
    venue: null,
    created_at: input.drawnAt,
    status: 'defined',
  };
}

/**
 * Sorteia os confrontos de uma rodada numa categoria e devolve as partidas
 * criadas. Cada dupla ativa joga o número de jogos por rodada do ranking, sem
 * repetir confronto da temporada enquanto houver combinação nova (R30).
 *
 * @example
 * const matches = drawRound({ ranking, round, category, enrollments, seasonMatches, drawnAt: now });
 */
export function drawRound(input: RoundDrawInput): DrawnMatch[] {
  const unitIds = drawableEnrollmentIds(input);
  assertDrawable(input, unitIds);
  const problem = {
    unitIds,
    matchesPerUnit: input.ranking.matches_per_round,
    history: countPairs(categoryHistory(input)),
  };
  const createId = input.createMatchId ?? (() => crypto.randomUUID());
  return drawPairings(problem, input.random ?? Math.random).map((pairing) => toMatch(input, pairing, createId()));
}
