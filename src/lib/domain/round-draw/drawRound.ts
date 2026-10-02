import type {
  CompetitionCategory,
  DefinedState,
  Enrollment,
  RankingCompetition,
  RankingMatch,
  Round,
} from '@/src/types/domain';
import { activeEnrollmentIds } from './activeUnits';
import { drawPairings } from './drawPairings';
import { countPairs, type Pairing } from './pairHistory';
import type { RandomSource } from './seededRandom';

// Sorteio da rodada do ranking (docs/DOMAIN.md, R7 e R30). O sorteio não é
// guardado como entidade: ele cria as partidas, todas em "Confronto definido",
// e cada partida guarda quem sorteou (`drawnBy`) e quando (`drawnAt`) (R51).

export type DrawnMatch = Extract<RankingMatch, DefinedState> & { drawn_by: string };

export type RoundDrawErrorCode =
  | 'category_mismatch' // a categoria não é do ranking
  | 'already_drawn' // a rodada já tem partidas nesta categoria
  | 'not_enough_units' // menos de duas inscrições ativas
  | 'nothing_to_draw'; // sorteio da rodada sem nenhuma categoria que entre (SR8)

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
  drawnBy: string; // player_id do admin que sorteou
  drawnAt: string; // ISO 8601: vira o created_at das partidas
  random?: RandomSource; // padrão: Math.random; o teste passa createSeededRandom
  createMatchId?: () => string; // padrão: crypto.randomUUID
}

// A partida cancelada (cancelamento ou anulação) não conta como confronto:
// o jogo não aconteceu, e as duas duplas podem ser sorteadas de novo (R30,
// decisão do Gabriel de 27/09). As demais contam mesmo antes do resultado,
// porque o confronto já está marcado.
function categoryHistory({ seasonMatches, category }: RoundDrawInput): Pairing[] {
  return seasonMatches
    .filter((match) => match.category_id === category.id && match.status !== 'cancelled')
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
    undone_reports: [],
    side_a_enrollment_id: sideA,
    side_b_enrollment_id: sideB,
    format: input.ranking.match_format, // o ranking tem um formato só (R29)
    scheduled_at: null, // a data sai das propostas de horário (R34, R35)
    venue: null,
    created_at: input.drawnAt,
    drawn_by: input.drawnBy,
    status: 'defined',
  };
}

/**
 * Sorteia os confrontos de uma rodada numa categoria e devolve as partidas
 * criadas. Cada dupla ativa joga o número de jogos por rodada do ranking, sem
 * repetir confronto da temporada enquanto houver combinação nova (R30).
 *
 * @example
 * const matches = drawRound({ ranking, round, category, enrollments, seasonMatches, drawnBy: adminId, drawnAt: now });
 */
export function drawRound(input: RoundDrawInput): DrawnMatch[] {
  const unitIds = activeEnrollmentIds(input.enrollments, input.category.id, input.round.season_id);
  assertDrawable(input, unitIds);
  const problem = {
    unitIds,
    matchesPerUnit: input.ranking.matches_per_round,
    history: countPairs(categoryHistory(input)),
  };
  const createId = input.createMatchId ?? (() => crypto.randomUUID());
  return drawPairings(problem, input.random ?? Math.random).map((pairing) => toMatch(input, pairing, createId()));
}
