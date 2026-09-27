import { hasPlayer, isPlayedMatch, sideUnitsResolver, type MatchCountDomain } from './playedMatch';

/**
 * `total_matches` do jogador (R18): toda partida confirmada em que ele jogou,
 * em simples e duplas, no ranking, no torneio e no amistoso, exceto W.O. e
 * W.O. duplo. A desistência conta.
 *
 * Conta só as partidas das tabelas recebidas. O `Player.total_matches` dos
 * mocks inclui o histórico do app legado, então é maior que esta contagem.
 * Ex.: `countTotalMatches(mockDomain, players.lucas.id)`.
 */
export function countTotalMatches(domain: MatchCountDomain, playerId: string): number {
  const sidesOf = sideUnitsResolver(domain);
  return domain.matches.filter((match) => {
    if (!isPlayedMatch(match)) return false;
    const sides = sidesOf(match);
    return hasPlayer(sides.a, playerId) || hasPlayer(sides.b, playerId);
  }).length;
}
