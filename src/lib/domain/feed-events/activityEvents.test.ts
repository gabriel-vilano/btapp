import { describe, expect, it } from 'vitest';
import type { Friendship, FriendlyMatch, Match, RankingMatch } from '@/src/types/domain';
import { gameSet } from '@/src/mocks/domain/builders';
import { enrollment, played, testRounds, win } from '../standings.test-utils';
import type { ConfirmedRankingMatch } from '../standingsStats';
import { enrollmentEvents, friendshipEvents, matchDefinedEvents, resultEvents } from './activityEvents';
import { actorLookup } from './feedDomain';
import { actorsFor, unitOf } from './feedEvents.test-utils';

const t1 = enrollment('t1', 1);
const t2 = enrollment('t2', 2);
const actors = actorsFor([t1, t2]);
function asConfirmed(match: RankingMatch): ConfirmedRankingMatch {
  if (match.status !== 'confirmed') throw new Error(`partida '${match.id}' está '${match.status}', esperado 'confirmed'`);
  return match;
}

const confirmed = asConfirmed(played(t1, t2, win(6, 4), { confirmedAt: '2026-01-05T20:00:00Z' }));

const defined: RankingMatch = {
  id: 'match-defined',
  kind: 'ranking',
  competition_id: confirmed.competition_id,
  category_id: confirmed.category_id,
  round_id: testRounds.first.id,
  undone_reports: [],
  side_a_enrollment_id: t1.id,
  side_b_enrollment_id: t2.id,
  format: 'one_set_of_6',
  scheduled_at: null,
  venue: null,
  created_at: testRounds.first.starts_at, // o sorteio
  status: 'defined',
};

const friendly: FriendlyMatch = {
  id: 'match-friendly',
  kind: 'friendly',
  side_a_unit_id: unitOf(t1).id,
  side_b_unit_id: unitOf(t2).id,
  format: 'one_set_of_6',
  played_at: '2026-01-10T18:00:00Z',
  venue: null,
  created_at: '2026-01-10T20:00:00Z',
  report: { result: { type: 'normal', winner: 'a', sets: [gameSet(6, 3)] }, reported_by: 't1-1', reported_at: '2026-01-10T20:00:00Z' },
  status: 'confirmed',
  response: { responded_by: 't2-1', responded_at: '2026-01-11T09:00:00Z' },
};

describe('resultEvents (R16, R24)', () => {
  it('gera um evento público por partida confirmada, com os 4 jogadores como atores', () => {
    const [event] = resultEvents([confirmed], actors);
    expect(event).toEqual({
      id: `event-result-${confirmed.id}`,
      type: 'result',
      visibility: 'public',
      match_id: confirmed.id,
      actor_ids: ['t1-1', 't1-2', 't2-1', 't2-2'],
      created_at: '2026-01-05T20:00:00Z',
    });
  });

  it('nasce na confirmação, venha do adversário, do prazo ou do admin', () => {
    const byOpponent = { ...confirmed, confirmation: { via: 'opponent', responded_by: 't2-1', responded_at: '2026-01-06T10:00:00Z' } } satisfies Match;
    const byDeadline = { ...confirmed, confirmation: { via: 'deadline', confirmed_at: '2026-01-07T10:00:00Z' } } satisfies Match;
    expect(resultEvents([byOpponent], actors)[0].created_at).toBe('2026-01-06T10:00:00Z');
    expect(resultEvents([byDeadline], actors)[0].created_at).toBe('2026-01-07T10:00:00Z');
  });

  it('amistoso confirmado nasce na resposta do outro lado', () => {
    const units = [unitOf(t1), unitOf(t2)];
    const [event] = resultEvents([friendly], actorLookup({ units, enrollments: [] }));
    expect(event.created_at).toBe('2026-01-11T09:00:00Z');
    expect(event.actor_ids).toEqual(['t1-1', 't1-2', 't2-1', 't2-2']);
  });

  it('partida sem confirmação (definida, aguardando, pendente) não é resultado', () => {
    const pendingFriendly: FriendlyMatch = { ...friendly, status: 'awaiting_confirmation' };
    expect(resultEvents([defined, pendingFriendly], actors)).toEqual([]);
  });

  it('correção de placar mantém o mesmo evento: o card atualiza, não duplica (R41)', () => {
    const corrected: Match = { ...confirmed, result: win(6, 0), correction: { admin_id: 'adm', acted_at: '2026-02-01T00:00:00Z' } };
    expect(resultEvents([corrected], actors)).toEqual(resultEvents([confirmed], actors));
  });
});

describe('matchDefinedEvents', () => {
  it('gera um evento por confronto de competição, no momento do sorteio', () => {
    const [event] = matchDefinedEvents([defined], actors);
    expect(event).toMatchObject({ type: 'match_defined', visibility: 'public', match_id: 'match-defined' });
    expect(event.created_at).toBe(testRounds.first.starts_at);
  });

  it('o confronto continua definido depois que a partida é confirmada', () => {
    expect(matchDefinedEvents([confirmed], actors)).toHaveLength(1);
  });

  it('amistoso não tem confronto definido: nasce com o resultado (R42)', () => {
    expect(matchDefinedEvents([friendly], actors)).toEqual([]);
  });
});

describe('enrollmentEvents e friendshipEvents', () => {
  it('inscrição gera evento público com a dupla como atora', () => {
    const [event] = enrollmentEvents([t1], actors);
    expect(event).toMatchObject({ type: 'enrollment', visibility: 'public', enrollment_id: t1.id, created_at: t1.enrolled_at });
    expect(event.actor_ids).toEqual(['t1-1', 't1-2']);
  });

  it('só a amizade aceita vira evento (R24)', () => {
    const base = { requester_id: 'p1', addressee_id: 'p2', requested_at: '2026-01-01T00:00:00Z' };
    const friendships: Friendship[] = [
      { ...base, id: 'f-pending', status: 'pending' },
      { ...base, id: 'f-accepted', status: 'accepted', accepted_at: '2026-01-02T00:00:00Z' },
    ];
    const events = friendshipEvents(friendships);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ friendship_id: 'f-accepted', actor_ids: ['p1', 'p2'], created_at: '2026-01-02T00:00:00Z' });
  });
});
