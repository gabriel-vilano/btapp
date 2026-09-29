import type { Round, StandingSnapshot } from '@/src/types/domain';
import { computeStandings } from '../standings';
import { confirmedAt, countedMatches, type StandingsScope } from '../standingsStats';

// Delta da tabela de classificação (docs/RANKING.md, RK12). Compara a posição
// ao vivo com a foto de fim de rodada (R46), e a base só avança quando a
// tabela volta a se mexer.

function seasonRounds(scope: StandingsScope): Round[] {
  return scope.rounds.filter((round) => round.season_id === scope.season_id).sort((x, y) => x.number - y.number);
}

/**
 * Rodada cuja foto é a base do delta em `asOf`, ou null quando não há delta.
 * Com N a última rodada fechada: até a tabela mudar depois do fechamento, a
 * base é a N−1, e a tabela mostra o mesmo delta do card de fechamento; depois,
 * a base é a N.
 *
 * "Mudar" é qualquer partida confirmada depois do prazo de N, inclusive a
 * decisão tardia do admin numa partida de N: ela entra na foto da N+1 (R46) e
 * mexe na tabela ao vivo como um resultado da N+1. A spec troca a base no
 * primeiro resultado porque, antes dele, a tabela não muda (RK12).
 * Ex.: `deltaBaseRound(scope, new Date().toISOString())`.
 */
export function deltaBaseRound(scope: StandingsScope, asOf: string): Round | null {
  const closed = seasonRounds(scope).filter((round) => Date.parse(round.deadline) <= Date.parse(asOf));
  const last = closed.at(-1);
  if (last === undefined) return null;
  const movedSinceClose = countedMatches(scope, asOf).some(
    (match) => Date.parse(confirmedAt(match.confirmation)) > Date.parse(last.deadline),
  );
  if (movedSinceClose) return last;
  return closed.at(-2) ?? null;
}

/**
 * Delta de cada linha em `asOf`, por `enrollment_id`: positivo subiu, negativo
 * caiu. Ficam de fora a posição igual (a tabela não mostra traço) e a
 * inscrição que não estava na foto base (nova ou troca de parceiro).
 * `snapshots` são as fotos guardadas no fechamento de cada rodada.
 * Ex.: `positionDeltas(scope, mockDomain.standingSnapshots, asOf).get(id)`.
 */
export function positionDeltas(scope: StandingsScope, snapshots: StandingSnapshot[], asOf: string): Map<string, number> {
  const base = deltaBaseRound(scope, asOf);
  const deltas = new Map<string, number>();
  if (base === null) return deltas;
  const basePosition = new Map(
    snapshots
      .filter((s) => s.round_id === base.id && s.category_id === scope.category_id)
      .map((s) => [s.enrollment_id, s.position]),
  );
  for (const row of computeStandings(scope, asOf)) {
    const from = basePosition.get(row.enrollment_id);
    if (from !== undefined && from !== row.position) deltas.set(row.enrollment_id, from - row.position);
  }
  return deltas;
}
