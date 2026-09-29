import { describe, expect, it } from 'vitest';
import { closeRound } from '../roundClose';
import { enrollment, played, testRounds, win } from '../standings.test-utils';
import { deltaBaseRound, positionDeltas } from './positionDelta';
import { thirdRound, threeRoundScope } from './rankingTable.test-utils';

// Delta da tabela (docs/RANKING.md, RK12; leitura RL10).
//
// Rodada 1: X vence Y        → foto 1: X, Y, Z
// Rodada 2: Z vence X e Y    → foto 2: Z, X, Y
// Rodada 3: Y vence X        → ao vivo: Z, Y, X

const [x, y, z] = [enrollment('x', 0), enrollment('y', 1), enrollment('z', 2)];
const { first, second } = testRounds;

const r1 = played(x, y, win(6, 4), { round: first, confirmedAt: '2026-01-02T12:00:00Z' });
const r2a = played(z, x, win(6, 0), { round: second, confirmedAt: '2026-01-23T12:00:00Z' });
const r2b = played(z, y, win(6, 0), { round: second, confirmedAt: '2026-01-24T12:00:00Z' });
const r3 = played(y, x, win(6, 0), { round: thirdRound, confirmedAt: '2026-02-13T12:00:00Z' });

const scope = threeRoundScope([x, y, z], [r1, r2a, r2b, r3]);
const snapshots = [...closeRound(first, scope), ...closeRound(second, scope)];
const deltasAt = (asOf: string) => Object.fromEntries(positionDeltas(scope, snapshots, asOf));

describe('deltaBaseRound (RK12)', () => {
  it('primeira rodada em curso: sem base', () => {
    expect(deltaBaseRound(scope, '2026-01-10T00:00:00Z')).toBeNull();
  });

  it('1ª rodada fechada, sem resultado da 2ª: ainda sem base', () => {
    expect(deltaBaseRound(scope, '2026-01-22T12:00:00Z')).toBeNull();
  });

  it('do fechamento da N até o primeiro resultado da N+1, a base é a N−1', () => {
    expect(deltaBaseRound(scope, '2026-02-12T12:00:00Z')?.id).toBe(first.id);
  });

  it('a partir do primeiro resultado confirmado da N+1, a base é a N', () => {
    expect(deltaBaseRound(scope, '2026-02-13T12:00:00Z')?.id).toBe(second.id);
  });

  it('a decisão tardia do admin numa partida da N também troca a base', () => {
    const late = played(x, z, win(6, 4), { round: second, confirmedAt: '2026-02-12T10:00:00Z' });
    const withLate = threeRoundScope([x, y, z], [r1, r2a, r2b, late]);
    expect(deltaBaseRound(withLate, '2026-02-12T09:00:00Z')?.id).toBe(first.id);
    expect(deltaBaseRound(withLate, '2026-02-12T11:00:00Z')?.id).toBe(second.id);
  });
});

describe('positionDeltas (RK12)', () => {
  it('primeira rodada: nenhuma linha tem delta', () => {
    expect(deltasAt('2026-01-10T00:00:00Z')).toEqual({});
  });

  it('1ª rodada fechada: sem delta até o primeiro resultado da 2ª', () => {
    expect(deltasAt('2026-01-22T12:00:00Z')).toEqual({});
  });

  it('primeiro resultado da 2ª rodada: compara com a foto da 1ª', () => {
    // Ao vivo: X, Z, Y. X manteve o 1º e não aparece
    expect(deltasAt('2026-01-23T13:00:00Z')).toEqual({ [z.id]: 1, [y.id]: -1 });
  });

  it('logo depois do fechamento: o mesmo delta do card "subiu N", nos dois sentidos', () => {
    expect(deltasAt('2026-02-12T12:00:00Z')).toEqual({ [z.id]: 2, [x.id]: -1, [y.id]: -1 });
  });

  it('primeiro resultado da rodada seguinte: a base passa a ser a foto recém-fechada', () => {
    expect(deltasAt('2026-02-13T12:00:00Z')).toEqual({ [y.id]: 1, [x.id]: -1 });
  });

  it('inscrição que entrou depois da foto base não tem delta', () => {
    const late = { ...enrollment('w', 3), enrolled_at: '2026-02-13T00:00:00Z' };
    const withNew = threeRoundScope([x, y, z, late], [r1, r2a, r2b, r3]);
    const deltas = positionDeltas(withNew, snapshots, '2026-02-14T00:00:00Z');
    expect(deltas.has(late.id)).toBe(false);
  });

  it('ignora fotos de outra categoria', () => {
    const foreign = snapshots.map((s) => ({ ...s, category_id: 'cat-other' }));
    expect(Object.fromEntries(positionDeltas(scope, foreign, '2026-02-12T12:00:00Z'))).toEqual({});
  });
});
