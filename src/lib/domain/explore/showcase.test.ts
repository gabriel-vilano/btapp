import { describe, expect, it } from 'vitest';
import { openCompetitionsText, organizationCompetitions, showcaseArenas, showcaseCompetitions } from './showcase';
import { exploreDomain, NOW, organization, ranking, season, tournament } from './explore.test-utils';

const RUNNING = ['2026-08-01T15:00:00.000Z', '2026-12-20T15:00:00.000Z'] as const;
const ENDED = ['2026-02-01T15:00:00.000Z', '2026-07-01T15:00:00.000Z'] as const;

const zeta = ranking('zeta', 'Zeta Ranking');
const alfa = ranking('alfa', 'Alfa Ranking');
const pausa = ranking('pausa', 'Beta Ranking', 'org-b');
const soon = tournament('soon', 'Copa Perto', '2026-10-03T12:00:00.000Z', '2026-10-04T21:00:00.000Z');
const later = tournament('later', 'Copa Longe', '2026-11-07T12:00:00.000Z', '2026-11-07T21:00:00.000Z', 'org-b');
const past = tournament('past', 'Copa Passada', '2026-08-15T12:00:00.000Z', '2026-08-16T21:00:00.000Z');
const older = tournament('older', 'Copa Antiga', '2026-05-15T12:00:00.000Z', '2026-05-16T21:00:00.000Z');

const domain = exploreDomain({
  organizations: [organization('org-a', 'Arena Zebu'), organization('org-b', 'Arena Açaí'), organization('org-c', 'Clube X', 'club')],
  competitions: [past, zeta, later, pausa, alfa, soon, older],
  seasons: [season('s-zeta', 'zeta', ...RUNNING), season('s-alfa', 'alfa', ...RUNNING), season('s-pausa', 'pausa', ...ENDED)],
});

const ids = (list: { id: string }[]) => list.map((item) => item.id);

describe('showcaseCompetitions (EX8)', () => {
  it('torneios abertos pela data, rankings em andamento e rankings entre temporadas por nome', () => {
    expect(ids(showcaseCompetitions(domain, NOW))).toEqual(['soon', 'later', 'alfa', 'zeta', 'pausa']);
  });

  it('torneio que já aconteceu fica de fora', () => {
    expect(ids(showcaseCompetitions(domain, NOW))).not.toContain('past');
  });

  it('sem competição, lista vazia', () => {
    expect(showcaseCompetitions(exploreDomain({}), NOW)).toEqual([]);
  });
});

describe('organizationCompetitions (EX22)', () => {
  it('só as da organização: abertas na ordem da EX8, torneios passados do mais recente', () => {
    const { open, betweenSeasons, closed } = organizationCompetitions('org-a', domain, NOW);
    expect(ids(open)).toEqual(['soon', 'alfa', 'zeta']);
    expect(betweenSeasons).toEqual([]);
    expect(ids(closed)).toEqual(['past', 'older']);
  });

  it('o ranking entre temporadas fica na lista, fora de "Ver encerradas" (decisão de 30/09)', () => {
    const { open, betweenSeasons, closed } = organizationCompetitions('org-b', domain, NOW);
    expect(ids(open)).toEqual(['later']);
    expect(ids(betweenSeasons)).toEqual(['pausa']);
    expect(closed).toEqual([]);
  });

  it('organização sem competição: as três listas vazias', () => {
    expect(organizationCompetitions('org-c', domain, NOW)).toEqual({ open: [], betweenSeasons: [], closed: [] });
  });
});

describe('showcaseArenas (EX11)', () => {
  it('só as do tipo arena, por nome com acento', () => {
    expect(showcaseArenas(domain).map((org) => org.name)).toEqual(['Arena Açaí', 'Arena Zebu']);
  });
});

describe('openCompetitionsText (EX11)', () => {
  it('plural, singular e nenhuma', () => {
    expect(openCompetitionsText('org-a', domain, NOW)).toBe('3 competições abertas');
    expect(openCompetitionsText('org-b', domain, NOW)).toBe('1 competição aberta');
    expect(openCompetitionsText('org-c', domain, NOW)).toBe('Nenhuma competição aberta');
  });
});
