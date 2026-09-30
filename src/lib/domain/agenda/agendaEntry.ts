import type {
  CompetitionResult,
  FriendlyMatch,
  MatchSideKey,
  RankingMatch,
  ScheduleHistory,
  SidePoints,
  TournamentMatch,
} from '@/src/types/domain';
import { responseDeadline } from '../match-state';
import { agreedScheduleOf, expireProposals, isOptionOpen, pendingProposalOf } from '../schedule-state';

// Onde cada partida aparece na agenda de um jogador (docs/NAVIGATION.md §5.2).
// A função devolve a seção, a situação e o prazo, sem texto: a frase de cada
// situação é da tela (`src/lib/agenda/`). O bloco "Sua vez" do feed (N20) e o
// badge da aba Jogos (N3) leem o mesmo resultado.

/** As 4 seções, na ordem da tela (N12). */
export type AgendaSectionKey = 'your_turn' | 'upcoming' | 'waiting' | 'history';

export const AGENDA_SECTION_ORDER: readonly AgendaSectionKey[] = ['your_turn', 'upcoming', 'waiting', 'history'];

/**
 * Situação da partida do ponto de vista do jogador: uma por linha da tabela
 * 5.2. `deadline` é o prazo que o jogador decide (ISO 8601).
 */
export type AgendaSituation =
  // --- Sua vez ---
  | { kind: 'schedule_match'; deadline: string } // sem data e sem proposta: prazo da rodada (R40)
  | { kind: 'answer_proposal'; openOptionCount: number; deadline: string } // proposta do outro lado
  | { kind: 'report_result'; deadline: string } // a data acordada passou
  | { kind: 'confirm_result'; deadline: string } // lançado pelo outro lado: confirma sozinho no prazo (R14)
  | { kind: 'confirm_friendly' } // amistoso não tem prazo (R43)
  // --- Próximos jogos ---
  | { kind: 'scheduled'; startsAt: string; venue: string | null }
  | { kind: 'tournament_scheduled'; startsAt: string | null; venue: string | null } // null: "Horário a definir"
  // --- Aguardando ---
  | { kind: 'proposal_sent'; deadline: string }
  | { kind: 'awaiting_confirmation'; deadline: string }
  | { kind: 'friendly_awaiting' }
  | { kind: 'with_admin' } // arbitragem, não realizada, ou a rodada fechou sem resultado (R40)
  | { kind: 'tournament_with_admin' } // horário do torneio passou: quem lança é o admin (R38)
  // --- Histórico ---
  | { kind: 'confirmed'; result: CompetitionResult; points: SidePoints | null }
  | { kind: 'friendly_discarded' }
  | { kind: 'friendly_cancelled' };

export type AgendaSituationKind = AgendaSituation['kind'];

/** Uma partida na agenda de um jogador. */
export interface AgendaEntry {
  match_id: string;
  section: AgendaSectionKey;
  situation: AgendaSituation;
  viewer_side: MatchSideKey;
  /** Momento que ordena o histórico: quando o jogo foi (ou o lançamento, sem data). */
  played_at: string | null;
}

/** O que a derivação de uma partida de ranking precisa além dela. */
export interface RankingEntryContext {
  viewerSide: MatchSideKey;
  sides: Record<MatchSideKey, readonly string[]>;
  roundDeadline: string; // ISO 8601
  responseDeadlineHours: number;
  history: ScheduleHistory;
  now: string; // ISO 8601
}

function isPast(iso: string, now: string): boolean {
  return Date.parse(iso) <= Date.parse(now);
}

function sideOf(sides: RankingEntryContext['sides'], playerId: string): MatchSideKey | null {
  if (sides.a.includes(playerId)) return 'a';
  if (sides.b.includes(playerId)) return 'b';
  return null;
}

function entry(
  match: { id: string },
  section: AgendaSectionKey,
  situation: AgendaSituation,
  viewerSide: MatchSideKey,
  playedAt: string | null = null,
): AgendaEntry {
  return { match_id: match.id, section, situation, viewer_side: viewerSide, played_at: playedAt };
}

/**
 * Partida de ranking na agenda. Cancelada devolve null: não aparece (5.2).
 * @example rankingAgendaEntry(match, { viewerSide: 'a', sides, roundDeadline, responseDeadlineHours: 48, history, now })
 */
export function rankingAgendaEntry(match: RankingMatch, ctx: RankingEntryContext): AgendaEntry | null {
  switch (match.status) {
    case 'defined':
      return definedRankingEntry(match, ctx);
    case 'awaiting_confirmation': {
      const deadline = responseDeadline(match.report.reported_at, ctx.responseDeadlineHours);
      const ownReport = sideOf(ctx.sides, match.report.reported_by) === ctx.viewerSide;
      return ownReport
        ? entry(match, 'waiting', { kind: 'awaiting_confirmation', deadline }, ctx.viewerSide)
        : entry(match, 'your_turn', { kind: 'confirm_result', deadline }, ctx.viewerSide);
    }
    case 'in_arbitration':
    case 'not_played':
      return entry(match, 'waiting', { kind: 'with_admin' }, ctx.viewerSide);
    case 'confirmed': {
      const situation = { kind: 'confirmed', result: match.result, points: match.points } as const;
      return entry(match, 'history', situation, ctx.viewerSide, match.scheduled_at ?? match.report?.reported_at);
    }
    case 'cancelled':
      return null;
  }
}

/**
 * Confronto definido: a marcação decide a seção. Quando dois critérios valem,
 * vence o primeiro da ordem Sua vez > Próximos jogos > Aguardando (N13): a
 * remarcação do outro lado pendente puxa um jogo marcado para "Sua vez".
 */
function definedRankingEntry(match: RankingMatch, ctx: RankingEntryContext): AgendaEntry {
  const { viewerSide, roundDeadline, now } = ctx;
  // A rodada fechou e a rotina ainda não moveu a partida: já é do admin (R40).
  if (isPast(roundDeadline, now)) return entry(match, 'waiting', { kind: 'with_admin' }, viewerSide);

  // A proposta cujas opções já passaram todas está expirada, mesmo antes da rotina (M12).
  const history = expireProposals(ctx.history, now);
  const pending = pendingProposalOf(history);
  const agreed = agreedScheduleOf(history);
  const startsAt = agreed?.starts_at ?? match.scheduled_at;

  if (pending !== null && pending.side !== viewerSide) {
    const openOptionCount = pending.options.filter((option) => isOptionOpen(option, now)).length;
    return entry(match, 'your_turn', { kind: 'answer_proposal', openOptionCount, deadline: roundDeadline }, viewerSide);
  }
  if (startsAt !== null && isPast(startsAt, now)) {
    return entry(match, 'your_turn', { kind: 'report_result', deadline: roundDeadline }, viewerSide);
  }
  if (startsAt !== null) {
    const venue = agreed?.venue ?? match.venue;
    return entry(match, 'upcoming', { kind: 'scheduled', startsAt, venue }, viewerSide);
  }
  if (pending !== null) return entry(match, 'waiting', { kind: 'proposal_sent', deadline: roundDeadline }, viewerSide);
  return entry(match, 'your_turn', { kind: 'schedule_match', deadline: roundDeadline }, viewerSide);
}

/** Partida de torneio na agenda. O admin lança o resultado, já confirmado (R38). */
export function tournamentAgendaEntry(match: TournamentMatch, viewerSide: MatchSideKey, now: string): AgendaEntry | null {
  switch (match.status) {
    case 'defined': {
      if (match.scheduled_at !== null && isPast(match.scheduled_at, now)) {
        return entry(match, 'waiting', { kind: 'tournament_with_admin' }, viewerSide);
      }
      const situation = { kind: 'tournament_scheduled', startsAt: match.scheduled_at, venue: match.venue } as const;
      return entry(match, 'upcoming', situation, viewerSide);
    }
    case 'confirmed': {
      const situation = { kind: 'confirmed', result: match.result, points: null } as const;
      return entry(match, 'history', situation, viewerSide, match.scheduled_at ?? match.report?.reported_at);
    }
    case 'cancelled':
      return null;
  }
}

/** O que a derivação do amistoso precisa: os lados de quem vê e de quem lançou. */
export interface FriendlyEntryContext {
  viewerId: string;
  viewerSide: MatchSideKey;
  reporterSide: MatchSideKey;
}

/**
 * Amistoso na agenda. Descartado e cancelado ficam só no histórico de quem
 * lançou (RESULTS.md §6.2); para os outros, devolve null.
 */
export function friendlyAgendaEntry(match: FriendlyMatch, ctx: FriendlyEntryContext): AgendaEntry | null {
  const { viewerSide } = ctx;
  switch (match.status) {
    case 'awaiting_confirmation':
      // Só o lado adversário de quem lançou responde; o parceiro espera junto (R43).
      return ctx.reporterSide === viewerSide
        ? entry(match, 'waiting', { kind: 'friendly_awaiting' }, viewerSide)
        : entry(match, 'your_turn', { kind: 'confirm_friendly' }, viewerSide);
    case 'confirmed': {
      const situation = { kind: 'confirmed', result: match.report.result, points: null } as const;
      return entry(match, 'history', situation, viewerSide, match.played_at);
    }
    case 'discarded':
    case 'cancelled': {
      if (match.report.reported_by !== ctx.viewerId) return null;
      const kind = match.status === 'discarded' ? 'friendly_discarded' : 'friendly_cancelled';
      return entry(match, 'history', { kind }, viewerSide, match.played_at);
    }
  }
}
