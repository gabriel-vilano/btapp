import { describe, expect, it } from 'vitest';
import type { RankingMatch } from '@/src/types/domain';
import { rankingImpactOf } from './rankingImpact';
import { enrollment, played, testRounds, testScope, win } from './standings.test-utils';

// Impacto da partida na classificação, logo depois da confirmação (docs/RESULTS.md, RG18).

const [x, y, z, w] = [enrollment('x', 0), enrollment('y', 1), enrollment('z', 2), enrollment('w', 3)];
const second = { round: testRounds.second };

// Rodada 1 (vitória 6/0 vale 112 e a derrota 38): z 146, y 112, w 112, x 80
const firstRound = [played(y, z, win(6, 0)), played(w, x, win(6, 0)), played(z, x, win(6, 2))];
const xBeatsY = played(x, y, win(6, 0), second);
const xBeatsZ = played(x, z, win(6, 0), second);
const scopeWith = (...matches: RankingMatch[]) => testScope([x, y, z, w], [...firstRound, ...matches]);
const asPending = (match: RankingMatch): RankingMatch => ({ ...match, status: 'defined' }) as RankingMatch;

describe('rankingImpactOf (RG18)', () => {
  it('vitória: pontos da partida, posição ao vivo e quantas posições subiu', () => {
    // x 192 passa z, y e w
    expect(rankingImpactOf(scopeWith(xBeatsY), xBeatsY, x.id)).toEqual({ points: 112, position: 1, position_change: 3 });
  });

  it('derrota: os pontos da derrota e o delta negativo', () => {
    // z 184 cai para trás de x 192
    expect(rankingImpactOf(scopeWith(xBeatsZ), xBeatsZ, z.id)).toEqual({ points: 38, position: 2, position_change: -1 });
  });

  it('manteve a posição: delta 0', () => {
    // y 150 continua em 2º
    expect(rankingImpactOf(scopeWith(xBeatsY), xBeatsY, y.id)).toEqual({ points: 38, position: 2, position_change: 0 });
  });

  it('usa a versão da partida passada, não a do escopo: a confirmação acabou de acontecer', () => {
    expect(rankingImpactOf(scopeWith(asPending(xBeatsY)), xBeatsY, x.id)).toMatchObject({ position: 1, position_change: 3 });
  });

  it('a posição é a atual: inclui a partida de outros confirmada depois', () => {
    // w 224 passa x depois; o delta compara a tabela atual com e sem esta partida
    const later = played(w, z, win(6, 0), { ...second, confirmedAt: '2026-01-30T00:00:00Z' });
    expect(rankingImpactOf(scopeWith(xBeatsY, later), xBeatsY, x.id)).toMatchObject({ position: 2, position_change: 2 });
  });

  it('primeira partida confirmada da categoria: sem posição anterior, sem delta (RK20)', () => {
    const only = played(x, y, win(6, 3));
    expect(rankingImpactOf(testScope([x, y], [only]), only, x.id)).toMatchObject({ position: 1, position_change: null });
  });

  it('sem impacto: partida não confirmada ou inscrição que não jogou', () => {
    expect(rankingImpactOf(scopeWith(), asPending(xBeatsY), x.id)).toBeNull();
    expect(rankingImpactOf(scopeWith(xBeatsY), xBeatsY, w.id)).toBeNull();
  });
});
