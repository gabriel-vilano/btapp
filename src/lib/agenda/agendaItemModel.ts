import type {
  Competition,
  CompetitionCategory,
  CompetitorUnit,
  Match,
  MatchSideKey,
  Player,
  Round,
} from '@/src/types/domain';
import type { AgendaDomain, AgendaEntry, AgendaSituation } from '@/src/lib/domain/agenda';
import { sideUnitsResolver } from '@/src/lib/domain/match-count';
import { formatCategoryLabel } from '@/src/lib/formatters';
import { agendaSituationText, formatSideNames, isSameDay } from './agendaText';

// Do domínio para a tela: o que o AgendaItem mostra de uma entrada da agenda
// (docs/NAVIGATION.md §5.3). A aba Jogos e o bloco "Sua vez" do feed (N20)
// usam o mesmo modelo, para o item ser o mesmo nos dois lugares.

/** As tabelas da agenda mais as que dão nome às coisas: jogadores e categorias. */
export interface AgendaScreenDomain extends AgendaDomain {
  players: Player[];
  categories: CompetitionCategory[];
}

export interface AgendaItemPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface AgendaItemAction {
  label: string;
  href: string;
}

/** Tudo o que o AgendaItem precisa, já em texto. */
export interface AgendaItemModel {
  matchId: string;
  /** O lado de quem vê primeiro: "Lucas e Rafael × Pedro e Thiago". */
  ownSide: AgendaItemPerson[];
  opponentSide: AgendaItemPerson[];
  /** Competição · categoria · rodada, competição · categoria, ou "Amistoso". */
  context: string;
  situation: string;
  /** Selo ao lado dos nomes. Hoje, só "Hoje" nos próximos jogos (5.1). */
  badge: string | null;
  /** Toque no item: abre a partida (N10). */
  href: string;
  /** Só em "Sua vez" (5.3). */
  action: AgendaItemAction | null;
}

/** Rota da partida (N10). A tela da partida é de outra issue: o link pode não existir ainda. */
export function matchHref(matchId: string): string {
  return `/jogos/${matchId}`;
}

/**
 * O botão de cada pendência (5.3). "Lançar resultado" abre direto o fluxo de
 * lançar (N16); os outros abrem a partida, onde o jogador vê antes de decidir.
 * "Confirmar" abre a partida já no resultado (docs/RESULTS.md §4.1).
 */
export function agendaActionOf(situation: AgendaSituation, matchId: string): AgendaItemAction | null {
  switch (situation.kind) {
    case 'schedule_match':
      return { label: 'Propor horários', href: matchHref(matchId) };
    case 'answer_proposal':
      return { label: 'Responder proposta', href: matchHref(matchId) };
    case 'report_result':
      return { label: 'Lançar resultado', href: `${matchHref(matchId)}/resultado` };
    case 'confirm_result':
      return { label: 'Confirmar', href: `${matchHref(matchId)}#resultado` };
    case 'confirm_friendly':
      return { label: 'Confirmar', href: matchHref(matchId) };
    default:
      return null;
  }
}

/** Nome da categoria a partir da do domínio. Ex.: "Masculino B", "Mista C 40+". */
export function categoryName(category: CompetitionCategory): string {
  const ageGroup = category.min_age === null ? null : `${category.min_age}+`;
  return formatCategoryLabel({ ...category, age_group: ageGroup });
}

function findOrThrow<T extends { id: string }>(items: T[], id: string, what: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Item da agenda: ${what} '${id}' não existe nas tabelas do domínio`);
  return found;
}

function contextOf(domain: AgendaScreenDomain, match: Match): string {
  if (match.kind === 'friendly') return 'Amistoso';
  const competition: Competition = findOrThrow(domain.competitions, match.competition_id, 'competição');
  const category = categoryName(findOrThrow(domain.categories, match.category_id, 'categoria'));
  if (match.kind === 'tournament') {
    return [competition.name, category, match.stage].filter(Boolean).join(' · ');
  }
  const round: Round = findOrThrow(domain.rounds, match.round_id, 'rodada');
  return `${competition.name} · ${category} · Rodada ${round.number}`;
}

function peopleOf(domain: AgendaScreenDomain, unit: CompetitorUnit): AgendaItemPerson[] {
  return unit.player_ids.map((id) => {
    const player: Player = findOrThrow(domain.players, id, 'jogador');
    return { id: player.id, name: player.name, avatarUrl: player.avatar_url };
  });
}

function firstNames(people: AgendaItemPerson[]): string {
  return formatSideNames(people.map((person) => person.name.split(' ')[0]));
}

function badgeOf(situation: AgendaSituation, now: string): string | null {
  const startsAt = 'startsAt' in situation ? situation.startsAt : null;
  return startsAt !== null && isSameDay(startsAt, now) ? 'Hoje' : null;
}

const OTHER_SIDE: Record<MatchSideKey, MatchSideKey> = { a: 'b', b: 'a' };

/**
 * Modelo do item a partir da entrada da agenda.
 * @example agendaItemModel(mockDomain, agenda.your_turn[0], new Date().toISOString())
 */
export function agendaItemModel(domain: AgendaScreenDomain, entry: AgendaEntry, now: string): AgendaItemModel {
  const match = findOrThrow(domain.matches, entry.match_id, 'partida');
  const sides = sideUnitsResolver(domain)(match);
  const ownSide = peopleOf(domain, sides[entry.viewer_side]);
  const opponentSide = peopleOf(domain, sides[OTHER_SIDE[entry.viewer_side]]);
  const textContext = { now, viewerSide: entry.viewer_side, opponentNames: firstNames(opponentSide) };
  return {
    matchId: match.id,
    ownSide,
    opponentSide,
    context: contextOf(domain, match),
    situation: agendaSituationText(entry.situation, textContext),
    badge: badgeOf(entry.situation, now),
    href: matchHref(match.id),
    action: entry.section === 'your_turn' ? agendaActionOf(entry.situation, match.id) : null,
  };
}
