import { describe, expect, it } from 'vitest';
import type { RankingMatch } from '@/src/types/domain';
import { retiredB } from '../match-count/matchCount.test-utils';
import { enrollment, played, testScope, win } from '../standings.test-utils';
import { lineRecords } from './lineRecord';
import { annulled } from './rankingTable.test-utils';

// Jogos e vitórias da linha (docs/RANKING.md, RK8): a definição de jogo do
// `total_matches` (R18), com o recorte da inscrição na temporada.

const [x, y, z] = [enrollment('x', 0), enrollment('y', 1), enrollment('z', 2)];
const recordOf = (matches: RankingMatch[], id = x.id) => lineRecords(testScope([x, y, z], matches)).get(id);

describe('lineRecords (RK8)', () => {
  it('resultado normal: jogo para os dois, vitória para quem venceu', () => {
    const matches = [played(x, y, win(6, 4))];
    expect(recordOf(matches, x.id)).toEqual({ played: 1, wins: 1 });
    expect(recordOf(matches, y.id)).toEqual({ played: 1, wins: 0 });
  });

  it('desistência conta: houve jogo', () => {
    expect(recordOf([played(x, y, retiredB(3, 1))])).toEqual({ played: 1, wins: 1 });
  });

  it('vitória por W.O. fica fora de jogos e de vitórias', () => {
    const matches = [played(x, y, win(6, 4)), played(x, z, { type: 'wo', winner: 'a' })];
    expect(recordOf(matches, x.id)).toEqual({ played: 1, wins: 1 });
    expect(recordOf(matches, z.id)).toEqual({ played: 0, wins: 0 });
  });

  it('W.O. duplo fica fora', () => {
    expect(recordOf([played(x, y, { type: 'double_wo' })])).toEqual({ played: 0, wins: 0 });
  });

  it('partida cancelada ou não confirmada fica fora', () => {
    const notPlayed: RankingMatch = { ...played(x, z, win(6, 0)), status: 'not_played' };
    expect(recordOf([annulled(played(x, y, win(6, 4))), notPlayed])).toEqual({ played: 0, wins: 0 });
  });

  it('partida de outra categoria fica fora', () => {
    expect(recordOf([{ ...played(x, y, win(6, 4)), category_id: 'cat-other' }])).toEqual({ played: 0, wins: 0 });
  });

  it('inscrição sem partida aparece zerada', () => {
    expect(recordOf([], z.id)).toEqual({ played: 0, wins: 0 });
  });

  it('com asOf, conta só o confirmado até ali', () => {
    const later = played(x, z, win(6, 0), { confirmedAt: '2026-01-10T00:00:00Z' });
    const scope = testScope([x, y, z], [played(x, y, win(6, 4)), later]);
    expect(lineRecords(scope, '2026-01-05T00:00:00Z').get(x.id)).toEqual({ played: 1, wins: 1 });
  });
});
