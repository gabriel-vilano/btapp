import type { CompetitionPageData } from './types';

// Blocos que entram abaixo do cabeçalho conforme quem vê (docs/RANKING.md,
// RK17): "Como se inscrever" e "Tenho interesse" para quem não está inscrito
// (NAV N33) e a entrada da área "Administrar" para o admin (NAV N31). As duas
// condições são independentes: o admin que não joga a competição vê as duas.

export interface CompetitionPageBlocks {
  enrollment: boolean; // "Como se inscrever" e "Tenho interesse"
  admin: boolean; // entrada da área "Administrar"
}

/** Inscrito em alguma categoria da competição. */
export function isEnrolledInCompetition(data: CompetitionPageData): boolean {
  return data.categories.some((category) => category.standing !== null);
}

/**
 * Quais blocos de quem vê a página mostra.
 * Ex.: `competitionPageBlocks(mockCompetitionPage.praiaNorte)` → `{ enrollment: true, admin: false }`.
 */
export function competitionPageBlocks(data: CompetitionPageData): CompetitionPageBlocks {
  return { enrollment: !isEnrolledInCompetition(data), admin: data.viewer.is_admin };
}
