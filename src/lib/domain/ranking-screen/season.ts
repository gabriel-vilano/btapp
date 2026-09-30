import type { Round, Season } from '@/src/types/domain';
import type { SeasonHeader, SeasonPhase } from './types';

// Qual temporada a classificação mostra e em que momento ela está
// (docs/RANKING.md, RK4, RK15 e RK21).

const at = (iso: string) => Date.parse(iso);

/**
 * Temporada da tela: a pedida por `?temporada=` (RK21) ou, sem pedido, a mais
 * recente que já começou. A encerrada fica até a próxima começar (RK15).
 * `undefined`: a temporada pedida não é deste ranking. `null`: nenhuma
 * começou (RK19).
 */
export function selectSeason(
  seasons: Season[],
  rankingId: string,
  requestedId: string | null,
  now: string,
): Season | null | undefined {
  const own = seasons.filter((season) => season.ranking_id === rankingId);
  if (requestedId !== null) return own.find((season) => season.id === requestedId);
  return startedSeasons(own, now).at(-1) ?? null;
}

function startedSeasons(seasons: Season[], now: string): Season[] {
  return seasons.filter((season) => at(season.starts_on) <= at(now)).sort((x, y) => at(x.starts_on) - at(y.starts_on));
}

export function seasonPhase(season: Season, now: string): SeasonPhase {
  if (at(now) > at(season.ends_on)) return 'ended';
  if (season.final !== null && at(now) > at(season.final.cutoff_date)) return 'after_cutoff';
  return 'open';
}

function currentRound(rounds: Round[], season: Season, now: string): SeasonHeader['current_round'] {
  const own = rounds.filter((round) => round.season_id === season.id);
  const round = own.find((r) => at(r.starts_at) <= at(now) && at(now) < at(r.deadline));
  if (round === undefined) return null;
  return { number: round.number, total: own.length, deadline: round.deadline };
}

/** A encerrada logo antes de `season`, enquanto `season` não terminou (RK15). */
function previousSeason(seasons: Season[], season: Season, now: string): string | null {
  if (seasonPhase(season, now) === 'ended') return null;
  const before = seasons.filter(
    (other) => other.ranking_id === season.ranking_id && at(other.ends_on) < at(season.starts_on),
  );
  return before.sort((x, y) => at(x.ends_on) - at(y.ends_on)).at(-1)?.id ?? null;
}

/**
 * Cabeçalho da classificação. `activeCount` são as inscrições ativas da
 * categoria, para o "todas se classificam" (4.5).
 * Ex.: `seasonHeader({ seasons, rounds }, season, activeCount, now)`.
 */
export function seasonHeader(
  tables: { seasons: Season[]; rounds: Round[] },
  season: Season,
  activeCount: number,
  now: string,
): SeasonHeader {
  const { final } = season;
  return {
    season_name: season.name,
    phase: seasonPhase(season, now),
    ends_on: season.ends_on,
    current_round: currentRound(tables.rounds, season, now),
    final: final && { name: final.name, qualifiers: final.qualifiers, cutoff_date: final.cutoff_date },
    all_qualify: final !== null && activeCount <= final.qualifiers,
    previous_season_id: previousSeason(tables.seasons, season, now),
  };
}
