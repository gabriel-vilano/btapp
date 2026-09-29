import { describe, expect, it } from 'vitest';
import type { RankingMatch, TournamentMatch } from '@/src/types/domain';
import {
  annulResult,
  arbitrateRankingResult,
  cancelNotPlayed,
  correctResult,
  decideNotPlayed,
  reportTournamentResult,
} from './adminTransitions';
import {
  confirmRankingByDeadline,
  confirmRankingResult,
  contestRankingResult,
  markRankingNotPlayed,
  reportRankingResult,
  undoRankingReport,
} from './rankingTransitions';
import {
  ADMIN_CONTEXT,
  AFTER_ROUND_DEADLINE,
  CONTEST,
  PLAYER,
  RANKING_CONTEXT,
  RANKING_STATUSES,
  WIN_A,
  WIN_B,
  act,
  definedTournamentMatch,
  expectRefusal,
  rankingMatchIn,
} from './matchState.test-utils';

// O diagrama da §3 do docs/DOMAIN.md como tabela: cada ação parte de um único
// estado e é recusada em todos os outros. Os argumentos de cada ação são
// válidos, então a única razão da recusa é o estado.

type RankingStatus = RankingMatch['status'];

const LATE = '2026-09-30T12:00:00.000Z'; // depois dos prazos de resposta e da rodada
const admin = act(PLAYER.admin, LATE);

const rankingActions: { name: string; from: RankingStatus; to: RankingStatus; run: (m: RankingMatch) => RankingMatch }[] = [
  { name: 'jogador lança', from: 'defined', to: 'awaiting_confirmation', run: (m) => reportRankingResult(m, WIN_A, act(PLAYER.a1), RANKING_CONTEXT) },
  { name: 'prazo da rodada passa', from: 'defined', to: 'not_played', run: (m) => markRankingNotPlayed(m, AFTER_ROUND_DEADLINE, RANKING_CONTEXT) },
  { name: 'adversário confirma', from: 'awaiting_confirmation', to: 'confirmed', run: (m) => confirmRankingResult(m, act(PLAYER.b1), RANKING_CONTEXT) },
  { name: 'prazo de resposta passa', from: 'awaiting_confirmation', to: 'confirmed', run: (m) => confirmRankingByDeadline(m, LATE, RANKING_CONTEXT) },
  { name: 'quem lançou desfaz', from: 'awaiting_confirmation', to: 'defined', run: (m) => undoRankingReport(m, act(PLAYER.a1), RANKING_CONTEXT) },
  { name: 'adversário contesta', from: 'awaiting_confirmation', to: 'in_arbitration', run: (m) => contestRankingResult(m, CONTEST, act(PLAYER.b1), RANKING_CONTEXT) },
  { name: 'admin arbitra', from: 'in_arbitration', to: 'confirmed', run: (m) => arbitrateRankingResult(m, WIN_B, admin, ADMIN_CONTEXT) },
  { name: 'admin aplica W.O.', from: 'not_played', to: 'confirmed', run: (m) => decideNotPlayed(m, { type: 'wo', winner: 'a' }, admin, ADMIN_CONTEXT) },
  { name: 'admin cancela', from: 'not_played', to: 'cancelled', run: (m) => cancelNotPlayed(m, admin, ADMIN_CONTEXT) },
  { name: 'admin corrige', from: 'confirmed', to: 'confirmed', run: (m) => correctResult(m, WIN_B, admin, ADMIN_CONTEXT) },
  { name: 'admin anula', from: 'confirmed', to: 'cancelled', run: (m) => annulResult(m, admin, ADMIN_CONTEXT) },
];

describe('máquina de estados da partida de ranking', () => {
  describe.each(rankingActions)('$name', ({ from, to, run }) => {
    it(`${from} → ${to}`, () => {
      expect(run(rankingMatchIn(from)).status).toBe(to);
    });

    it.each(RANKING_STATUSES.filter((status) => status !== from))('recusada em %s', (status) => {
      expectRefusal(() => run(rankingMatchIn(status)), 'invalid_status');
    });
  });
});

function tournamentMatchIn(status: TournamentMatch['status']): TournamentMatch {
  const confirmed = reportTournamentResult(definedTournamentMatch(), WIN_A, admin, ADMIN_CONTEXT);
  if (status === 'defined') return definedTournamentMatch();
  if (status === 'confirmed') return confirmed;
  return annulResult(confirmed, admin, ADMIN_CONTEXT);
}

const TOURNAMENT_STATUSES: TournamentMatch['status'][] = ['defined', 'confirmed', 'cancelled'];

const tournamentActions: {
  name: string;
  from: TournamentMatch['status'];
  run: (m: TournamentMatch) => TournamentMatch;
}[] = [
  { name: 'admin lança', from: 'defined', run: (m) => reportTournamentResult(m, WIN_A, admin, ADMIN_CONTEXT) },
  { name: 'admin corrige', from: 'confirmed', run: (m) => correctResult(m, WIN_B, admin, ADMIN_CONTEXT) },
  { name: 'admin anula', from: 'confirmed', run: (m) => annulResult(m, admin, ADMIN_CONTEXT) },
];

describe('máquina de estados da partida de torneio (R38)', () => {
  describe.each(tournamentActions)('$name', ({ from, run }) => {
    it.each(TOURNAMENT_STATUSES.filter((status) => status !== from))('recusada em %s', (status) => {
      expectRefusal(() => run(tournamentMatchIn(status)), 'invalid_status');
    });
  });
});
