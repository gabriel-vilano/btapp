import { describe, expect, it } from 'vitest';
import { scheduleViewOf } from '@/src/lib/domain/schedule-state';
import { mockDomain } from './domain';
import { MOCK_VIEWER_ID, matchScreenDataOf } from './matchScreen';

const NOW = new Date().toISOString();

describe('dados da tela do confronto nos mocks', () => {
  it('resolve os lados, os nomes e a rodada do confronto', () => {
    const data = matchScreenDataOf('match-arena-mangaba-mb-r3-1');
    expect(data?.sideNames).toEqual({ a: 'Lucas e Rafael', b: 'Caio e Diego' });
    expect(data?.categoryName).toBe('Masculino B');
    expect(data?.roundNumber).toBe(3);
    expect(data?.viewerId).toBe(MOCK_VIEWER_ID);
    expect(data?.playerNames['player-diego']).toBe('Diego');
  });

  it('o confronto sem data do Lucas é "sem data": a última proposta foi retirada (M10)', () => {
    const data = matchScreenDataOf('match-arena-mangaba-mb-r3-1');
    if (data === null) throw new Error('mock da r3-1 ausente');
    expect(scheduleViewOf({ ...data, now: NOW }).kind).toBe('no_date');
  });

  it('partida que não existe ou não é do ranking não tem tela de marcação (M1)', () => {
    expect(matchScreenDataOf('match-inexistente')).toBeNull();
    for (const kind of ['friendly', 'tournament'] as const) {
      const match = mockDomain.matches.find((candidate) => candidate.kind === kind);
      expect(match && matchScreenDataOf(match.id)).toBeNull();
    }
  });
});
