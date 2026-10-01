import { describe, expect, it } from 'vitest';
import type { PendingScheduleProposal, RankingMatch, ReportedScheduleDate } from '@/src/types/domain';
import { checkUndoCategoryDraw, undoBlockerText, type UndoDrawInput } from './undoCategoryDraw';
import { undoCategoryDraw, UndoDrawError } from './undoCategoryDrawRecord';
import { ADMIN_ID, NOW, definedMatch, round } from './roundDrawScenario.test-utils';

// Desfazer o sorteio de uma categoria (SR12, R51). Masculino B sorteado na
// rodada 3 às 10h; o Feminino C, na mesma rodada, não importa aqui.

const third = round(3, NOW.toISOString(), '2026-10-27T02:59:00.000Z');
const DRAWN_AT = NOW.toISOString();
const PEDRO = 'player-pedro';
const JOAO = 'player-joao';

function match(id: string, sides: readonly [string, string], categoryId = 'masc-b'): RankingMatch {
  return definedMatch({ id, categoryId, roundId: third.id, sides, createdAt: DRAWN_AT });
}

const mascB = [match('m1', ['t1', 't2']), match('m2', ['t3', 't4']), match('m3', ['t1', 't3'])];
const femC = [match('f1', ['f1', 'f2'], 'fem-c')];

function input(overrides: Partial<UndoDrawInput> = {}): UndoDrawInput {
  return { round: third, category_id: 'masc-b', seasonMatches: [...mascB, ...femC], proposals: [], reportedDates: [], ...overrides };
}

function proposal(matchId: string, by: string, at: string): PendingScheduleProposal {
  const options = [{ starts_at: '2026-10-15T22:00:00.000Z', venue: null }, { starts_at: '2026-10-16T22:00:00.000Z', venue: null }] as const;
  return { id: `p-${matchId}`, match_id: matchId, side: 'a', proposed_by: by, created_at: at, options: [...options], status: 'pending' };
}

function reportedDate(matchId: string, by: string, at: string): ReportedScheduleDate {
  return { id: `d-${matchId}`, match_id: matchId, reported_by: by, reported_at: at, starts_at: '2026-10-15T22:00:00.000Z', venue: null };
}

function awaiting(base: RankingMatch, by: string, at: string): RankingMatch {
  return { ...base, status: 'awaiting_confirmation', report: { result: { type: 'wo', winner: 'a' }, reported_by: by, reported_at: at } };
}

const names = new Map([[PEDRO, 'Pedro'], [JOAO, 'João']]);
const nameOf = (id: string) => names.get(id) ?? 'Um jogador';

describe('checkUndoCategoryDraw: sem ação de jogador', () => {
  it('pode desfazer, com as partidas da categoria (só as dela)', () => {
    const check = checkUndoCategoryDraw(input());
    expect(check.allowed).toBe(true);
    if (check.allowed) expect(check.matches.map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
  });

  it('a ação de jogador em outra categoria não bloqueia', () => {
    expect(checkUndoCategoryDraw(input({ proposals: [proposal('f1', PEDRO, DRAWN_AT)] })).allowed).toBe(true);
  });
});

describe('checkUndoCategoryDraw: com ação de jogador', () => {
  it('proposta de horário bloqueia: "Pedro já propôs horários"', () => {
    const check = checkUndoCategoryDraw(input({ proposals: [proposal('m2', PEDRO, '2026-10-12T14:00:00.000Z')] }));
    expect(check).toEqual({
      allowed: false,
      blocker: { kind: 'player_acted', action: { kind: 'proposed_times', player_id: PEDRO, at: '2026-10-12T14:00:00.000Z' } },
    });
    if (!check.allowed) expect(undoBlockerText(check.blocker, nameOf)).toBe('Pedro já propôs horários');
  });

  it('data informada bloqueia', () => {
    const check = checkUndoCategoryDraw(input({ reportedDates: [reportedDate('m1', JOAO, '2026-10-12T15:00:00.000Z')] }));
    expect(!check.allowed && undoBlockerText(check.blocker, nameOf)).toBe('João já informou a data do jogo');
  });

  it('resultado lançado bloqueia', () => {
    const seasonMatches = [awaiting(mascB[0], JOAO, '2026-10-12T16:00:00.000Z'), mascB[1], mascB[2]];
    const check = checkUndoCategoryDraw(input({ seasonMatches }));
    expect(!check.allowed && undoBlockerText(check.blocker, nameOf)).toBe('João já lançou um resultado');
  });

  it('lançamento desfeito também bloqueia: o jogador agiu (R48)', () => {
    const undone = { result: { type: 'wo' as const, winner: 'b' as const }, reported_by: PEDRO, reported_at: '2026-10-12T16:00:00.000Z', undone_at: '2026-10-12T16:05:00.000Z' };
    const seasonMatches = [{ ...mascB[0], undone_reports: [undone] }, mascB[1], mascB[2]];
    expect(checkUndoCategoryDraw(input({ seasonMatches }))).toMatchObject({ allowed: false, blocker: { action: { kind: 'reported_result' } } });
  });

  it('com várias ações, o motivo é a primeira', () => {
    const check = checkUndoCategoryDraw(input({
      proposals: [proposal('m2', PEDRO, '2026-10-12T18:00:00.000Z')],
      reportedDates: [reportedDate('m3', JOAO, '2026-10-12T14:00:00.000Z')],
    }));
    expect(check).toMatchObject({ allowed: false, blocker: { action: { kind: 'reported_date', player_id: JOAO } } });
  });
});

describe('checkUndoCategoryDraw: outros bloqueios', () => {
  it('partida que saiu de "Confronto definido" sem ato de jogador bloqueia', () => {
    const seasonMatches: RankingMatch[] = [{ ...mascB[0], status: 'not_played' }, mascB[1], mascB[2]];
    const check = checkUndoCategoryDraw(input({ seasonMatches }));
    expect(check).toEqual({ allowed: false, blocker: { kind: 'match_left_defined', match_id: 'm1', status: 'not_played' } });
    if (!check.allowed) expect(undoBlockerText(check.blocker, nameOf)).toBe('uma partida já saiu de "Confronto definido"');
  });

  it('categoria sem partidas na rodada não tem o que desfazer', () => {
    const check = checkUndoCategoryDraw(input({ category_id: 'masc-a' }));
    expect(check).toEqual({ allowed: false, blocker: { kind: 'not_drawn' } });
  });
});

describe('undoCategoryDraw: o registro (R51)', () => {
  const undoneAt = '2026-10-12T13:40:00.000Z';

  it('devolve as partidas a apagar, quem avisar e o registro do sorteio desfeito', () => {
    expect(undoCategoryDraw({ ...input(), undoneBy: ADMIN_ID, undoneAt })).toEqual({
      record: { round_id: third.id, category_id: 'masc-b', drawn_at: DRAWN_AT, undone_by: ADMIN_ID, undone_at: undoneAt },
      deleted_match_ids: ['m1', 'm2', 'm3'],
      notified_enrollment_ids: ['t1', 't2', 't3', 't4'],
    });
  });

  it('recusa depois da ação de jogador, com a categoria, a rodada e o motivo na mensagem', () => {
    const call = () => undoCategoryDraw({ ...input({ proposals: [proposal('m1', PEDRO, DRAWN_AT)] }), undoneBy: ADMIN_ID, undoneAt });
    expect(call).toThrow(UndoDrawError);
    expect(call).toThrow(`categoria 'masc-b' na rodada '${third.id}'`);
    expect(call).toThrow(expect.objectContaining({ blocker: expect.objectContaining({ kind: 'player_acted' }) }));
  });
});
