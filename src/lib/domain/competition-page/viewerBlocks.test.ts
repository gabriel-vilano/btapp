import { describe, expect, it } from 'vitest';
import { mockCompetitionPage, mockTournamentPage } from '@/src/mocks/competitionPage';
import { competitionPageBlocks, isEnrolledInCompetition } from './viewerBlocks';

const now = new Date().toISOString();

describe('competitionPageBlocks', () => {
  it('inscrito em todas as categorias não vê nenhum bloco de inscrição (EX26)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.enrolled, now)).toEqual({ enrollment: null, interest: false, admin: false });
  });

  it('inscrito em parte das categorias vê só o compacto, sem "Tenho interesse" (EX26, EX27)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.partiallyEnrolled, now)).toEqual({
      enrollment: 'compact',
      interest: false,
      admin: false,
    });
  });

  it('não inscrito vê o completo no topo, com "Tenho interesse" (EX26, EX27)', () => {
    expect(competitionPageBlocks(mockCompetitionPage.notEnrolled, now)).toEqual({ enrollment: 'full', interest: true, admin: false });
  });

  it('o admin vê a entrada da área "Administrar" (N31), independente da inscrição', () => {
    const asAdmin = { is_admin: true, interested: false };
    expect(competitionPageBlocks(mockCompetitionPage.admin, now)).toEqual({ enrollment: 'full', interest: true, admin: true });
    expect(competitionPageBlocks({ ...mockCompetitionPage.enrolled, viewer: asAdmin }, now)).toEqual({
      enrollment: null,
      interest: false,
      admin: true,
    });
    expect(competitionPageBlocks({ ...mockCompetitionPage.partiallyEnrolled, viewer: asAdmin }, now)).toEqual({
      enrollment: 'compact',
      interest: false,
      admin: true,
    });
  });

  it('competição sem categoria não tem onde se inscrever', () => {
    expect(competitionPageBlocks({ ...mockCompetitionPage.notEnrolled, categories: [] }, now)).toEqual({
      enrollment: null,
      interest: false,
      admin: false,
    });
  });

  it('torneio segue as mesmas regras da inscrição por categoria (EX34)', () => {
    expect(competitionPageBlocks(mockTournamentPage.notEnrolled, now)).toEqual({ enrollment: 'full', interest: true, admin: false });
    expect(competitionPageBlocks(mockTournamentPage.enrolled, now)).toEqual({ enrollment: 'compact', interest: false, admin: false });
  });

  it('torneio que já aconteceu não mostra os blocos de inscrição, mas mantém o admin (EX34)', () => {
    const { past } = mockTournamentPage;
    expect(competitionPageBlocks(past, now)).toEqual({ enrollment: null, interest: false, admin: false });
    const asAdmin = { ...past, viewer: { is_admin: true, interested: false } };
    expect(competitionPageBlocks(asAdmin, now)).toEqual({ enrollment: null, interest: false, admin: true });
  });

  it('no dia do fim o torneio ainda aceita inscrição; no dia seguinte, não', () => {
    const lastDay = { ...mockTournamentPage.notEnrolled, ends_on: '2026-10-11T21:00:00.000Z' };
    expect(competitionPageBlocks(lastDay, '2026-10-12T02:00:00.000Z').enrollment).toBe('full');
    expect(competitionPageBlocks(lastDay, '2026-10-12T03:30:00.000Z').enrollment).toBeNull();
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
