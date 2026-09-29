import { describe, expect, it } from 'vitest';
import { DEFAULT_TOP_N, type Milestone } from '@/src/types/domain';
import { enrollment, testRounds } from '../standings.test-utils';
import { actorsFor, photo, testSeason } from './feedEvents.test-utils';
import { grantMilestones, milestoneEvents, topNOf } from './milestones';

const [t1, t2, t3, t4] = ['t1', 't2', 't3', 't4'].map((slug, i) => enrollment(slug, i));
const actors = actorsFor([t1, t2, t3, t4]);
const { first, second } = testRounds;
const season = testSeason(2); // final com 2 classificados: marco Top 2

const firstGrant = grantMilestones(photo(first.id, [t1, t2, t3, t4]), first, season, []);
const secondGrant = grantMilestones(photo(second.id, [t3, t1, t2, t4]), second, season, firstGrant);
const summary = (milestones: Milestone[]) => milestones.map((m) => `${m.type}:${m.enrollment_id}`);

describe('grantMilestones (R47)', () => {
  it('na 1ª rodada, o 1º ganha Líder e Top N, e o 2º só Top N', () => {
    expect(summary(firstGrant)).toEqual([`leader:${t1.id}`, `top_n:${t1.id}`, `top_n:${t2.id}`]);
    expect(firstGrant.every((m) => m.round_id === first.id && m.achieved_at === first.deadline)).toBe(true);
  });

  it('só concede a primeira vez na temporada', () => {
    // T3 chega a 1º pela primeira vez; T1, que já foi Líder e Top 2, não ganha de novo
    expect(summary(secondGrant)).toEqual([`leader:${t3.id}`, `top_n:${t3.id}`]);
  });

  it('N é a quantidade de classificados da final, ou 10 sem final', () => {
    expect(topNOf(season)).toBe(2);
    expect(topNOf(testSeason(null))).toBe(DEFAULT_TOP_N);
    const topN = firstGrant.find((m) => m.type === 'top_n');
    expect(topN?.type === 'top_n' && topN.n).toBe(2);
  });

  it('ignora a foto de outra rodada e recusa rodada de outra temporada', () => {
    expect(grantMilestones(photo(second.id, [t4]), first, season, [])).toEqual([]);
    const foreign = { ...first, season_id: 'season-other' };
    expect(() => grantMilestones([], foreign, season, [])).toThrow(`esperado '${season.id}'`);
  });
});

describe('milestoneEvents (R25, R47)', () => {
  const events = milestoneEvents([...firstGrant, ...secondGrant], actors);

  it('Líder e Top N na mesma rodada viram um evento só, o de Líder', () => {
    expect(events.map((event) => event.milestone_id)).toEqual([
      `milestone-leader-${t1.id}`,
      `milestone-top_n-${t2.id}`,
      `milestone-leader-${t3.id}`,
    ]);
  });

  it('o marco é público e da dupla inteira', () => {
    expect(events[0]).toMatchObject({ visibility: 'public', actor_ids: ['t1-1', 't1-2'], created_at: first.deadline });
  });

  it('marco concedido não é revogado quando a posição cai depois (R25)', () => {
    // Na foto da 2ª rodada o T2 caiu para 3º, fora do Top 2: o marco e o evento continuam
    expect(events.some((event) => event.milestone_id === `milestone-top_n-${t2.id}`)).toBe(true);
  });
});
