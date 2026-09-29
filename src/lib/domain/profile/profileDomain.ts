import type {
  CompetitorUnit,
  Enrollment,
  Milestone,
  Round,
  Season,
  StandingSnapshot,
} from '@/src/types/domain';
import { hasPlayer, type MatchCountDomain } from '../match-count/playedMatch';
import type { StandingsScope } from '../standingsStats';

// De onde as derivações do perfil saem (docs/PROFILE.md): as tabelas do
// domínio, no formato em que o Supabase as devolve. O `mockDomain` e o
// `mockProfileDomain` satisfazem esse contrato.

/** Tabelas que o perfil lê. */
export interface ProfileDomain extends MatchCountDomain {
  seasons: Season[];
  rounds: Round[];
  standingSnapshots: StandingSnapshot[]; // fotos de fim de rodada (R46)
  milestones: Milestone[]; // marcos já concedidos, nunca revogados (R25)
}

/** Inscrição de ranking: a do torneio não tem temporada nem classificação. */
export type SeasonEnrollment = Enrollment & { season_id: string };

/** Inscrições de ranking de qualquer unidade em que o jogador está (simples ou duplas). */
export function playerSeasonEnrollments(domain: ProfileDomain, playerId: string): SeasonEnrollment[] {
  const unitIds = new Set(domain.units.filter((unit) => hasPlayer(unit, playerId)).map((unit) => unit.id));
  return domain.enrollments.filter(
    (enrollment): enrollment is SeasonEnrollment => enrollment.season_id !== null && unitIds.has(enrollment.unit_id),
  );
}

/** O parceiro do jogador na unidade. Em simples, null. */
export function partnerOf(unit: CompetitorUnit, playerId: string): string | null {
  if (unit.modality === 'singles') return null;
  return unit.player_ids.find((id) => id !== playerId) ?? null;
}

export function unitOf(domain: ProfileDomain, enrollment: Enrollment): CompetitorUnit {
  const unit = domain.units.find((candidate) => candidate.id === enrollment.unit_id);
  if (unit === undefined) {
    throw new Error(`Perfil: unidade '${enrollment.unit_id}' da inscrição '${enrollment.id}' não existe nas tabelas`);
  }
  return unit;
}

export function seasonOf(domain: ProfileDomain, enrollment: SeasonEnrollment): Season {
  const season = domain.seasons.find((candidate) => candidate.id === enrollment.season_id);
  if (season === undefined) {
    throw new Error(`Perfil: temporada '${enrollment.season_id}' da inscrição '${enrollment.id}' não existe nas tabelas`);
  }
  return season;
}

/** A temporada terminou: `now` passou do `ends_on`. */
export function hasSeasonEnded(season: Season, now: string): boolean {
  return Date.parse(now) > Date.parse(season.ends_on);
}

/** A categoria da inscrição na temporada dela, pronta para `computeStandings`. */
export function scopeOf(domain: ProfileDomain, enrollment: SeasonEnrollment): StandingsScope {
  return { season_id: enrollment.season_id, category_id: enrollment.category_id, ...domain };
}
