import { describe, expect, it } from 'vitest';
import type { Enrollment } from '@/src/types/domain';
import { enrollment, played, testScope, win } from '../standings.test-utils';
import { annulled } from './rankingTable.test-utils';
import { unrankedEnrollments } from './unrankedTable';

// Temporada aberta sem jogo confirmado (docs/RANKING.md, RK20).

const bruno = enrollment('bruno', 0);
const agata = enrollment('agata', 1);
const carla = enrollment('carla', 2);
const NAMES: Record<string, string> = {
  [bruno.id]: 'Bruno e Diego',
  [agata.id]: 'Ágata e Rita',
  [carla.id]: 'Carla e Lia',
};
const nameOf = (e: Enrollment) => NAMES[e.id];

describe('unrankedEnrollments (RK20)', () => {
  it('sem partida confirmada: inscrições em ordem alfabética, acento incluído', () => {
    const list = unrankedEnrollments(testScope([bruno, carla, agata], []), nameOf);
    expect(list?.map((e) => e.id)).toEqual([agata.id, bruno.id, carla.id]);
  });

  it('partida cancelada não inicia a classificação', () => {
    const scope = testScope([bruno, carla, agata], [annulled(played(bruno, carla, win(6, 4)))]);
    expect(unrankedEnrollments(scope, nameOf)).not.toBeNull();
  });

  it('com o primeiro resultado confirmado, vale a classificação', () => {
    expect(unrankedEnrollments(testScope([bruno, carla, agata], [played(bruno, carla, win(6, 4))]), nameOf)).toBeNull();
  });

  it('W.O. confirmado também inicia: já dá pontos', () => {
    const scope = testScope([bruno, carla, agata], [played(bruno, carla, { type: 'wo', winner: 'a' })]);
    expect(unrankedEnrollments(scope, nameOf)).toBeNull();
  });

  it('com asOf, antes do primeiro resultado ainda é a lista', () => {
    const scope = testScope([bruno, carla, agata], [played(bruno, carla, win(6, 4), { confirmedAt: '2026-01-10T00:00:00Z' })]);
    expect(unrankedEnrollments(scope, nameOf, '2026-01-05T00:00:00Z')).toHaveLength(3);
  });
});
