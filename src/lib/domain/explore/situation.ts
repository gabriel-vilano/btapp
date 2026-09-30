import type { Competition, RankingCompetition } from '@/src/types/domain';
import { formatRoundName } from '@/src/lib/domain/competition-page';
import { formatTournamentDates } from '@/src/lib/tournamentDates';
import { currentSeason, isCompetitionOpen, type ExploreDomain } from './competitionStatus';

// Linha de situação do item de competição (docs/EXPLORE.md, EX10). Reusa os
// formatos que o app já tem: a rodada da página da competição (RK4) e a data
// do TournamentSummaryItem (N29).

type SituationTables = Pick<ExploreDomain, 'seasons' | 'rounds'>;

export const BETWEEN_SEASONS_TEXT = 'Entre temporadas';
export const PAST_TOURNAMENT_TEXT = 'Encerrado';

// A rodada em curso é a última que já começou. O domínio não guarda o número
// de rodadas da temporada: o total é o das rodadas já cadastradas nela, que
// nascem com a temporada, cada uma com o prazo (R7).
function rankingSituation(ranking: RankingCompetition, domain: SituationTables, now: string): string {
  const season = currentSeason(ranking, domain, now);
  if (season === null) return BETWEEN_SEASONS_TEXT;
  const rounds = domain.rounds.filter((round) => round.season_id === season.id);
  const started = rounds.filter((round) => Date.parse(round.starts_at) <= Date.parse(now)).sort((a, b) => b.number - a.number);
  return formatRoundName(started.length === 0 ? null : { number: started[0].number, total: rounds.length });
}

/**
 * Situação da competição na vitrine e na página da organização.
 * @example competitionSituation(ranking, domain, now) // "Rodada 3 de 4" ou "Entre temporadas"
 * @example competitionSituation(tournament, domain, now) // "10 e 11 de outubro · Arena Tucum · Carandaí/MG" ou "Encerrado"
 */
export function competitionSituation(competition: Competition, domain: SituationTables, now: string): string {
  if (competition.type === 'ranking') return rankingSituation(competition, domain, now);
  if (!isCompetitionOpen(competition, domain, now)) return PAST_TOURNAMENT_TEXT;
  return `${formatTournamentDates(competition.starts_on, competition.ends_on)} · ${competition.venue}`;
}
