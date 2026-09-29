import type { FinalQualificationEvent, Season } from '@/src/types/domain';
import { cutoffLine } from '../roundClose';
import { computeStandings, type StandingRow } from '../standings';
import type { ActorLookup, FeedDomain } from './feedDomain';

// "Classificado para a [nome da final]" (R28). Sai uma vez, na data de corte,
// pela posição naquele momento. Antes do corte não existe: a situação "dentro
// ou fora" mora só na tela de ranking (R23).

type QualificationDomain = Pick<FeedDomain, 'enrollments' | 'matches' | 'rounds'>;

function sameTie(x: StandingRow, y: StandingRow): boolean {
  return x.awaiting_admin && y.awaiting_admin && x.points === y.points &&
    x.wins === y.wins && x.games_balance === y.games_balance;
}

/**
 * Classificados sem dúvida. Com um empate total atravessando a linha de corte,
 * toda inscrição desse empate espera a decisão do admin (R37): anunciar e
 * depois retirar desmentiria o feed (R25).
 */
export function certainQualifiers(rows: StandingRow[], qualifiers: number): string[] {
  const cutoff = cutoffLine(rows, qualifiers);
  if (!cutoff.awaiting_admin) return cutoff.qualified_ids;
  const lastIn = rows.find((row) => row.enrollment_id === cutoff.qualified_ids.at(-1));
  return cutoff.qualified_ids.filter((id) => {
    const row = rows.find((candidate) => candidate.enrollment_id === id);
    return row !== undefined && lastIn !== undefined && !sameTie(row, lastIn);
  });
}

function seasonCategories(season: Season, domain: QualificationDomain): string[] {
  const ids = domain.enrollments.filter((e) => e.season_id === season.id).map((e) => e.category_id);
  return [...new Set(ids)];
}

/**
 * Um evento por classificado de cada categoria da temporada, a partir da data
 * de corte. Temporada sem final não tem classificação.
 * Ex.: `qualificationEvents(season, mockDomain, actors, new Date().toISOString())`.
 */
export function qualificationEvents(
  season: Season,
  domain: QualificationDomain,
  actors: ActorLookup,
  now: string,
): FinalQualificationEvent[] {
  const final = season.final;
  if (final === null || Date.parse(now) < Date.parse(final.cutoff_date)) return [];
  return seasonCategories(season, domain).flatMap((categoryId) => {
    const scope = { season_id: season.id, category_id: categoryId, ...domain };
    const rows = computeStandings(scope, final.cutoff_date);
    return certainQualifiers(rows, final.qualifiers).map((enrollmentId) => ({
      id: `event-qualified-${enrollmentId}`, // a inscrição já é da temporada
      type: 'final_qualification',
      visibility: 'public',
      enrollment_id: enrollmentId,
      season_id: season.id,
      actor_ids: actors.ofEnrollment(enrollmentId),
      created_at: final.cutoff_date,
    }));
  });
}
