import { describe, expect, it } from 'vitest';
import { closeRound } from '@/src/lib/domain/roundClose';
import { mockProfileDomain, pastSeasonEntities } from './index';

// A temporada encerrada do `mockProfileDomain` bate com as partidas: as fotos
// são o fechamento de cada rodada, e os ids não colidem com a temporada atual.

const { season, rounds } = pastSeasonEntities;
const scope = { season_id: season.id, category_id: 'cat-arena-rm-masculino-b', ...mockProfileDomain };

describe('mocks: temporada encerrada (PF19)', () => {
  it.each(Object.values(rounds))('foto de $id = fechamento da rodada (R46)', (round) => {
    const photo = mockProfileDomain.standingSnapshots.filter((s) => s.round_id === round.id);
    expect(photo).toEqual(closeRound(round, scope));
  });

  it('terminou antes da temporada atual começar', () => {
    const current = mockProfileDomain.seasons.find((s) => s.id !== season.id);
    expect(Date.parse(season.ends_on)).toBeLessThan(Date.parse(current?.starts_on ?? ''));
  });

  it.each(['seasons', 'rounds', 'enrollments', 'matches', 'milestones'] as const)('%s não repete id', (table) => {
    const ids = mockProfileDomain[table].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
