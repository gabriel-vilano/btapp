import { describe, expect, it } from 'vitest';
import { mockCompetitionPage } from '@/src/mocks/competitionPage';
import { competitionPageBlocks, isEnrolledInCompetition } from './viewerBlocks';

describe('competitionPageBlocks', () => {
  it('inscrito em alguma categoria não vê "Como se inscrever" (N33)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.enrolled)).toEqual({ enrollment: false, admin: false });
  });

  it('não inscrito vê "Como se inscrever" e "Tenho interesse" (N33)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.notEnrolled)).toEqual({ enrollment: true, admin: false });
  });

  it('o admin vê a entrada da área "Administrar" (N31), independente da inscrição', () => {
    expect(competitionPageBlocks(mockCompetitionPage.admin)).toEqual({ enrollment: true, admin: true });
    const enrolledAdmin = { ...mockCompetitionPage.enrolled, viewer: { is_admin: true, interested: false } };
    expect(competitionPageBlocks(enrolledAdmin)).toEqual({ enrollment: false, admin: true });
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
