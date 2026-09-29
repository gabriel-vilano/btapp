import type { CompetitorUnit, MatchSideKey } from '@/src/types/domain';
import {
  hasPlayer,
  isPlayedMatch,
  resultOf,
  sideUnitsResolver,
  type ConfirmedMatch,
  type MatchCountDomain,
  type SideUnits,
} from './playedMatch';

// H2H (R19): histórico de confrontos entre dois lados, amistoso incluído.
// No card, entre as duplas exatas; na página, jogador × jogador. W.O. e
// W.O. duplo não contam nos dois casos (`isPlayedMatch`).

/** Confrontos do ponto de vista do primeiro lado pedido. */
export interface HeadToHeadRecord {
  match_ids: string[]; // na ordem das partidas recebidas
  wins: number;
  losses: number;
}

type UnitFilter = (unit: CompetitorUnit) => boolean;

function sideWhere(sides: SideUnits, filter: UnitFilter): MatchSideKey | null {
  if (filter(sides.a)) return 'a';
  if (filter(sides.b)) return 'b';
  return null;
}

function addConfrontation(record: HeadToHeadRecord, match: ConfirmedMatch, side: MatchSideKey): void {
  const result = resultOf(match);
  record.match_ids.push(match.id);
  // Toda partida jogada tem vencedor: só o W.O. duplo não tem, e ele não conta
  if (result.type === 'double_wo') return;
  if (result.winner === side) record.wins += 1;
  else record.losses += 1;
}

/** Partidas jogadas com `x` num lado e `y` no outro. Do mesmo lado não é confronto. */
function confrontations(domain: MatchCountDomain, x: UnitFilter, y: UnitFilter): HeadToHeadRecord {
  const sidesOf = sideUnitsResolver(domain);
  const record: HeadToHeadRecord = { match_ids: [], wins: 0, losses: 0 };
  for (const match of domain.matches.filter(isPlayedMatch)) {
    const sides = sidesOf(match);
    const [xSide, ySide] = [sideWhere(sides, x), sideWhere(sides, y)];
    if (xSide !== null && ySide !== null && xSide !== ySide) addConfrontation(record, match, xSide);
  }
  return record;
}

function assertDistinct(x: string, y: string, what: string): void {
  if (x === y) throw new Error(`H2H: recebi o mesmo ${what} '${x}' nos dois lados, esperado dois ${what}s diferentes`);
}

/**
 * H2H do card (R19): as duas unidades exatas, em simples ou duplas. A mesma
 * dupla é a mesma unidade em qualquer competição e no amistoso (R2).
 * Ex.: `unitHeadToHead(mockDomain, units.lucasRafael.id, units.pedroThiago.id)`.
 */
export function unitHeadToHead(domain: MatchCountDomain, unitXId: string, unitYId: string): HeadToHeadRecord {
  assertDistinct(unitXId, unitYId, 'unidade');
  return confrontations(domain, (unit) => unit.id === unitXId, (unit) => unit.id === unitYId);
}

/**
 * H2H da página (R19): jogador × jogador, com qualquer parceiro, em simples e
 * duplas. Quando os dois jogaram juntos, do mesmo lado, não é confronto.
 * Ex.: `playerHeadToHead(mockDomain, players.lucas.id, players.thiago.id)`.
 */
export function playerHeadToHead(domain: MatchCountDomain, playerXId: string, playerYId: string): HeadToHeadRecord {
  assertDistinct(playerXId, playerYId, 'jogador');
  return confrontations(domain, (unit) => hasPlayer(unit, playerXId), (unit) => hasPlayer(unit, playerYId));
}
