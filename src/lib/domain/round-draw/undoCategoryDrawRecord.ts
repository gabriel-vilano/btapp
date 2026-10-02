import type { UndoneRoundDraw } from '@/src/types/domain';
import { checkUndoCategoryDraw, type UndoDrawBlocker, type UndoDrawInput } from './undoCategoryDraw';

// O que o desfazer produz para a camada que grava (R51): as partidas a apagar
// (sem cancelar: o confronto nunca existiu), quem avisar e o registro à parte.

export class UndoDrawError extends Error {
  readonly blocker: UndoDrawBlocker;

  constructor(blocker: UndoDrawBlocker, message: string) {
    super(message);
    this.name = 'UndoDrawError';
    this.blocker = blocker;
  }
}

export interface UndoCategoryDrawInput extends UndoDrawInput {
  undoneBy: string; // player_id do admin
  undoneAt: string; // ISO 8601
}

export interface CategoryDrawUndo {
  record: UndoneRoundDraw;
  deleted_match_ids: string[];
  // As duplas da categoria que estavam no sorteio: os jogadores delas são avisados
  notified_enrollment_ids: string[];
}

function describe(blocker: UndoDrawBlocker): string {
  if (blocker.kind === 'player_acted') return `${blocker.action.player_id} agiu (${blocker.action.kind}) em ${blocker.action.at}`;
  if (blocker.kind === 'match_left_defined') return `partida '${blocker.match_id}' em '${blocker.status}'`;
  return 'sem partidas na rodada';
}

/**
 * Desfaz o sorteio de uma categoria na rodada. Recusa com `UndoDrawError`
 * quando algum jogador já agiu (ver `checkUndoCategoryDraw`).
 *
 * @example
 * const undo = undoCategoryDraw({ round, category_id, seasonMatches, proposals, reportedDates, undoneBy: adminId, undoneAt: now });
 */
export function undoCategoryDraw(input: UndoCategoryDrawInput): CategoryDrawUndo {
  const check = checkUndoCategoryDraw(input);
  if (!check.allowed) {
    const target = `categoria '${input.category_id}' na rodada '${input.round.id}'`;
    throw new UndoDrawError(check.blocker, `Não dá para desfazer o sorteio da ${target}: ${describe(check.blocker)}; esperado partidas em "Confronto definido" sem ação de jogador`);
  }
  const { matches } = check;
  const record: UndoneRoundDraw = {
    round_id: input.round.id,
    category_id: input.category_id,
    drawn_at: matches[0].created_at,
    undone_by: input.undoneBy,
    undone_at: input.undoneAt,
  };
  const sides = matches.flatMap((m) => [m.side_a_enrollment_id, m.side_b_enrollment_id]);
  return { record, deleted_match_ids: matches.map((m) => m.id), notified_enrollment_ids: [...new Set(sides)] };
}
