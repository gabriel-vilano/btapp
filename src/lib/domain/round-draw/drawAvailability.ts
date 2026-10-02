import type { CompetitionCategory, Enrollment, RankingMatch, Round, Season } from '@/src/types/domain';
import { activeEnrollmentIds } from './activeUnits';

// Quando o sorteio pode acontecer (ROUND_DRAW.md SR3, SR14 e a tabela de
// estados da seção "Sorteio da rodada", §3.1).

export type RoundDrawAvailability =
  | { state: 'season_ended' }
  // "Rodada 3 · fecha em 5 dias": o botão dá lugar a "Ver confrontos"
  | { state: 'round_open'; round: Round }
  // "Sortear a rodada N". `previous_round` é null na temporada sem sorteio
  | { state: 'available'; round_number: number; previous_round: Round | null };

// A rodada começa no sorteio (o prazo corre desde ele), então a rodada
// sorteada é a que já começou. Uma rodada cadastrada para o futuro não conta.
function latestStartedRound(season: Season, rounds: readonly Round[], now: number): Round | null {
  const started = rounds.filter((r) => r.season_id === season.id && Date.parse(r.starts_at) <= now);
  return started.reduce<Round | null>((latest, r) => (latest === null || r.number > latest.number ? r : latest), null);
}

/**
 * Estado do botão "Sortear a rodada N": disponível quando a rodada anterior
 * fechou (o prazo passou) ou quando a temporada ainda não teve sorteio.
 * Pendências da rodada anterior na fila do admin não bloqueiam (R46).
 *
 * @example
 * const availability = roundDrawAvailability(season, rounds, new Date());
 */
export function roundDrawAvailability(season: Season, rounds: readonly Round[], now: Date): RoundDrawAvailability {
  const time = now.getTime();
  if (time >= Date.parse(season.ends_on)) return { state: 'season_ended' };
  const latest = latestStartedRound(season, rounds, time);
  if (latest !== null && time < Date.parse(latest.deadline)) return { state: 'round_open', round: latest };
  return { state: 'available', round_number: (latest?.number ?? 0) + 1, previous_round: latest };
}

/** Categoria sem partidas na rodada em andamento: ficou fora do sorteio ou teve o sorteio desfeito. */
export interface UndrawnCategory {
  category_id: string;
  active_units: number;
  drawable: boolean; // "Sortear o Masculino A": ganhou a segunda dupla
}

export interface UndrawnCategoriesInput {
  round: Round;
  categories: readonly CompetitionCategory[];
  enrollments: readonly Enrollment[];
  seasonMatches: readonly RankingMatch[];
}

/**
 * Categorias que ainda podem ser sorteadas na rodada, com o prazo dela (SR14,
 * e a categoria que volta a "Sortear" depois do desfazer, SR12). Fora do prazo
 * da rodada, a lista é vazia: a categoria espera a próxima.
 *
 * @example
 * const later = undrawnCategories({ round, categories, enrollments, seasonMatches }, new Date());
 */
export function undrawnCategories(input: UndrawnCategoriesInput, now: Date): UndrawnCategory[] {
  if (now.getTime() >= Date.parse(input.round.deadline)) return [];
  const drawnIds = new Set(input.seasonMatches.filter((m) => m.round_id === input.round.id).map((m) => m.category_id));
  return input.categories
    .filter((category) => !drawnIds.has(category.id))
    .map((category) => {
      const units = activeEnrollmentIds(input.enrollments, category.id, input.round.season_id).length;
      return { category_id: category.id, active_units: units, drawable: units >= 2 };
    });
}
