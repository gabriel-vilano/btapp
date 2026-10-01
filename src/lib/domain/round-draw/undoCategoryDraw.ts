import type {
  RankingMatch,
  ReportedScheduleDate,
  Round,
  ScheduleProposal,
} from '@/src/types/domain';

// Desfazer o sorteio de uma categoria (ROUND_DRAW.md SR12, R51). Só enquanto
// nenhum jogador agiu: depois disso, alguém já se organizou em volta do
// confronto, e apagá-lo seria mudar o emparceiramento publicado (FIDE C.04.2).

export type PlayerActionKind = 'proposed_times' | 'reported_date' | 'reported_result';

/** Primeira ação de jogador nas partidas da categoria. */
export interface PlayerAction {
  kind: PlayerActionKind;
  player_id: string;
  at: string; // ISO 8601
}

export type UndoDrawBlocker =
  | { kind: 'not_drawn' } // a categoria não tem partidas na rodada
  | { kind: 'player_acted'; action: PlayerAction }
  // saiu de "Confronto definido" sem ato de jogador: o prazo passou ou o admin decidiu
  | { kind: 'match_left_defined'; match_id: string; status: RankingMatch['status'] };

export interface UndoDrawInput {
  round: Round;
  category_id: string;
  seasonMatches: readonly RankingMatch[];
  proposals: readonly ScheduleProposal[];
  reportedDates: readonly ReportedScheduleDate[];
}

export type UndoDrawCheck =
  | { allowed: true; matches: RankingMatch[] }
  | { allowed: false; blocker: UndoDrawBlocker };

function categoryMatches({ seasonMatches, round, category_id }: UndoDrawInput): RankingMatch[] {
  return seasonMatches.filter((m) => m.round_id === round.id && m.category_id === category_id);
}

// O lançamento desfeito também conta (R48): o jogador agiu, mesmo que tenha voltado atrás.
function resultActions(match: RankingMatch): PlayerAction[] {
  const reports = match.undone_reports.map((r) => ({ reported_by: r.reported_by, reported_at: r.reported_at }));
  if ('report' in match && match.report !== null) reports.push(match.report);
  return reports.map((r) => ({ kind: 'reported_result', player_id: r.reported_by, at: r.reported_at }));
}

function playerActions(input: UndoDrawInput, matches: readonly RankingMatch[]): PlayerAction[] {
  const ids = new Set(matches.map((m) => m.id));
  const proposed = input.proposals.filter((p) => ids.has(p.match_id))
    .map((p): PlayerAction => ({ kind: 'proposed_times', player_id: p.proposed_by, at: p.created_at }));
  const reported = input.reportedDates.filter((d) => ids.has(d.match_id))
    .map((d): PlayerAction => ({ kind: 'reported_date', player_id: d.reported_by, at: d.reported_at }));
  return [...proposed, ...reported, ...matches.flatMap(resultActions)];
}

function firstAction(actions: readonly PlayerAction[]): PlayerAction | undefined {
  return [...actions].sort((x, y) => Date.parse(x.at) - Date.parse(y.at))[0];
}

/**
 * Diz se o admin pode desfazer o sorteio da categoria na rodada e, quando
 * não pode, por quê. O motivo mostrado é a primeira ação de jogador.
 *
 * @example
 * const check = checkUndoCategoryDraw({ round, category_id, seasonMatches, proposals, reportedDates });
 * if (!check.allowed) menuItem.disabledReason = undoBlockerText(check.blocker, nameOf);
 */
export function checkUndoCategoryDraw(input: UndoDrawInput): UndoDrawCheck {
  const matches = categoryMatches(input);
  if (matches.length === 0) return { allowed: false, blocker: { kind: 'not_drawn' } };
  const action = firstAction(playerActions(input, matches));
  if (action !== undefined) return { allowed: false, blocker: { kind: 'player_acted', action } };
  const moved = matches.find((m) => m.status !== 'defined');
  if (moved !== undefined) {
    return { allowed: false, blocker: { kind: 'match_left_defined', match_id: moved.id, status: moved.status } };
  }
  return { allowed: true, matches };
}

const ACTION_TEXT: Record<PlayerActionKind, string> = {
  proposed_times: 'já propôs horários',
  reported_date: 'já informou a data do jogo',
  reported_result: 'já lançou um resultado',
};

/**
 * Motivo do item "Desfazer" desabilitado, para vir depois de "Não dá para desfazer: ".
 *
 * @example
 * undoBlockerText(blocker, (id) => playersById.get(id)?.first_name ?? 'Um jogador') // "Pedro já propôs horários"
 */
export function undoBlockerText(blocker: UndoDrawBlocker, nameOf: (playerId: string) => string): string {
  if (blocker.kind === 'not_drawn') return 'a categoria não foi sorteada nesta rodada';
  if (blocker.kind === 'match_left_defined') return 'uma partida já saiu de "Confronto definido"';
  return `${nameOf(blocker.action.player_id)} ${ACTION_TEXT[blocker.action.kind]}`;
}
