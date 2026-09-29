import type {
  CompetitorUnit,
  Enrollment,
  Friendship,
  Match,
  Milestone,
  Round,
  Season,
  StandingSnapshot,
} from '@/src/types/domain';

// De onde os eventos do feed saem: as tabelas do domínio, no formato em que o
// Supabase as devolve. O `mockDomain` satisfaz esse contrato.

/** Tabelas que a geração de eventos lê. */
export interface FeedDomain {
  units: CompetitorUnit[];
  enrollments: Enrollment[];
  matches: Match[];
  friendships: Friendship[];
  seasons: Season[];
  rounds: Round[];
  // Guardadas no fechamento de cada rodada (R46) e nunca recalculadas: uma
  // correção de placar posterior não reescreve a foto de uma rodada fechada
  standingSnapshots: StandingSnapshot[];
  // Marcos já concedidos. Só crescem: nenhum é revogado (R25)
  milestones: Milestone[];
}

/** Quem são os jogadores de cada inscrição e de cada partida. */
export interface ActorLookup {
  ofUnit: (unitId: string) => string[];
  ofEnrollment: (enrollmentId: string) => string[];
  ofMatch: (match: Match) => string[];
}

function lookup<T extends { id: string }>(items: T[], what: string): (id: string) => T {
  const byId = new Map(items.map((item) => [item.id, item]));
  return (id) => {
    const found = byId.get(id);
    if (found === undefined) throw new Error(`Evento do feed: ${what} '${id}' não existe nas tabelas do domínio`);
    return found;
  };
}

/**
 * Resolve os atores de um evento: numa unidade de duplas, os dois jogadores,
 * que também são o público do evento privado (R22).
 * Ex.: `actorLookup(mockDomain).ofEnrollment('enr-arena-rm-lucas-rafael')`.
 */
export function actorLookup(domain: Pick<FeedDomain, 'units' | 'enrollments'>): ActorLookup {
  const unit = lookup(domain.units, 'unidade');
  const enrollment = lookup(domain.enrollments, 'inscrição');
  const ofUnit = (unitId: string) => [...unit(unitId).player_ids];
  const ofEnrollment = (enrollmentId: string) => ofUnit(enrollment(enrollmentId).unit_id);
  const ofMatch = (match: Match) =>
    match.kind === 'friendly'
      ? [...ofUnit(match.side_a_unit_id), ...ofUnit(match.side_b_unit_id)]
      : [...ofEnrollment(match.side_a_enrollment_id), ...ofEnrollment(match.side_b_enrollment_id)];
  return { ofUnit, ofEnrollment, ofMatch };
}
