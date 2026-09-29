import type { Milestone, Season } from '@/src/types/domain';
import { certainQualifiers } from '../feed-events/finalQualification';
import { computeStandings } from '../standings';
import { livePosition } from './rankings';
import {
  hasSeasonEnded,
  partnerOf,
  playerSeasonEnrollments,
  scopeOf,
  seasonOf,
  unitOf,
  type ProfileDomain,
  type SeasonEnrollment,
} from './profileDomain';

// Seção "Temporadas" do perfil (docs/PROFILE.md, PF19): o que o jogador fez
// em cada temporada encerrada. É a evolução que pode ser pública: a posição
// final é a da tabela da temporada, e marcos e classificação já saíram no
// feed (R20, R24).

/** Marco da linha: "★ Líder" ou "★ Top N" (R47). */
export type SeasonMilestone = { type: 'leader' } | { type: 'top_n'; n: number };

/** Uma linha de "Temporadas". Os nomes (temporada, competição, categoria) são da tela. */
export interface ProfileSeasonRow {
  enrollment_id: string;
  season_id: string;
  competition_id: string;
  category_id: string;
  partner_id: string | null; // em simples, null
  final_position: number | null; // null só se a categoria terminou sem jogo confirmado
  milestones: SeasonMilestone[]; // Líder antes de Top N
  final_name: string | null; // "★ Saideira": nome da final em que a dupla se classificou
}

const MILESTONE_ORDER: Record<Milestone['type'], number> = { leader: 0, top_n: 1 };

function milestonesOf(milestones: Milestone[], enrollmentId: string): SeasonMilestone[] {
  return milestones
    .filter((milestone) => milestone.enrollment_id === enrollmentId)
    .sort((x, y) => MILESTONE_ORDER[x.type] - MILESTONE_ORDER[y.type])
    .map((milestone) => (milestone.type === 'leader' ? { type: 'leader' } : { type: 'top_n', n: milestone.n }));
}

/**
 * Nome da final, se a inscrição ficou entre os classificados na data de
 * corte (R28). Empate que atravessa a linha e espera o admin não conta, como
 * no evento do feed: o perfil não afirma o que o feed não afirmou.
 */
function qualifiedFinal(domain: ProfileDomain, enrollment: SeasonEnrollment, season: Season): string | null {
  const final = season.final;
  if (final === null) return null;
  const rows = computeStandings(scopeOf(domain, enrollment), final.cutoff_date);
  return certainQualifiers(rows, final.qualifiers).includes(enrollment.id) ? final.name : null;
}

function toRow(domain: ProfileDomain, enrollment: SeasonEnrollment, playerId: string): ProfileSeasonRow {
  const season = seasonOf(domain, enrollment);
  return {
    enrollment_id: enrollment.id,
    season_id: season.id,
    competition_id: season.ranking_id,
    category_id: enrollment.category_id,
    partner_id: partnerOf(unitOf(domain, enrollment), playerId),
    final_position: livePosition(domain, enrollment), // depois do fim, a ao vivo é a final
    milestones: milestonesOf(domain.milestones, enrollment.id),
    final_name: qualifiedFinal(domain, enrollment, season),
  };
}

/**
 * Linhas de "Temporadas": uma por inscrição do jogador em temporada
 * encerrada, inclusive a encerrada por troca de parceiro, com a posição
 * congelada (PF15, R45). Mais recente primeiro.
 * Ex.: `profileSeasons(mockProfileDomain, players.lucas.id, new Date().toISOString())`.
 */
export function profileSeasons(domain: ProfileDomain, playerId: string, now: string): ProfileSeasonRow[] {
  const endsOn = (enrollment: SeasonEnrollment) => Date.parse(seasonOf(domain, enrollment).ends_on);
  return playerSeasonEnrollments(domain, playerId)
    .filter((enrollment) => hasSeasonEnded(seasonOf(domain, enrollment), now))
    .sort((x, y) => endsOn(y) - endsOn(x) || x.id.localeCompare(y.id))
    .map((enrollment) => toRow(domain, enrollment, playerId));
}
