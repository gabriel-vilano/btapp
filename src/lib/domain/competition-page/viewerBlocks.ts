import { hasTournamentEnded } from '@/src/lib/tournamentDates';
import type { CompetitionPageData } from './types';

// Blocos da página que dependem de quem vê (docs/RANKING.md, RK17). Os de
// inscrição seguem a categoria (EXPLORE.md, EX26 e EX27) e a posição da
// decisão do Gabriel de 30/09: quem ainda não tem inscrição na competição vê
// "Como se inscrever" completo, no topo; quem já tem inscrição numa categoria
// e ainda tem categoria livre vê a versão compacta, abaixo das categorias. A
// entrada da área "Administrar" (NAV N31) é independente: o admin que não
// joga a competição vê os dois. O torneio que já aconteceu não tem mais em que
// se inscrever, pelo mesmo motivo que o tira da vitrine (EX8, EX34).

/** Forma do "Como se inscrever": completo no topo, compacto abaixo das categorias, ou nenhum. */
export type EnrollmentBlockPlacement = 'full' | 'compact' | null;

export interface CompetitionPageBlocks {
  enrollment: EnrollmentBlockPlacement;
  interest: boolean; // "Tenho interesse" (EX27)
  admin: boolean; // entrada da área "Administrar"
}

/** Inscrito em alguma categoria da competição. A N28 usa para escolher a aba de chegada. */
export function isEnrolledInCompetition(data: CompetitionPageData): boolean {
  return data.categories.some((category) => category.standing !== null);
}

/** Há categoria em que quem vê não tem inscrição (EX26): ainda pode se inscrever nela. */
function hasOpenCategory(data: CompetitionPageData): boolean {
  return data.categories.some((category) => category.standing === null);
}

function enrollmentPlacement(data: CompetitionPageData, now: string): EnrollmentBlockPlacement {
  if (data.type === 'tournament' && hasTournamentEnded(data.ends_on, now)) return null;
  if (!hasOpenCategory(data)) return null;
  return isEnrolledInCompetition(data) ? 'compact' : 'full';
}

/**
 * Quais blocos de quem vê a página mostra.
 * Ex.: `competitionPageBlocks(mockCompetitionPage.notEnrolled, now)` → `{ enrollment: 'full', interest: true, admin: false }`.
 */
export function competitionPageBlocks(data: CompetitionPageData, now: string): CompetitionPageBlocks {
  const enrollment = enrollmentPlacement(data, now);
  // O interesse é por competição (EX31): depois da primeira inscrição, o botão some
  return { enrollment, interest: enrollment === 'full', admin: data.viewer.is_admin };
}
