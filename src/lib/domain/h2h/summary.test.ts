import { describe, expect, it } from 'vitest';
import { h2hSummary } from './summary';
import type { H2HConfrontation } from './types';

// Resumo (docs/HEAD_TO_HEAD.md, HH10).

function line(outcome: H2HConfrontation['outcome'], playedAt: string): H2HConfrontation {
  return {
    match_id: `match-${playedAt}`,
    played_at: playedAt,
    outcome,
    result_type: 'normal',
    score: { type: 'normal', sets: [{ a: 6, b: 4 }] },
    perspective: outcome === 'win' ? 'winner' : 'loser',
    context: { kind: 'friendly' },
    lineup: null,
  };
}

describe('h2hSummary', () => {
  it('sem confronto: zero e sem data (§6.1)', () => {
    expect(h2hSummary([])).toEqual({ left_wins: 0, right_wins: 0, total: 0, last_played_at: null });
  });

  it('um confronto só', () => {
    expect(h2hSummary([line('loss', '2026-05-01T12:00:00Z')])).toEqual({
      left_wins: 0,
      right_wins: 1,
      total: 1,
      last_played_at: '2026-05-01T12:00:00Z',
    });
  });

  it('empate, com a data do mais recente em qualquer posição da lista', () => {
    const lines = [
      line('win', '2026-02-01T12:00:00Z'),
      line('loss', '2026-07-01T12:00:00Z'),
      line('loss', '2026-01-01T12:00:00Z'),
      line('win', '2026-03-01T12:00:00Z'),
    ];
    expect(h2hSummary(lines)).toEqual({ left_wins: 2, right_wins: 2, total: 4, last_played_at: '2026-07-01T12:00:00Z' });
  });
});
