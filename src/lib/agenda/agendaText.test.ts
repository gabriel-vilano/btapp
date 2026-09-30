import { describe, expect, it } from 'vitest';
import type { NormalResult, RetiredResult } from '@/src/types/domain';
import {
  agendaSituationText,
  formatAgendaStart,
  formatResultLine,
  formatTimeRemaining,
  groupByHistoryMonth,
  isSameDay,
} from './agendaText';

const NOW = '2026-09-11T13:00:00.000Z'; // sex, 11/09, 10h em Brasília
const ctx = { now: NOW, viewerSide: 'a' as const, opponentNames: 'Pedro e Thiago' };

const WIN_A: NormalResult = {
  type: 'normal',
  winner: 'a',
  sets: [{ games_a: 6, games_b: 4, super_tiebreak: false, interrupted: false }],
};

describe('formatTimeRemaining', () => {
  it.each([
    ['2026-09-12T20:00:00.000Z', 'em 31h'],
    ['2026-09-16T13:00:00.000Z', 'em 5 dias'],
    ['2026-09-13T12:59:00.000Z', 'em 47h'],
    ['2026-09-13T13:00:00.000Z', 'em 2 dias'],
    ['2026-09-11T13:45:00.000Z', 'em 45min'],
    ['2026-09-11T13:00:30.000Z', 'agora'],
    ['2026-09-10T13:00:00.000Z', 'agora'],
  ])('%s → %s', (deadline, expected) => {
    expect(formatTimeRemaining(deadline, NOW)).toBe(expected);
  });

  it('lança com a data inválida no texto', () => {
    expect(() => formatTimeRemaining('ontem', NOW)).toThrow("recebi 'ontem'");
  });
});

describe('formatAgendaStart', () => {
  it('na mesma semana: dia da semana e hora de Brasília', () => {
    expect(formatAgendaStart('2026-09-12T17:00:00.000Z', NOW)).toBe('Sáb, 14h');
    expect(formatAgendaStart('2026-09-12T22:30:00.000Z', NOW)).toBe('Sáb, 19h30');
  });

  it('a partir de 6 dias, entra a data', () => {
    expect(formatAgendaStart('2026-09-19T17:00:00.000Z', NOW)).toBe('Sáb, 19/09, 14h');
  });
});

describe('isSameDay', () => {
  it('compara o dia em Brasília, não em UTC', () => {
    // 11/09 às 23h30 em Brasília já é 12/09 em UTC
    expect(isSameDay('2026-09-12T02:30:00.000Z', NOW)).toBe(true);
    expect(isSameDay('2026-09-12T03:30:00.000Z', NOW)).toBe(false);
  });
});

describe('agendaSituationText: textos de referência da tabela 5.2', () => {
  it.each([
    [{ kind: 'schedule_match', deadline: '2026-09-16T13:00:00.000Z' }, 'Marcar jogo · rodada fecha em 5 dias'],
    [{ kind: 'answer_proposal', openOptionCount: 3, deadline: NOW }, 'Responder proposta · 3 horários'],
    [{ kind: 'proposal_sent', deadline: NOW }, 'Proposta enviada · aguardando Pedro e Thiago'],
    [{ kind: 'scheduled', startsAt: '2026-09-12T17:00:00.000Z', venue: 'Arena Tucum' }, 'Sáb, 14h · Arena Tucum'],
    [{ kind: 'report_result', deadline: NOW }, 'Lançar resultado'],
    [
      { kind: 'confirm_result', deadline: '2026-09-12T20:00:00.000Z' },
      'Confirmar resultado · confirma sozinho em 31h',
    ],
    [
      { kind: 'awaiting_confirmation', deadline: '2026-09-12T20:00:00.000Z' },
      'Aguardando confirmação · confirma sozinho em 31h',
    ],
    [{ kind: 'with_admin' }, 'Com o admin'],
    [{ kind: 'tournament_scheduled', startsAt: '2026-09-12T12:00:00.000Z', venue: 'Quadra 3' }, 'Sáb, 9h · Quadra 3'],
    [{ kind: 'tournament_scheduled', startsAt: null, venue: null }, 'Horário a definir'],
    [{ kind: 'tournament_with_admin' }, 'Resultado com o admin'],
    [{ kind: 'confirm_friendly' }, 'Confirmar amistoso'],
    [{ kind: 'friendly_awaiting' }, 'Aguardando confirmação'],
    [{ kind: 'friendly_discarded' }, 'Descartado'],
    [{ kind: 'friendly_cancelled' }, 'Cancelado'],
  ] as const)('%o', (situation, expected) => {
    expect(agendaSituationText(situation, ctx)).toBe(expected);
  });
});

describe('formatResultLine', () => {
  it('lê o placar do lado de quem vê, com os pontos do ranking', () => {
    expect(formatResultLine(WIN_A, { a: 104, b: 46 }, 'a')).toBe('Vitória 6/4 · 104 pts');
    expect(formatResultLine(WIN_A, { a: 104, b: 46 }, 'b')).toBe('Derrota 4/6 · 46 pts');
  });

  it('sem pontos no torneio e no amistoso', () => {
    expect(formatResultLine(WIN_A, null, 'a')).toBe('Vitória 6/4');
  });

  it('W.O., W.O. duplo e desistência', () => {
    expect(formatResultLine({ type: 'wo', winner: 'b' }, { a: 0, b: 100 }, 'a')).toBe('Derrota por W.O. · 0 pts');
    expect(formatResultLine({ type: 'double_wo' }, { a: 0, b: 0 }, 'a')).toBe('W.O. duplo · 0 pts');
    const retired: RetiredResult = {
      type: 'retired',
      winner: 'b',
      sets: [{ games_a: 4, games_b: 2, super_tiebreak: false, interrupted: true }],
    };
    expect(formatResultLine(retired, null, 'b')).toBe('Vitória 2/4 desist.');
  });
});

describe('groupByHistoryMonth', () => {
  it('agrupa em ordem, um grupo por mês', () => {
    const entries = [
      { id: 1, played_at: '2026-09-20T12:00:00.000Z' },
      { id: 2, played_at: '2026-09-02T12:00:00.000Z' },
      { id: 3, played_at: '2026-08-30T12:00:00.000Z' },
    ];
    expect(groupByHistoryMonth(entries).map((month) => [month.label, month.entries.map((e) => e.id)])).toEqual([
      ['Setembro de 2026', [1, 2]],
      ['Agosto de 2026', [3]],
    ]);
  });
});
