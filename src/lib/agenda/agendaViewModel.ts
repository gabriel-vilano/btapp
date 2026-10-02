import {
  agendaEmptyReason,
  playerAgenda,
  type AgendaEmptyReason,
  type AgendaEntry,
  type AgendaViewer,
} from '@/src/lib/domain/agenda';
import { agendaItemModel, categoryName, type AgendaItemModel, type AgendaScreenDomain } from './agendaItemModel';
import { groupByHistoryMonth } from './agendaText';

// A aba Jogos inteira em props (docs/NAVIGATION.md §5 e §9.2): as seções já
// com os itens em texto, e o vazio com os nomes que ele mostra.

export interface AgendaHistoryGroup {
  label: string;
  items: AgendaItemModel[];
}

/** O vazio da aba (9.2), com o que cada mensagem precisa. */
export type AgendaEmptyView =
  | { kind: 'new_player' }
  | { kind: 'between_rounds'; competitionName: string }
  | { kind: 'season_ended'; position: number | null; competitionName: string; categoryName: string; href: string }
  | { kind: 'no_enrollment' };

/**
 * Rotas que o domínio não sabe montar sozinho: a classificação usa o slug da
 * categoria e da temporada, e o domínio só guarda ids. Nos mocks, a tradução
 * é o `mockRankingRoutes`; com a integração, a que ela trouxer.
 */
export interface AgendaLinks {
  /** Classificação da categoria (RK1); com a temporada, a encerrada (RK21). */
  rankingHref: (categoryId: string, seasonId?: string) => string;
}

export interface AgendaViewModel {
  yourTurn: AgendaItemModel[];
  upcoming: AgendaItemModel[];
  waiting: AgendaItemModel[];
  history: AgendaHistoryGroup[];
  /** null quando a agenda tem alguma coisa aberta. */
  empty: AgendaEmptyView | null;
}

/**
 * Props da aba Jogos para o jogador, no momento pedido.
 * @example agendaViewModel(mockDomain, { playerId: players.lucas.id, now: new Date().toISOString() }, MOCK_AGENDA_LINKS)
 */
export function agendaViewModel(
  domain: AgendaScreenDomain,
  viewer: AgendaViewer,
  links: AgendaLinks,
): AgendaViewModel {
  const agenda = playerAgenda(domain, viewer);
  const toItem = (entry: AgendaEntry) => agendaItemModel(domain, entry, viewer.now);
  const reason = agendaEmptyReason(domain, agenda, viewer);
  return {
    yourTurn: agenda.your_turn.map(toItem),
    upcoming: agenda.upcoming.map(toItem),
    waiting: agenda.waiting.map(toItem),
    history: groupByHistoryMonth(agenda.history).map((month) => ({
      label: month.label,
      items: month.entries.map(toItem),
    })),
    empty: reason === null ? null : emptyView(domain, reason, links),
  };
}

function nameOf<T extends { id: string; name: string }>(items: T[], id: string): string {
  return items.find((item) => item.id === id)?.name ?? '';
}

function emptyView(domain: AgendaScreenDomain, reason: AgendaEmptyReason, links: AgendaLinks): AgendaEmptyView {
  switch (reason.kind) {
    case 'between_rounds':
      return { kind: 'between_rounds', competitionName: nameOf(domain.competitions, reason.competition_id) };
    case 'season_ended': {
      const { season } = reason;
      const category = domain.categories.find((candidate) => candidate.id === season.category_id);
      return {
        kind: 'season_ended',
        position: season.final_position,
        competitionName: nameOf(domain.competitions, season.competition_id),
        categoryName: category === undefined ? '' : categoryName(category),
        // A classificação da temporada encerrada (RK21)
        href: links.rankingHref(season.category_id, season.season_id),
      };
    }
    default:
      return { kind: reason.kind };
  }
}
