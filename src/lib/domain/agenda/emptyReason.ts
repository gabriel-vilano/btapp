import { profileSeasons, type ProfileSeasonRow } from '../profile';
import { currentEnrollments } from '../profile/rankings';
import { findById, type AgendaDomain, type AgendaViewer } from './agendaDomain';
import { hasOpenEntries, type PlayerAgenda } from './playerAgenda';

// Por que a agenda não tem nada aberto (docs/NAVIGATION.md §9.2). A aba nunca
// some nem fica desabilitada (N22): ela diz o motivo e oferece o próximo passo.

export type AgendaEmptyReason =
  /** Sem inscrição ativa e sem histórico: o jogador novo. */
  | { kind: 'new_player' }
  /** Inscrito numa temporada aberta, sem confronto aberto: espera o sorteio. */
  | { kind: 'between_rounds'; competition_id: string }
  /** A última temporada terminou e a próxima ainda não começou. */
  | { kind: 'season_ended'; season: ProfileSeasonRow }
  /** Sem inscrição ativa, com histórico (amistosos ou temporadas passadas). */
  | { kind: 'no_enrollment' };

/**
 * Motivo do vazio, ou null quando a agenda tem alguma pendência, jogo ou espera.
 * @example agendaEmptyReason(mockDomain, agenda, { playerId, now })?.kind // 'between_rounds'
 */
export function agendaEmptyReason(
  domain: AgendaDomain,
  agenda: PlayerAgenda,
  viewer: AgendaViewer,
): AgendaEmptyReason | null {
  if (hasOpenEntries(agenda)) return null;
  const [current] = currentEnrollments(domain, viewer.playerId, viewer.now);
  if (current !== undefined) {
    const season = findById(domain.seasons, current.season_id, 'temporada');
    return { kind: 'between_rounds', competition_id: season.ranking_id };
  }
  const [lastSeason] = profileSeasons(domain, viewer.playerId, viewer.now);
  if (lastSeason !== undefined && !hasNewerSeason(domain, lastSeason)) {
    return { kind: 'season_ended', season: lastSeason };
  }
  return agenda.history.length > 0 ? { kind: 'no_enrollment' } : { kind: 'new_player' };
}

/**
 * O ranking já abriu outra temporada depois da que terminou. Aí o jogador não
 * está "entre temporadas": ele ficou fora da nova, e a aba mostra só o histórico.
 */
function hasNewerSeason(domain: AgendaDomain, row: ProfileSeasonRow): boolean {
  const ended = findById(domain.seasons, row.season_id, 'temporada');
  return domain.seasons.some(
    (season) => season.ranking_id === row.competition_id && Date.parse(season.starts_on) > Date.parse(ended.ends_on),
  );
}
