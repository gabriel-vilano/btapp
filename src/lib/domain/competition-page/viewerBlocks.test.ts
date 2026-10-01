import { describe, expect, it } from 'vitest';
import { mockCompetitionPage } from '@/src/mocks/competitionPage';
import { competitionPageBlocks, isEnrolledInCompetition } from './viewerBlocks';

describe('competitionPageBlocks', () => {
  it('inscrito em todas as categorias não vê nenhum bloco de inscrição (EX26)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.enrolled)).toEqual({ enrollment: null, interest: false, admin: false });
  });

  it('inscrito em parte das categorias vê só o compacto, sem "Tenho interesse" (EX26, EX27)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.partiallyEnrolled)).toEqual({
      enrollment: 'compact',
      interest: false,
      admin: false,
    });
  });

  it('não inscrito vê o completo no topo, com "Tenho interesse" (EX26, EX27)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.notEnrolled)).toEqual({ enrollment: 'full', interest: true, admin: false });
  });

  it('o admin vê a entrada da área "Administrar" (N31), independente da inscrição', () => {
    const asAdmin = { is_admin: true, interested: false };
    expect(competitionPageBlocks(mockCompetitionPage.admin)).toEqual({ enrollment: 'full', interest: true, admin: true });
    expect(competitionPageBlocks({ ...mockCompetitionPage.enrolled, viewer: asAdmin })).toEqual({
      enrollment: null,
      interest: false,
      admin: true,
    });
    expect(competitionPageBlocks({ ...mockCompetitionPage.partiallyEnrolled, viewer: asAdmin })).toEqual({
      enrollment: 'compact',
      interest: false,
      admin: true,
    });
  });

  it('competição sem categoria não tem onde se inscrever', () => {
    expect(competitionPageBlocks({ ...mockCompetitionPage.notEnrolled, categories: [] })).toEqual({
      enrollment: null,
      interest: false,
      admin: false,
    });
  });
});

describe('isEnrolledInCompetition', () => {
  it('basta uma categoria com posição de quem vê', () => {
    const [first, second] = mockCompetitionPage.enrolled.categories;
    const oneCategory = { ...mockCompetitionPage.enrolled, categories: [first, { ...second, standing: null }] };
    expect(isEnrolledInCompetition(oneCategory)).toBe(true);
  });

  it('inscrito sem posição ainda (categoria sem jogo confirmado) conta como inscrito', () => {
    const [first] = mockCompetitionPage.enrolled.categories;
    const noPosition = {
      ...mockCompetitionPage.enrolled,
      categories: [{ ...first, standing: { position: null, delta: null, partner_name: 'Rafael' } }],
    };
    expect(isEnrolledInCompetition(noPosition)).toBe(true);
  });
});
