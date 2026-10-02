import type { CompetitionCategory } from '@/src/types/domain';
import { drawRound, RoundDrawError, type DrawnMatch, type RoundDrawInput } from './drawRound';

// Sorteio da rodada inteira (ROUND_DRAW.md SR4): um toque do admin sorteia
// todas as categorias da temporada, com o prazo da rodada, que é um só. Cada
// categoria passa pelo `drawRound` em separado; o "tudo ou nada" entre elas
// (SR9) é da camada que grava, numa transação.

export interface SeasonRoundDrawInput extends Omit<RoundDrawInput, 'category'> {
  categories: readonly CompetitionCategory[]; // as categorias do ranking, na ordem da tela
}

export interface DrawnCategory {
  category_id: string;
  matches: DrawnMatch[];
}

/** Categoria fora do sorteio por ter menos de 2 duplas ativas (SR14: pode entrar depois). */
export interface SkippedCategory {
  category_id: string;
  reason: 'not_enough_units';
}

export interface SeasonRoundDraw {
  round_id: string;
  drawn: DrawnCategory[];
  skipped: SkippedCategory[];
}

type CategoryOutcome = DrawnCategory | SkippedCategory;

function drawCategory(input: SeasonRoundDrawInput, category: CompetitionCategory): CategoryOutcome {
  try {
    return { category_id: category.id, matches: drawRound({ ...input, category }) };
  } catch (error) {
    if (error instanceof RoundDrawError && error.code === 'not_enough_units') {
      return { category_id: category.id, reason: 'not_enough_units' };
    }
    throw error;
  }
}

/**
 * Sorteia a rodada em todas as categorias e devolve as partidas de cada uma.
 * A categoria com menos de 2 duplas fica de fora sem impedir as outras (SR7).
 * As outras recusas do `drawRound` (categoria de outra competição, rodada já
 * sorteada) derrubam o sorteio inteiro: nada é criado pela metade (SR9).
 *
 * @example
 * const draw = drawSeasonRound({ ranking, round, categories, enrollments, seasonMatches, drawnBy: adminId, drawnAt: now });
 */
export function drawSeasonRound(input: SeasonRoundDrawInput): SeasonRoundDraw {
  const outcomes = input.categories.map((category) => drawCategory(input, category));
  const drawn = outcomes.filter((o): o is DrawnCategory => 'matches' in o);
  if (drawn.length === 0) {
    const ids = input.categories.map((c) => c.id).join(', ');
    throw new RoundDrawError('nothing_to_draw', `Nenhuma categoria entra no sorteio da rodada '${input.round.id}': recebi [${ids}], esperado ao menos uma com 2 inscrições ativas`);
  }
  const skipped = outcomes.filter((o): o is SkippedCategory => 'reason' in o);
  return { round_id: input.round.id, drawn, skipped };
}
