import { describe, expect, it } from 'vitest';
import { mockAdminAreaBySlug } from './adminArea';
import { mockCompetitionPage, mockCompetitionPageBySlug } from './competitionPage';

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

describe('competition_href', () => {
  it('leva o "Voltar" à página da competição administrada, a tela pai', () => {
    const area = mockAdminAreaBySlug(mockCompetitionPage.admin.slug);
    const slug = area?.competition_href.replace(/^\/competicoes\//, '') ?? '';
    expect(area?.competition_href).toBe(`/competicoes/${slug}`);
    expect(mockCompetitionPageBySlug(slug)?.name).toBe(area?.competition_name);
  });
});
