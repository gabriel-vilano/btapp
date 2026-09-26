import {
  DEFAULT_TOP_N,
  type Enrollment,
  type Milestone,
  type Round,
  type StandingSnapshot,
} from '@/src/types/domain';
import { masculinoB as mb, mistaC40 as mx, rankingCategories, rounds, season } from './ranking';

// Foto da classificação no fechamento das rodadas 1 e 2 (R46). Os pontos são
// a soma das partidas confirmadas até o prazo de cada rodada, conferida pelo
// teste de integridade. Não há empate, para o desempate (R37) ficar fora.

function photo(round: Round, categoryId: string, ordered: [Enrollment, number][]): StandingSnapshot[] {
  return ordered.map(([enrollment, points], index) => ({
    round_id: round.id,
    category_id: categoryId,
    enrollment_id: enrollment.id,
    position: index + 1,
    points,
  }));
}

const MB = rankingCategories.masculinoB.id;
const MX = rankingCategories.mistaC40.id;

export const standingSnapshots: StandingSnapshot[] = [
  ...photo(rounds.first, MB, [[mb.t1, 212], [mb.t5, 208], [mb.t3, 206], [mb.t2, 90], [mb.t6, 88], [mb.t4, 46]]),
  // T3 subiu 2; T1 e T5 caíram 1 (eventos em `feedEvents.ts`)
  ...photo(rounds.second, MB, [[mb.t3, 418], [mb.t1, 364], [mb.t5, 294], [mb.t2, 202], [mb.t6, 126], [mb.t4, 46]]),
  ...photo(rounds.first, MX, [[mx.m3, 212], [mx.m1, 210], [mx.m2, 90], [mx.m4, 88]]),
  // A M4, encerrada, continua na tabela com os pontos congelados (R45)
  ...photo(rounds.second, MX, [[mx.m3, 426], [mx.m1, 362], [mx.m2, 182], [mx.m5, 142], [mx.m4, 88]]),
];

function milestone(
  enrollment: Enrollment,
  round: Round,
  type: Milestone['type'],
): Milestone {
  const base = {
    id: `milestone-${type}-${enrollment.id.replace('enr-', '')}`,
    enrollment_id: enrollment.id,
    season_id: season.id,
    round_id: round.id,
    achieved_at: round.deadline, // sai no fechamento da rodada
  };
  // Top N com N = classificados da final (R47)
  return type === 'leader' ? { ...base, type } : { ...base, type, n: season.final?.qualifiers ?? DEFAULT_TOP_N };
}

// Primeira vez de cada inscrição como Líder e no Top 4 da temporada. Quem
// estreia nos dois na mesma rodada ganha os dois marcos, mas um evento só, o
// de Líder (R47).
export const milestones: Milestone[] = [
  milestone(mb.t1, rounds.first, 'leader'),
  milestone(mb.t1, rounds.first, 'top_n'),
  milestone(mb.t5, rounds.first, 'top_n'),
  milestone(mb.t3, rounds.first, 'top_n'),
  milestone(mb.t2, rounds.first, 'top_n'),
  milestone(mb.t3, rounds.second, 'leader'),
  milestone(mx.m3, rounds.first, 'leader'),
  milestone(mx.m3, rounds.first, 'top_n'),
  milestone(mx.m1, rounds.first, 'top_n'),
  milestone(mx.m2, rounds.first, 'top_n'),
  milestone(mx.m4, rounds.first, 'top_n'),
  milestone(mx.m5, rounds.second, 'top_n'),
];
