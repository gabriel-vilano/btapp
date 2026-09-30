import type { CompetitionMatch } from '@/src/types/domain';
import type { StandingDelta } from '../competitions-tab';
import {
  profileRankings,
  profileSeasons,
  profileVersus,
  recentMatches,
  type ProfileRankingRow,
  type ProfileViewer,
  type RecentMatchRow,
} from '../profile';
import { positionDeltas } from '../ranking-table';
import { opponentsLabel, type NameResolver } from './names';
import { headToHeadPath, matchPath, rankingPath } from './routes';
import { toScore } from './score';
import type {
  ProfileMatchItem,
  ProfilePageDomain,
  ProfileRankingItem,
  ProfileSeasonItem,
  ProfileVersusView,
} from './types';

// Cada seção da página: a derivação de `profile/` com os nomes e as rotas.

function toDelta(delta: number | undefined): StandingDelta | null {
  if (delta === undefined) return null;
  return { direction: delta > 0 ? 'up' : 'down', value: Math.abs(delta) };
}

// A mesma variação da tabela (PF13, RK12): contra a foto base da categoria
function rowDelta(domain: ProfilePageDomain, row: ProfileRankingRow, now: string): StandingDelta | null {
  const scope = { ...domain, season_id: row.season_id, category_id: row.category_id };
  return toDelta(positionDeltas(scope, domain.standingSnapshots, now).get(row.enrollment_id));
}

/** "Rankings" (PF10–PF15), na ordem da PF12. */
export function rankingItems(domain: ProfilePageDomain, names: NameResolver, view: ProfileViewer): ProfileRankingItem[] {
  return profileRankings(domain, view).map((row) => ({
    enrollment_id: row.enrollment_id,
    position: row.position,
    delta: rowDelta(domain, row, view.now),
    best_position: row.best_position,
    competition_name: names.competition(row.competition_id),
    category_name: names.category(row.category_id),
    partner_name: names.partner(row.partner_id),
    href: rankingPath(row.category_id),
  }));
}

function matchContext(names: NameResolver, row: RecentMatchRow): string {
  if (row.competition_id === null || row.category_id === null) return 'Amistoso';
  return `${names.competition(row.competition_id)} · ${names.category(row.category_id)}`;
}

/** "Partidas recentes" (PF18), do lado do dono do perfil. */
export function matchItems(domain: ProfilePageDomain, names: NameResolver, playerId: string): ProfileMatchItem[] {
  return recentMatches(domain, playerId).map((row) => ({
    match_id: row.match_id,
    outcome: row.result.winner === row.side ? 'win' : 'loss',
    result_type: row.result.type,
    score: toScore(row.result),
    opponents: opponentsLabel(names, row.opponent_ids),
    context: matchContext(names, row),
    played_at: row.played_at,
    href: matchPath(row.match_id),
  }));
}

/** "Temporadas" (PF19), a mais recente primeiro. */
export function seasonItems(domain: ProfilePageDomain, names: NameResolver, playerId: string, now: string): ProfileSeasonItem[] {
  return profileSeasons(domain, playerId, now).map((row) => ({
    enrollment_id: row.enrollment_id,
    season_name: names.season(row.season_id),
    competition_name: names.competition(row.competition_id),
    category_name: names.category(row.category_id),
    partner_name: names.partner(row.partner_id),
    final_position: row.final_position,
    milestones: row.milestones,
    final_name: row.final_name,
    href: rankingPath(row.category_id, row.season_id),
  }));
}

// "Rodada 3" no ranking; no torneio, a fase da chave ou o nome do torneio
function stageOf(match: CompetitionMatch, names: NameResolver): string {
  if (match.kind === 'ranking') return `Rodada ${names.round(match.round_id).number}`;
  return match.stage ?? names.competition(match.competition_id);
}

function nextMatchView(domain: ProfilePageDomain, names: NameResolver, matchId: string): ProfileVersusView['next_match'] {
  const match = domain.matches.find((m): m is CompetitionMatch => m.id === matchId && m.kind !== 'friendly');
  if (match === undefined) throw new Error(`Perfil: confronto '${matchId}' não existe nas partidas de competição`);
  return { href: matchPath(match.id), stage: stageOf(match, names), scheduled_at: match.scheduled_at };
}

/** Bloco "Vocês" (PF16, PF17), ou null quando some: no próprio perfil e sem confronto nem H2H. */
export function versusView(domain: ProfilePageDomain, names: NameResolver, view: ProfileViewer): ProfileVersusView | null {
  const versus = profileVersus(domain, view.playerId, view.viewerId);
  if (versus === null) return null;
  const { next_match_id: nextId, head_to_head: h2h } = versus;
  const username = names.player(view.playerId).username;
  return {
    next_match: nextId === null ? null : nextMatchView(domain, names, nextId),
    head_to_head: h2h && { href: headToHeadPath(username), matches: h2h.match_ids.length, viewer_wins: h2h.wins },
  };
}
