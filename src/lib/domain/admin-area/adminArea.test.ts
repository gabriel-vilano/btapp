import { describe, expect, it } from 'vitest';
import { adminMatchStatusLabel, matchNeedsAdmin, sortDecisionsOldestFirst, type AdminDecisionItem } from '.';

function decision(id: string, since: string): AdminDecisionItem {
  return { id, kind: 'contested', category_name: 'Masculino C', round_label: 'Rodada 4', sides: 'A x B', since };
}

describe('sortDecisionsOldestFirst', () => {
  it('põe a decisão mais antiga primeiro', () => {
    const recent = decision('recent', '2026-09-29T12:00:00.000Z');
    const oldest = decision('oldest', '2026-09-20T12:00:00.000Z');
    const middle = decision('middle', '2026-09-25T12:00:00.000Z');
    expect(sortDecisionsOldestFirst([recent, oldest, middle]).map((item) => item.id)).toEqual([
      'oldest',
      'middle',
      'recent',
    ]);
  });

  it('desempata pelo id quando as duas esperam desde o mesmo instante', () => {
    const since = '2026-09-25T12:00:00.000Z';
    expect(sortDecisionsOldestFirst([decision('b', since), decision('a', since)]).map((item) => item.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('não altera a lista recebida', () => {
    const decisions = [decision('recent', '2026-09-29T12:00:00.000Z'), decision('oldest', '2026-09-20T12:00:00.000Z')];
    sortDecisionsOldestFirst(decisions);
    expect(decisions[0].id).toBe('recent');
  });
});

describe('adminMatchStatusLabel', () => {
  it('usa os rótulos dos badges da RESULTS §9', () => {
    expect(adminMatchStatusLabel({ status: 'awaiting_confirmation', corrected: false })).toBe('Aguardando confirmação');
    expect(adminMatchStatusLabel({ status: 'in_arbitration', corrected: false })).toBe('Em arbitragem');
  });

  it('diz "Corrigido" na partida confirmada que o admin corrigiu (R41)', () => {
    expect(adminMatchStatusLabel({ status: 'confirmed', corrected: true })).toBe('Corrigido');
    expect(adminMatchStatusLabel({ status: 'confirmed', corrected: false })).toBe('Confirmada');
  });
});

describe('matchNeedsAdmin', () => {
  it('marca só o que espera decisão do admin', () => {
    expect(matchNeedsAdmin('in_arbitration')).toBe(true);
    expect(matchNeedsAdmin('not_played')).toBe(true);
    expect(matchNeedsAdmin('awaiting_confirmation')).toBe(false);
    expect(matchNeedsAdmin('confirmed')).toBe(false);
  });
});
