import type {
  RankingDownEvent,
  RankingUpEvent,
  Round,
  StandingSnapshot,
} from '@/src/types/domain';
import type { ActorLookup } from './feedDomain';

// Movimentação no ranking por rodada (R22, R24, R46). A tabela muda a cada
// confirmação, mas o evento compara só as fotos de fechamento: a do fim da
// rodada com a do fim da anterior. Assim o feed não vira um "subiu, caiu,
// subiu" a cada partida.

export type RankingMovementEvent = RankingUpEvent | RankingDownEvent;

function previousRound(round: Round, rounds: Round[]): Round | undefined {
  return rounds.find((other) => other.season_id === round.season_id && other.number === round.number - 1);
}

function positionIn(snapshots: StandingSnapshot[], roundId: string, enrollmentId: string): number | undefined {
  return snapshots.find((s) => s.round_id === roundId && s.enrollment_id === enrollmentId)?.position;
}

function movementEvent(
  snapshot: StandingSnapshot,
  round: Round,
  from: number,
  actors: ActorLookup,
): RankingMovementEvent {
  const movement = {
    id: `event-movement-${round.id}-${snapshot.enrollment_id}`,
    enrollment_id: snapshot.enrollment_id,
    round_id: round.id,
    from_position: from,
    to_position: snapshot.position,
    actor_ids: actors.ofEnrollment(snapshot.enrollment_id),
    created_at: round.deadline, // a foto sai no fechamento da rodada (R46)
  };
  // Posição menor é melhor: subiu é público; caiu, só a própria unidade vê (R22)
  return snapshot.position < from
    ? { ...movement, type: 'ranking_up', visibility: 'public' }
    : { ...movement, type: 'ranking_down', visibility: 'private' };
}

/**
 * Um evento por inscrição cuja posição mudou entre duas fotos consecutivas.
 * Variação zero não gera evento (R24). Quem não estava na foto anterior (a
 * 1ª rodada, ou uma inscrição nova no meio da temporada) também não: não há
 * de onde ter subido.
 */
export function movementEvents(
  snapshots: StandingSnapshot[],
  rounds: Round[],
  actors: ActorLookup,
): RankingMovementEvent[] {
  const roundById = new Map(rounds.map((round) => [round.id, round]));
  return snapshots.flatMap((snapshot) => {
    const round = roundById.get(snapshot.round_id);
    if (round === undefined) throw new Error(`Foto da classificação: rodada '${snapshot.round_id}' não existe`);
    const previous = previousRound(round, rounds);
    const from = previous && positionIn(snapshots, previous.id, snapshot.enrollment_id);
    if (from === undefined || from === snapshot.position) return [];
    return [movementEvent(snapshot, round, from, actors)];
  });
}
