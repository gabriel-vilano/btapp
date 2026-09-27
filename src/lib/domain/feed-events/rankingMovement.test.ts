import { describe, expect, it } from 'vitest';
import type { Milestone, Round, StandingSnapshot } from '@/src/types/domain';
import { closed, enrollment, testRounds } from '../standings.test-utils';
import { actorsFor, photo } from './feedEvents.test-utils';
import { movementEvents } from './rankingMovement';

const [t1, t2, t3, t4] = ['t1', 't2', 't3', 't4'].map((slug, i) => enrollment(slug, i));
const actors = actorsFor([t1, t2, t3, t4]);
const rounds = Object.values(testRounds);
const { first, second } = testRounds;

// Rodada 1: T1, T2, T3. Rodada 2: T3 sobe 2, T1 e T2 caem 1, T4 estreia.
const snapshots = [...photo(first.id, [t1, t2, t3]), ...photo(second.id, [t3, t1, t2, t4])];
const enrollments = [t1, t2, t3, t4];
const domain = (standingSnapshots: StandingSnapshot[], extra: { milestones?: Milestone[]; rounds?: Round[] } = {}) => ({
  standingSnapshots,
  rounds: extra.rounds ?? rounds,
  enrollments,
  milestones: extra.milestones ?? [],
});
const events = movementEvents(domain(snapshots), actors);
const eventOf = (enrollmentId: string) => events.find((event) => event.enrollment_id === enrollmentId);

describe('movementEvents (R22, R24, R46)', () => {
  it('subiu é público, com a posição de antes e a de agora', () => {
    expect(eventOf(t3.id)).toMatchObject({
      type: 'ranking_up',
      visibility: 'public',
      from_position: 3,
      to_position: 1,
      round_id: second.id,
      created_at: second.deadline,
    });
  });

  it('caiu é privado, e os atores são os dois da dupla (R22)', () => {
    expect(eventOf(t1.id)).toMatchObject({ type: 'ranking_down', visibility: 'private', from_position: 1, to_position: 2 });
    expect(eventOf(t1.id)?.actor_ids).toEqual(['t1-1', 't1-2']);
  });

  it('variação zero não gera evento', () => {
    const still = [...photo(first.id, [t1, t2]), ...photo(second.id, [t1, t2])];
    expect(movementEvents(domain(still), actors)).toEqual([]);
  });

  it('a 1ª rodada e a inscrição que estreia no meio da temporada não geram movimento', () => {
    expect(events.some((event) => event.round_id === first.id)).toBe(false);
    expect(eventOf(t4.id)).toBeUndefined();
    expect(events).toHaveLength(3);
  });

  it('compara só rodadas consecutivas da mesma temporada', () => {
    const otherSeason: Round = { ...first, id: 'round-other-1', season_id: 'season-other' };
    const mixed = [...photo(otherSeason.id, [t2, t1]), ...photo(second.id, [t1, t2])];
    expect(movementEvents(domain(mixed, { rounds: [otherSeason, ...rounds] }), actors)).toEqual([]);
  });

  it('foto de rodada inexistente é erro, com o id na mensagem', () => {
    expect(() => movementEvents(domain(photo('round-x', [t1])), actors)).toThrow("rodada 'round-x' não existe");
  });

  it('o marco da rodada substitui o "subiu" da mesma inscrição (R47)', () => {
    const leader: Milestone = {
      id: 'milestone-leader-t3', type: 'leader', enrollment_id: t3.id, season_id: second.season_id,
      round_id: second.id, achieved_at: second.deadline,
    };
    const withMilestone = movementEvents(domain(snapshots, { milestones: [leader] }), actors);
    expect(withMilestone.find((event) => event.enrollment_id === t3.id)).toBeUndefined();
    // O "caiu" de quem perdeu a liderança continua
    expect(withMilestone.map((event) => event.enrollment_id)).toEqual([t1.id, t2.id]);
  });

  it('marco de outra rodada não esconde o "subiu"', () => {
    const earlier: Milestone = {
      id: 'milestone-top_n-t3', type: 'top_n', n: 4, enrollment_id: t3.id, season_id: first.season_id,
      round_id: first.id, achieved_at: first.deadline,
    };
    expect(movementEvents(domain(snapshots, { milestones: [earlier] }), actors).map((e) => e.type)).toContain('ranking_up');
  });

  it('inscrição encerrada não gera movimentação depois do encerramento (R45)', () => {
    const t1Closed = closed(t1, '2026-01-25T00:00:00Z'); // entre as rodadas 1 e 2
    const result = movementEvents({ ...domain(snapshots), enrollments: [t1Closed, t2, t3, t4] }, actors);
    expect(result.find((event) => event.enrollment_id === t1.id)).toBeUndefined();
    expect(result).toHaveLength(2);
  });

  it('encerrada depois do fechamento da rodada ainda tem a movimentação daquela rodada', () => {
    const t1ClosedLater = closed(t1, '2026-02-20T00:00:00Z');
    const result = movementEvents({ ...domain(snapshots), enrollments: [t1ClosedLater, t2, t3, t4] }, actors);
    expect(result.some((event) => event.enrollment_id === t1.id)).toBe(true);
  });
});
