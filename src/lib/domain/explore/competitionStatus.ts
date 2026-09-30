import type { Competition, Organization, RankingCompetition, Round, Season } from '@/src/types/domain';
import { isoToBrasiliaLocal } from '@/src/lib/brasiliaDateTime';

// Competição aberta ou encerrada (docs/EXPLORE.md §1, "Termos"): ranking com
// temporada em andamento, ou torneio cuja data de fim é hoje ou depois. O
// resto é encerrada. "Hoje" é o dia de Brasília: o torneio que termina às 10h
// continua aberto até o fim do dia, e o dia é o da quadra, não o do aparelho.

/** Tabelas que a vitrine e a página da organização leem. O `mockExploreDomain` satisfaz. */
export interface ExploreDomain {
  organizations: Organization[];
  competitions: Competition[];
  seasons: Season[];
  rounds: Round[];
}

type SeasonTables = Pick<ExploreDomain, 'seasons'>;

// 'YYYY-MM-DD' em Brasília; strings nesse formato se comparam como datas
function brasiliaDay(iso: string): string {
  return isoToBrasiliaLocal(iso).slice(0, 10);
}

/** A temporada em andamento do ranking, ou null entre temporadas. */
export function currentSeason(ranking: RankingCompetition, domain: SeasonTables, now: string): Season | null {
  const today = brasiliaDay(now);
  const running = domain.seasons.find(
    (season) =>
      season.ranking_id === ranking.id && brasiliaDay(season.starts_on) <= today && today <= brasiliaDay(season.ends_on),
  );
  return running ?? null;
}

/** Aberta: ranking com temporada em andamento, ou torneio que termina hoje ou depois. */
export function isCompetitionOpen(competition: Competition, domain: SeasonTables, now: string): boolean {
  if (competition.type === 'ranking') return currentSeason(competition, domain, now) !== null;
  return brasiliaDay(competition.ends_on) >= brasiliaDay(now);
}
