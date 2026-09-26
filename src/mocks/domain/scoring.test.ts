import { describe, expect, it } from 'vitest';
import type { CompetitionResult, FriendlyResult, Match, RankingCompetition } from '@/src/types/domain';
import { matchPoints } from '@/src/lib/domain/matchPoints';
import { validateScore } from '@/src/lib/domain/matchScore';
import { mockDomain } from './index';
import { byId, get, rankingMatches } from './integrity.test-utils';

// Os pontos dos mocks foram calculados à mão. Este teste amarra o mock à
// regra: se um dos dois mudar, a divergência aparece aqui.

function rankingOf(competitionId: string): RankingCompetition {
  const competition = get(byId.competitions, competitionId);
  if (competition.type !== 'ranking') throw new Error(`'${competitionId}' não é ranking: é ${competition.type}`);
  return competition;
}

/** Todo resultado que aparece na partida: o lançado e o confirmado. */
function resultsOf(match: Match): (CompetitionResult | FriendlyResult)[] {
  const results: (CompetitionResult | FriendlyResult)[] = [];
  if ('report' in match && match.report !== null) results.push(match.report.result);
  if ('result' in match) results.push(match.result);
  return results;
}

describe('mocks de domínio: placar e pontos', () => {
  it.each(rankingMatches.flatMap((match) => (match.status === 'confirmed' ? [[match.id, match] as const] : [])))(
    '%s: pontos batem com a regra do ranking (R9–R11, R36)',
    (_id, match) => {
      const { scoring_rule } = rankingOf(match.competition_id);
      expect(match.points).toEqual(matchPoints(match.result, match.format, scoring_rule));
    },
  );

  it('todo placar lançado é válido para o formato da partida (R29)', () => {
    const scored = mockDomain.matches.flatMap((match) =>
      resultsOf(match).flatMap((result) => ('sets' in result ? [{ match, result }] : [])),
    );
    expect(scored.length).toBeGreaterThan(0);
    for (const { match, result } of scored) {
      expect(validateScore(result, match.format), match.id).toEqual({ valid: true });
    }
  });
});
