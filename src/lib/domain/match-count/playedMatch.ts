import type {
  CompetitionResult,
  CompetitorUnit,
  Enrollment,
  Match,
  MatchSideKey,
} from '@/src/types/domain';

// O que é "uma partida jogada" para as contagens do jogador: `total_matches`
// (R18) e H2H (R19). As duas regras concordam: só a partida confirmada conta,
// e o W.O. não, porque não houve jogo. Amistoso, torneio e ranking entram
// igual; a desistência entra, porque houve jogo.

/** Tabelas de onde as contagens saem. O `mockDomain` satisfaz esse contrato. */
export interface MatchCountDomain {
  units: CompetitorUnit[];
  enrollments: Enrollment[];
  matches: Match[];
}

/** Partida confirmada, de qualquer tipo (ranking, torneio ou amistoso). */
export type ConfirmedMatch = Extract<Match, { status: 'confirmed' }>;

/** Houve jogo: resultado normal ou desistência. W.O. e W.O. duplo não (R18, R19). */
export function isPlayedResult(result: CompetitionResult): boolean {
  return result.type === 'normal' || result.type === 'retired';
}

/** Resultado que vale na partida confirmada. No amistoso, é o lançado (R43). */
export function resultOf(match: ConfirmedMatch): CompetitionResult {
  return match.kind === 'friendly' ? match.report.result : match.result;
}

/** Partida confirmada em que houve jogo: a que entra no `total_matches` e no H2H. */
export function isPlayedMatch(match: Match): match is ConfirmedMatch {
  return match.status === 'confirmed' && isPlayedResult(resultOf(match));
}

function indexById<T extends { id: string }>(items: T[], what: string): (id: string) => T {
  const byId = new Map(items.map((item) => [item.id, item]));
  return (id) => {
    const found = byId.get(id);
    if (found === undefined) throw new Error(`Contagem de partidas: ${what} '${id}' não existe nas tabelas do domínio`);
    return found;
  };
}

/** A unidade (jogador ou dupla) de cada lado da partida. */
export type SideUnits = Record<MatchSideKey, CompetitorUnit>;

/**
 * Resolve a unidade de cada lado: no amistoso o lado aponta direto para ela;
 * na competição, passa pela inscrição.
 * Ex.: `sideUnitsResolver(mockDomain)(match).a.player_ids`.
 */
export function sideUnitsResolver(domain: Omit<MatchCountDomain, 'matches'>): (match: Match) => SideUnits {
  const unit = indexById(domain.units, 'unidade');
  const enrollment = indexById(domain.enrollments, 'inscrição');
  return (match) =>
    match.kind === 'friendly'
      ? { a: unit(match.side_a_unit_id), b: unit(match.side_b_unit_id) }
      : {
          a: unit(enrollment(match.side_a_enrollment_id).unit_id),
          b: unit(enrollment(match.side_b_enrollment_id).unit_id),
        };
}

/** O jogador está na unidade (em simples, é o único membro; em duplas, um dos dois). */
export function hasPlayer(unit: CompetitorUnit, playerId: string): boolean {
  return unit.player_ids.some((id) => id === playerId);
}
