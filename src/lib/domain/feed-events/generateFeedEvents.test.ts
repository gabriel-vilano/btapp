import { describe, expect, it } from 'vitest';
import type { Match, Milestone } from '@/src/types/domain';
import { mockDomain, mockEntities } from '@/src/mocks/domain';
import { annulResult, correctResult, type AdminContext } from '../match-state';
import { matchPoints } from '../matchPoints';
import type { ConfirmedRankingMatch } from '../standingsStats';
import { generateFeedEvents } from './generateFeedEvents';
import { grantMilestones } from './milestones';
import { isVisibleTo } from './visibility';

// A geração sobre o cenário completo dos mocks: os eventos escritos à mão em
// `src/mocks/domain/feedEvents.ts` servem de gabarito independente.

const NOW = new Date().toISOString();
const events = generateFeedEvents(mockDomain, NOW);
const { season, rounds, masculinoB: mb } = mockEntities;
const admin = mockDomain.admins.find((a) => a.competition_id === season.ranking_id)?.player_id ?? '';
const adminContext: AdminContext = {
  adminIds: [admin],
  score: (result, format) => matchPoints(result, format, mockEntities.ranking.scoring_rule),
};

function confirmedRankingMatch(): ConfirmedRankingMatch {
  const match = mockDomain.matches.find((m): m is ConfirmedRankingMatch => m.kind === 'ranking' && m.status === 'confirmed');
  if (match === undefined) throw new Error('mocks sem partida de ranking confirmada');
  return match;
}

function withMatch(replacement: Match) {
  return { ...mockDomain, matches: mockDomain.matches.map((m) => (m.id === replacement.id ? replacement : m)) };
}

describe('generateFeedEvents sobre os mocks do domínio', () => {
  it.each(mockDomain.feedEvents.map((event) => [event.id, event] as const))(
    'reproduz o evento do gabarito %s',
    (id, expected) => {
      const generated = events.find((event) => event.id === id);
      expect({ ...generated, actor_ids: [...(generated?.actor_ids ?? [])].sort() })
        .toEqual({ ...expected, actor_ids: [...expected.actor_ids].sort() });
    },
  );

  it('vem do mais recente para o mais antigo, sem nada depois de agora e sem id repetido', () => {
    const times = events.map((event) => Date.parse(event.created_at));
    expect(times).toEqual([...times].sort((a, b) => b - a));
    expect(Math.max(...times)).toBeLessThanOrEqual(Date.parse(NOW));
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
  });

  it('pendência não é evento: só partida confirmada vira resultado (R16, R24)', () => {
    const resultIds = events.flatMap((event) => (event.type === 'result' ? [event.match_id] : []));
    const confirmedIds = mockDomain.matches.filter((match) => match.status === 'confirmed').map((match) => match.id);
    expect(resultIds.sort()).toEqual(confirmedIds.sort());
  });

  it('só o "caiu" é privado (R21, R22)', () => {
    for (const event of events) expect(event.visibility, event.id).toBe(event.type === 'ranking_down' ? 'private' : 'public');
  });

  it('a classificação para a final só sai depois da data de corte (R28)', () => {
    expect(events.some((event) => event.type === 'final_qualification')).toBe(false);
    const afterCutoff = generateFeedEvents(mockDomain, season.final?.cutoff_date ?? NOW);
    const qualified = afterCutoff.filter((event) => event.type === 'final_qualification');
    // 4 vagas em cada uma das duas categorias
    expect(qualified).toHaveLength(8);
  });
});

describe('marcos sobre as fotos dos mocks (R47)', () => {
  it('conceder rodada a rodada reproduz os marcos do gabarito', () => {
    const granted: Milestone[] = [];
    for (const round of [rounds.first, rounds.second]) {
      granted.push(...grantMilestones(mockDomain.standingSnapshots, round, season, granted));
    }
    const summary = (milestones: Milestone[]) =>
      milestones.map((m) => `${m.type}|${m.enrollment_id}|${m.round_id}|${m.achieved_at}`).sort();
    expect(summary(granted)).toEqual(summary(mockDomain.milestones));
  });
});

describe('nada no feed é desmentido depois (R25, R41)', () => {
  const match = confirmedRankingMatch();
  const actor = { playerId: admin, at: NOW };
  const eventIds = (list: typeof events) => list.map((event) => event.id).sort();

  it('correção de placar mantém o card de resultado e os marcos', () => {
    const flipped = match.result.type !== 'double_wo' && match.result.winner === 'a' ? 'b' : 'a';
    const corrected = correctResult(match, { type: 'wo', winner: flipped }, actor, adminContext);
    const after = generateFeedEvents(withMatch(corrected), NOW);
    expect(eventIds(after)).toEqual(eventIds(events));
    const resultOf = (list: typeof events) => list.find((e) => e.type === 'result' && e.match_id === match.id);
    expect(resultOf(after)).toEqual(resultOf(events));
  });

  it('anulação tira o card de resultado, mas o confronto definido e os marcos ficam', () => {
    const after = generateFeedEvents(withMatch(annulResult(match, actor, adminContext)), NOW);
    expect(after.some((e) => e.type === 'result' && e.match_id === match.id)).toBe(false);
    expect(after.some((e) => e.type === 'match_defined' && e.match_id === match.id)).toBe(true);
    expect(after.filter((e) => e.type === 'milestone')).toEqual(events.filter((e) => e.type === 'milestone'));
  });
});

describe('as duas exceções da movimentação sobre os mocks', () => {
  const movementOf = (enrollmentId: string) => events.filter((event) =>
    (event.type === 'ranking_up' || event.type === 'ranking_down') && event.enrollment_id === enrollmentId);

  it('o T3 subiu de 3º para 1º na 2ª rodada, mas o marco de Líder substitui o "subiu" (R47)', () => {
    expect(movementOf(mb.t3.id)).toEqual([]);
    expect(events.some((event) => event.id === 'event-milestone-leader-arena-mangaba-andre-bruno')).toBe(true);
  });

  it('a M4, encerrada, caiu de 4º para 5º na 2ª rodada sem gerar o "caiu" (R45)', () => {
    const photoOf = (roundId: string) => mockDomain.standingSnapshots.find((s) =>
      s.enrollment_id === mockEntities.mistaC40.m4.id && s.round_id === roundId)?.position;
    expect([photoOf(rounds.first.id), photoOf(rounds.second.id)]).toEqual([4, 5]);
    expect(movementOf(mockEntities.mistaC40.m4.id)).toEqual([]);
  });
});

describe('isVisibleTo (R21, R22)', () => {
  const fell = events.find((event) => event.type === 'ranking_down' && event.enrollment_id === mb.t1.id);
  const result = events.find((event) => event.type === 'result');
  const t1Players = mockEntities.units.lucasRafael.player_ids;
  const outsider = mockEntities.players.marina.id;

  it('o "caiu" só a própria dupla vê: os dois jogadores', () => {
    if (fell === undefined) throw new Error('mocks sem queda do T1');
    for (const player of t1Players) expect(isVisibleTo(fell, player)).toBe(true);
    expect(isVisibleTo(fell, outsider)).toBe(false);
  });

  it('o evento público qualquer um vê', () => {
    if (result === undefined) throw new Error('mocks sem resultado');
    expect(result.actor_ids).not.toContain(outsider);
    expect(isVisibleTo(result, outsider)).toBe(true);
  });
});
