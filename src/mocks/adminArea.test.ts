import { describe, expect, it } from 'vitest';
import { mockAdminAreaBySlug } from './adminArea';
import { mockCompetitionPage } from './competitionPage';

describe('mockAdminAreaBySlug', () => {
  it('abre a área da competição que quem vê administra', () => {
    const area = mockAdminAreaBySlug(mockCompetitionPage.admin.slug);
    expect(area?.competition_name).toBe(mockCompetitionPage.admin.name);
  });

  it('não abre para quem não é admin, inscrito ou não (N31)', () => {
    expect(mockAdminAreaBySlug(mockCompetitionPage.enrolled.slug)).toBeUndefined();
    expect(mockAdminAreaBySlug(mockCompetitionPage.notEnrolled.slug)).toBeUndefined();
  });

  it('não abre para uma competição que não existe', () => {
    expect(mockAdminAreaBySlug('competicao-inexistente')).toBeUndefined();
  });
});
