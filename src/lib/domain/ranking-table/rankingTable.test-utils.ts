import type { Enrollment, RankingMatch, Round } from '@/src/types/domain';
import { SEASON_ID, testRounds, testScope } from '../standings.test-utils';
import type { StandingsScope } from '../standingsStats';

// Temporada de três rodadas para os testes da tabela: o delta precisa de uma
// rodada N−1, uma N fechada e uma N+1 em curso (RK12).

export const thirdRound: Round = {
  id: 'round-test-3',
  season_id: SEASON_ID,
  number: 3,
  starts_at: '2026-02-12T00:00:00Z',
  deadline: '2026-03-04T23:59:00Z',
};

export function threeRoundScope(enrollments: Enrollment[], matches: RankingMatch[]): StandingsScope {
  return { ...testScope(enrollments, matches), rounds: [testRounds.first, testRounds.second, thirdRound] };
}

/** A partida confirmada anulada pelo admin (R41): sai de todas as contagens. */
export function annulled(match: RankingMatch): RankingMatch {
  return {
    ...match,
    status: 'cancelled',
    reason: 'annulled',
    cancellation: { admin_id: 'player-admin', acted_at: '2026-01-15T00:00:00Z' },
  };
}
