import type { MatchSideKey } from '@/src/types/domain';
import {
  hasPlayer,
  isPlayedMatch,
  resultOf,
  sideUnitsResolver,
  type ConfirmedMatch,
  type MatchCountDomain,
  type SideUnits,
} from '../match-count/playedMatch';

// Cartel do perfil (docs/PROFILE.md, PF6): a mesma conta da linha da
// classificação (RANKING.md, RK8), com o recorte da carreira. Jogo é a
// partida confirmada em que houve jogo (`isPlayedMatch`, R18); W.O., W.O.
// duplo e canceladas ficam fora. Assim, vitórias + derrotas = jogos.

/** Cartel de carreira do jogador. */
export interface PlayerRecord {
  matches: number; // igual ao `countTotalMatches` (R18)
  wins: number;
  losses: number;
}

function playerSide(sides: SideUnits, playerId: string): MatchSideKey | null {
  if (hasPlayer(sides.a, playerId)) return 'a';
  if (hasPlayer(sides.b, playerId)) return 'b';
  return null;
}

function isWinner(match: ConfirmedMatch, side: MatchSideKey): boolean {
  const result = resultOf(match);
  // Partida jogada sempre tem vencedor: só o W.O. duplo não tem, e ele não conta
  return result.type !== 'double_wo' && result.winner === side;
}

/**
 * Cartel do jogador em todas as partidas confirmadas com jogo: ranking,
 * torneio e amistoso, simples e duplas. A desistência conta, para os dois lados.
 * Ex.: `playerRecord(mockDomain, players.lucas.id)` → `{ matches: 7, wins: 6, losses: 1 }`.
 */
export function playerRecord(domain: MatchCountDomain, playerId: string): PlayerRecord {
  const sidesOf = sideUnitsResolver(domain);
  const record: PlayerRecord = { matches: 0, wins: 0, losses: 0 };
  for (const match of domain.matches.filter(isPlayedMatch)) {
    const side = playerSide(sidesOf(match), playerId);
    if (side === null) continue;
    record.matches += 1;
    if (isWinner(match, side)) record.wins += 1;
    else record.losses += 1;
  }
  return record;
}
