import { isPlayedMatch } from '../match-count';
import { countedMatches, sideOf, winnerOf, type StandingsScope } from '../standingsStats';

// Jogos e vitórias da linha da classificação (docs/RANKING.md, RK8). A mesma
// definição de "jogo" do `total_matches` (R18) e do cartel do perfil (PF6),
// com o recorte da inscrição na temporada.

/** "6 jogos · 5 vitórias". */
export interface LineRecord {
  played: number;
  wins: number; // nunca passa de `played`
}

/**
 * Jogos e vitórias de cada inscrição da categoria na temporada, por
 * `enrollment_id`. Jogo é a partida confirmada em que houve jogo (normal ou
 * desistência): W.O., W.O. duplo e canceladas ficam fora das duas contagens.
 * Diferente do desempate da R37, que conta o W.O. vencido como vitória.
 * Ex.: `lineRecords(scope).get(enrollmentId)`.
 */
export function lineRecords(scope: StandingsScope, asOf?: string): Map<string, LineRecord> {
  const records = new Map<string, LineRecord>(
    scope.enrollments
      .filter((e) => e.category_id === scope.category_id && e.season_id === scope.season_id)
      .map((e) => [e.id, { played: 0, wins: 0 }]),
  );
  for (const match of countedMatches(scope, asOf).filter(isPlayedMatch)) {
    for (const [enrollmentId, record] of records) {
      const side = sideOf(match, enrollmentId);
      if (side === null) continue;
      record.played += 1;
      if (winnerOf(match) === side) record.wins += 1;
    }
  }
  return records;
}
