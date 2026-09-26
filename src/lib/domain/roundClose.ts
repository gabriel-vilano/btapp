import type { Round, SeasonFinal, StandingSnapshot } from '@/src/types/domain';
import { computeStandings, type StandingRow } from './standings';
import type { StandingsScope } from './standingsStats';

// Fechamento da rodada (R46) e linha de corte da final (R27, R28). As duas
// congelam a classificação num momento: o prazo da rodada e a data de corte.

/**
 * Foto da classificação no fechamento da rodada (R46): a posição de cada
 * inscrição com o que estava confirmado até o prazo. A rodada fecha no prazo,
 * sem esperar a fila do admin; o que ele decidir depois entra na foto da
 * rodada seguinte. É a base do evento "subiu N" e da evolução na temporada.
 * Ex.: `closeRound(rounds.second, { season_id, category_id, ...mockDomain })`.
 */
export function closeRound(round: Round, scope: StandingsScope): StandingSnapshot[] {
  if (round.season_id !== scope.season_id) {
    throw new Error(`Rodada '${round.id}' é da temporada '${round.season_id}', esperado '${scope.season_id}'`);
  }
  return computeStandings(scope, round.deadline).map((row) => ({
    round_id: round.id,
    category_id: scope.category_id,
    enrollment_id: row.enrollment_id,
    position: row.position,
    points: row.points,
  }));
}

/** Quem está acima da linha de corte da final. */
export interface FinalCutoff {
  qualified_ids: string[]; // na ordem da classificação
  // Empate sem desempate atravessando a linha: a última vaga espera o admin (R37)
  awaiting_admin: boolean;
}

function fullyTied(x: StandingRow, y: StandingRow): boolean {
  return x.awaiting_admin && y.awaiting_admin && x.points === y.points &&
    x.wins === y.wins && x.games_balance === y.games_balance;
}

/**
 * Linha de corte sobre uma classificação: as `qualifiers` primeiras inscrições
 * ativas. A encerrada não tem direito à vaga, que passa para a próxima (R28,
 * R45). Serve à tela de ranking durante a temporada (R23) e ao corte da final.
 */
export function cutoffLine(rows: StandingRow[], qualifiers: number): FinalCutoff {
  const active = rows.filter((row) => row.enrollment_status === 'active');
  const inside = active.slice(0, qualifiers);
  const lastIn = inside.at(-1);
  const firstOut = active[qualifiers];
  const straddles = lastIn !== undefined && firstOut !== undefined && fullyTied(lastIn, firstOut);
  return { qualified_ids: inside.map((row) => row.enrollment_id), awaiting_admin: straddles };
}

/**
 * Classificados para a final: a posição na data de corte define a vaga (R28),
 * nunca a garantia matemática. Ex.: `finalQualifiers(season.final, scope)`.
 */
export function finalQualifiers(final: SeasonFinal, scope: StandingsScope): FinalCutoff {
  return cutoffLine(computeStandings(scope, final.cutoff_date), final.qualifiers);
}
