import type { CompetitionCategory, Enrollment, RankingCompetition } from '@/src/types/domain';
import { activeEnrollmentIds } from './activeUnits';

// Resumo da confirmação do sorteio (ROUND_DRAW.md SR5, SR7 e seção 4): o que
// vai acontecer em cada categoria, sem mostrar confrontos. A conta é a mesma
// do `drawPairings`, então o resumo nunca promete o que o sorteio não entrega.

/** Casos que não fecham, mostrados na categoria antes de sortear. */
export type DrawWarning =
  // "Não entra: 1 dupla ativa"
  | { kind: 'not_enough_units'; active_units: number }
  // "Cada dupla joga 2 jogos, não 4: só há 2 adversários" (R30)
  | { kind: 'fewer_opponents'; requested: number; per_unit: number }
  // "Uma dupla fica com 2 jogos nesta rodada (5 × 3 é ímpar)"
  | { kind: 'odd_slots'; units: number; per_unit: number };

export interface CategoryDrawSummary {
  category_id: string;
  enters: boolean;
  active_units: number;
  per_unit: number; // jogos de cada dupla; 0 quando a categoria não entra
  total_matches: number;
  warnings: DrawWarning[];
}

export interface RoundDrawSummary {
  categories: CategoryDrawSummary[];
  total_matches: number;
  // Falta o prazo válido para o "Sortear" habilitar (SR8): ver `checkRoundDeadline`
  any_category_enters: boolean;
}

export interface RoundDrawSummaryInput {
  ranking: RankingCompetition;
  season_id: string;
  categories: readonly CompetitionCategory[];
  enrollments: readonly Enrollment[];
}

function notEntering(categoryId: string, activeUnits: number): CategoryDrawSummary {
  const warnings: DrawWarning[] = [{ kind: 'not_enough_units', active_units: activeUnits }];
  return { category_id: categoryId, enters: false, active_units: activeUnits, per_unit: 0, total_matches: 0, warnings };
}

function warningsFor(units: number, requested: number, perUnit: number): DrawWarning[] {
  const warnings: DrawWarning[] = [];
  if (perUnit < requested) warnings.push({ kind: 'fewer_opponents', requested, per_unit: perUnit });
  if ((units * perUnit) % 2 === 1) warnings.push({ kind: 'odd_slots', units, per_unit: perUnit });
  return warnings;
}

function summarizeCategory(input: RoundDrawSummaryInput, category: CompetitionCategory): CategoryDrawSummary {
  const units = activeEnrollmentIds(input.enrollments, category.id, input.season_id).length;
  if (units < 2) return notEntering(category.id, units);
  const requested = input.ranking.matches_per_round;
  const perUnit = Math.min(requested, units - 1);
  return {
    category_id: category.id,
    enters: true,
    active_units: units,
    per_unit: perUnit,
    total_matches: Math.floor((units * perUnit) / 2),
    warnings: warningsFor(units, requested, perUnit),
  };
}

/**
 * Resumo por categoria para a tela de confirmação: duplas ativas, jogos por
 * dupla, partidas e avisos. Nenhum aviso bloqueia as outras categorias (SR7).
 *
 * @example
 * const summary = summarizeRoundDraw({ ranking, season_id: season.id, categories, enrollments });
 */
export function summarizeRoundDraw(input: RoundDrawSummaryInput): RoundDrawSummary {
  const categories = input.categories.map((category) => summarizeCategory(input, category));
  return {
    categories,
    total_matches: categories.reduce((total, c) => total + c.total_matches, 0),
    any_category_enters: categories.some((c) => c.enters),
  };
}
