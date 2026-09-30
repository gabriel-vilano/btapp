import type { Match, MatchSideKey, RankingCompetition } from '@/src/types/domain';
import { hasPlayer, sideUnitsResolver, type SideUnits } from '../match-count/playedMatch';
import { findById, scheduleHistoryFor, type AgendaDomain, type AgendaViewer } from './agendaDomain';
import {
  friendlyAgendaEntry,
  rankingAgendaEntry,
  tournamentAgendaEntry,
  type AgendaEntry,
  type AgendaSectionKey,
  type AgendaSituation,
} from './agendaEntry';

// A agenda inteira de um jogador: cada partida dele numa seção só (N13), e
// cada seção na sua ordem (tabela 5.1).

export type PlayerAgenda = Record<AgendaSectionKey, AgendaEntry[]>;

/**
 * Agenda do jogador: as partidas dele distribuídas pelas 4 seções, já ordenadas.
 * @example playerAgenda(mockDomain, { playerId: players.lucas.id, now: new Date().toISOString() }).your_turn
 */
export function playerAgenda(domain: AgendaDomain, viewer: AgendaViewer): PlayerAgenda {
  const sidesOf = sideUnitsResolver(domain);
  const entries = domain.matches.flatMap((match) => {
    const sides = sidesOf(match);
    const viewerSide = viewerSideOf(sides, viewer.playerId);
    if (viewerSide === null) return [];
    const agendaEntry = entryOf(domain, match, sides, viewerSide, viewer);
    return agendaEntry === null ? [] : [agendaEntry];
  });
  return {
    your_turn: sortByDeadline(entries.filter((e) => e.section === 'your_turn')),
    upcoming: sortByStart(entries.filter((e) => e.section === 'upcoming')),
    waiting: sortByDeadline(entries.filter((e) => e.section === 'waiting')),
    history: sortByPlayedDesc(entries.filter((e) => e.section === 'history')),
  };
}

/** Quantas pendências "Sua vez" o jogador tem: o número do badge da aba Jogos (N3). */
export function yourTurnCount(agenda: PlayerAgenda): number {
  return agenda.your_turn.length;
}

/** A agenda não tem nada aberto: "Sua vez", "Próximos jogos" e "Aguardando" estão vazias. */
export function hasOpenEntries(agenda: PlayerAgenda): boolean {
  return agenda.your_turn.length + agenda.upcoming.length + agenda.waiting.length > 0;
}

function viewerSideOf(sides: SideUnits, playerId: string): MatchSideKey | null {
  if (hasPlayer(sides.a, playerId)) return 'a';
  if (hasPlayer(sides.b, playerId)) return 'b';
  return null;
}

function entryOf(
  domain: AgendaDomain,
  match: Match,
  sides: SideUnits,
  viewerSide: MatchSideKey,
  viewer: AgendaViewer,
): AgendaEntry | null {
  if (match.kind === 'tournament') return tournamentAgendaEntry(match, viewerSide, viewer.now);
  if (match.kind === 'friendly') {
    const reporterSide = viewerSideOf(sides, match.report.reported_by) ?? 'a';
    return friendlyAgendaEntry(match, { viewerId: viewer.playerId, viewerSide, reporterSide });
  }
  const competition = rankingOf(domain, match.competition_id);
  return rankingAgendaEntry(match, {
    viewerSide,
    sides: { a: sides.a.player_ids, b: sides.b.player_ids },
    roundDeadline: findById(domain.rounds, match.round_id, 'rodada').deadline,
    responseDeadlineHours: competition.response_deadline_hours,
    history: scheduleHistoryFor(domain, match.id),
    now: viewer.now,
  });
}

function rankingOf(domain: AgendaDomain, competitionId: string): RankingCompetition {
  const competition = findById(domain.competitions, competitionId, 'competição');
  if (competition.type === 'ranking') return competition;
  throw new Error(`Agenda: competição '${competitionId}' é '${competition.type}', esperado 'ranking' numa partida de ranking`);
}

/** Prazo da situação, quando ela tem. */
export function deadlineOf(situation: AgendaSituation): string | null {
  return 'deadline' in situation ? situation.deadline : null;
}

// Sem prazo vai por último (amistoso, "Com o admin"). O id desempata, para a
// ordem não depender da ordem das tabelas.
function sortByDeadline(entries: AgendaEntry[]): AgendaEntry[] {
  return [...entries].sort(
    (x, y) => compareNullableTime(deadlineOf(x.situation), deadlineOf(y.situation)) || byId(x, y),
  );
}

function startOf(situation: AgendaSituation): string | null {
  return 'startsAt' in situation ? situation.startsAt : null;
}

/** Cronológica; o torneio sem horário vai para o fim, como "Horário a definir" (5.1). */
function sortByStart(entries: AgendaEntry[]): AgendaEntry[] {
  return [...entries].sort((x, y) => compareNullableTime(startOf(x.situation), startOf(y.situation)) || byId(x, y));
}

/** Mais recente primeiro (5.1). */
function sortByPlayedDesc(entries: AgendaEntry[]): AgendaEntry[] {
  return [...entries].sort((x, y) => compareNullableTime(x.played_at, y.played_at, -1) || byId(x, y));
}

/** Compara dois momentos na direção pedida; o nulo vai sempre para o fim. */
function compareNullableTime(x: string | null, y: string | null, direction: 1 | -1 = 1): number {
  if (x === null && y === null) return 0;
  if (x === null) return 1;
  if (y === null) return -1;
  return direction * (Date.parse(x) - Date.parse(y));
}

function byId(x: AgendaEntry, y: AgendaEntry): number {
  return x.match_id.localeCompare(y.match_id);
}
