import type { Player } from '@/src/types/domain';
import type { StandingDelta } from '../competitions-tab';
import {
  h2hPath,
  sidePlayerIds,
  type H2HConfrontation,
  type H2HCrossPair,
  type H2HMatchContext,
  type H2HSharedRanking,
  type H2HSide,
  type H2HStanding,
} from '../h2h';
import { categoryName, firstName, matchPath, playerPath } from '../profile-page';
import type {
  H2HCrossPairView,
  H2HMatchView,
  H2HPageDomain,
  H2HPageLinks,
  H2HPlayerView,
  H2HSideView,
  H2HStandingView,
} from './types';

// Cada seção da página de H2H: a derivação de `h2h/` com nomes e rotas. Um
// id sem linha na tabela é erro de integridade, e o erro diz qual.

function findById<T extends { id: string }>(items: T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`H2H: ${what} '${id}' não existe nas tabelas do domínio`);
  return found;
}

export interface H2HNames {
  player: (id: string) => Player;
  competition: (id: string) => string;
  category: (id: string) => string;
}

/** Leitores de nome sobre as tabelas. Ex.: `h2hNames(mockH2HDomain).player('player-lucas').name` → "Lucas Silva". */
export function h2hNames(domain: H2HPageDomain): H2HNames {
  return {
    player: (id) => findById(domain.players, id, 'jogador'),
    competition: (id) => findById(domain.competitions, id, 'competição').name,
    category: (id) => categoryName(findById(domain.categories, id, 'categoria')),
  };
}

/** Dupla pelos primeiros nomes, jogador pelo primeiro nome. Ex.: "Pedro e Thiago", "Pedro". */
function firstNames(names: H2HNames, playerIds: string[]): string {
  return playerIds.map((id) => firstName(names.player(id).name)).join(' e ');
}

function playerView(player: Player, isPair: boolean): H2HPlayerView {
  return {
    id: player.id,
    name: player.name,
    shown_name: isPair ? firstName(player.name) : player.name,
    avatar_url: player.avatar_url,
    href: playerPath(player.username),
  };
}

/**
 * Um lado com os nomes de cada bloco. `isViewer`: o texto fala com quem vê (HH6).
 * Ex.: o lado do Lucas, visto por ele → `label: "Você"`, `name: "Lucas"`.
 */
export function sideView(names: H2HNames, side: H2HSide, isViewer: boolean): H2HSideView {
  const ids = sidePlayerIds(side);
  const isPair = side.kind === 'unit';
  const name = firstNames(names, ids);
  const viewerLabel = isPair ? 'Vocês' : 'Você';
  return {
    players: ids.map((id) => playerView(names.player(id), isPair)),
    label: isViewer ? viewerLabel : name,
    name,
  };
}

function contextText(names: H2HNames, context: H2HMatchContext): string {
  if (context.kind === 'friendly') return 'Amistoso';
  const base = `${names.competition(context.competition_id)} · ${names.category(context.category_id)}`;
  if (context.kind === 'ranking') return `${base} · Rodada ${context.round_number}`;
  return context.stage === null ? base : `${base} · ${context.stage}`;
}

// "com Rafael, contra Pedro e Thiago": o parceiro é quem jogou com o jogador da esquerda
function lineupText(names: H2HNames, item: H2HConfrontation, leftPlayerId: string): H2HMatchView['lineup'] {
  if (item.lineup === null) return null;
  const partners = item.lineup.left_player_ids.filter((id) => id !== leftPlayerId);
  return { partner_name: firstNames(names, partners), opponent_names: firstNames(names, item.lineup.right_player_ids) };
}

/** "Confrontos" (HH14), o mais recente primeiro, como o domínio entrega. */
export function matchViews(names: H2HNames, items: H2HConfrontation[], left: H2HSide): H2HMatchView[] {
  const leftPlayerId = sidePlayerIds(left)[0];
  return items.map((item) => ({
    match_id: item.match_id,
    outcome: item.outcome,
    score: item.score,
    played_at: item.played_at,
    context: contextText(names, item.context),
    lineup: lineupText(names, item, leftPlayerId),
    href: matchPath(item.match_id),
  }));
}

function toDelta(delta: number | null): StandingDelta | null {
  if (delta === null) return null;
  if (delta === 0) return { direction: 'none' };
  return { direction: delta > 0 ? 'up' : 'down', value: Math.abs(delta) };
}

function standingView(names: H2HNames, ranking: H2HSharedRanking, standing: H2HStanding, side: H2HSideView, links: H2HPageLinks): H2HStandingView {
  return {
    enrollment_id: standing.enrollment_id,
    position: standing.position,
    delta: toDelta(standing.position_delta),
    competition_name: names.competition(ranking.competition_id),
    category_name: names.category(ranking.category_id),
    side_name: side.name,
    href: links.rankingHref(ranking.category_id),
  };
}

interface StandingSides {
  left: H2HSideView;
  right: H2HSideView;
}

/** "No ranking" (HH13): em cada categoria em comum, a linha da esquerda e a da direita. */
export function standingViews(names: H2HNames, rankings: H2HSharedRanking[], sides: StandingSides, links: H2HPageLinks): H2HStandingView[] {
  return rankings.flatMap((ranking) => [
    standingView(names, ranking, ranking.left, sides.left, links),
    standingView(names, ranking, ranking.right, sides.right, links),
  ]);
}

/** "Jogador contra jogador" (HH2): cada linha abre a página de jogadores daquele par. */
export function crossPairViews(names: H2HNames, pairs: H2HCrossPair[]): H2HCrossPairView[] {
  return pairs.map((pair) => {
    const [left, right] = [names.player(pair.left_player_id), names.player(pair.right_player_id)];
    return {
      title: `${firstName(left.name)} × ${firstName(right.name)}`,
      left_wins: pair.left_wins,
      right_wins: pair.right_wins,
      href: h2hPath([left.username], [right.username]),
    };
  });
}
