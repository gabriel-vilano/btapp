import { describe, expect, it } from 'vitest';
import type { CompetitionCategory, CompetitorUnit, Enrollment } from '@/src/types/domain';
import { participatingCompetitionIds } from './participation';
import { exploreShowcase, organizationKindLabel, organizationPageView, type ExploreViewDomain } from './views';
import { exploreDomain, NOW, organization, ranking, season, tournament } from './explore.test-utils';

const RUNNING = ['2026-08-01T15:00:00.000Z', '2026-12-20T15:00:00.000Z'] as const;
const ENDED = ['2026-02-01T15:00:00.000Z', '2026-07-01T15:00:00.000Z'] as const;

function category(id: string, competitionId: string): CompetitionCategory {
  return { id, competition_id: competitionId, gender: 'M', modality: 'doubles', level_min: 'B', level_max: 'B', min_age: null };
}

function enrollment(id: string, categoryId: string, seasonId: string | null, status: Enrollment['status'] = 'active'): Enrollment {
  const base = { id, unit_id: 'unit-ana', category_id: categoryId, season_id: seasonId, enrolled_at: '2026-08-01T15:00:00.000Z' };
  if (status === 'active') return { ...base, status };
  return { ...base, status, closed_at: '2026-09-01T15:00:00.000Z', closed_reason: 'partner_change' };
}

const liga = ranking('liga', 'Liga Zebu', 'org-zebu');
const pausa = ranking('pausa', 'Ranking Pausa', 'org-clube');
const copa = tournament('copa', 'Copa Perto', '2026-10-03T12:00:00.000Z', '2026-10-04T21:00:00.000Z', 'org-zebu');
const passada = tournament('passada', 'Copa Passada', '2026-08-15T12:00:00.000Z', '2026-08-16T21:00:00.000Z', 'org-zebu');
const units: CompetitorUnit[] = [{ id: 'unit-ana', modality: 'doubles', player_ids: ['ana', 'bia'] }];

const domain: ExploreViewDomain = {
  ...exploreDomain({
    organizations: [organization('org-zebu', 'Arena Zebu'), organization('org-clube', 'Clube Pausa', 'club')],
    competitions: [liga, pausa, copa, passada],
    seasons: [season('s-liga', 'liga', ...RUNNING), season('s-pausa', 'pausa', ...ENDED)],
  }),
  categories: [category('cat-liga', 'liga'), category('cat-pausa', 'pausa'), category('cat-copa', 'copa')],
  units,
  enrollments: [enrollment('e-liga', 'cat-liga', 's-liga'), enrollment('e-pausa', 'cat-pausa', 's-pausa')],
};

const links = {
  competitionHref: (id: string) => `/competicoes/${id}`,
  organizationHref: (username: string) => `/organizacoes/${username}`,
};
const ana = { playerId: 'ana', now: NOW };

describe('participatingCompetitionIds (EX9)', () => {
  it('a competição com inscrição ativa na temporada em andamento', () => {
    expect([...participatingCompetitionIds(domain, 'ana', NOW)]).toEqual(['liga']);
  });

  it('inscrição de temporada que já terminou não conta', () => {
    expect(participatingCompetitionIds(domain, 'ana', NOW).has('pausa')).toBe(false);
  });

  it('inscrição encerrada por troca de parceiro não conta', () => {
    const closed = { ...domain, enrollments: [enrollment('e-liga', 'cat-liga', 's-liga', 'closed')] };
    expect(participatingCompetitionIds(closed, 'ana', NOW).size).toBe(0);
  });

  it('torneio: a inscrição não tem temporada e conta', () => {
    const withCup = { ...domain, enrollments: [enrollment('e-copa', 'cat-copa', null)] };
    expect([...participatingCompetitionIds(withCup, 'ana', NOW)]).toEqual(['copa']);
  });

  it('quem não tem unidade não participa de nada', () => {
    expect(participatingCompetitionIds(domain, 'carla', NOW).size).toBe(0);
  });
});

describe('exploreShowcase (EX8 a EX11)', () => {
  const showcase = exploreShowcase(domain, ana, links);

  it('monta a linha do item com tipo, organização, cidade, situação e rota', () => {
    expect(showcase.competitions[1]).toEqual({
      id: 'liga',
      name: 'Liga Zebu',
      typeLabel: 'Ranking',
      organizationName: 'Arena Zebu',
      organizationAvatarUrl: null,
      city: 'Belo Horizonte',
      situation: 'Primeira rodada ainda não sorteada',
      participating: true,
      href: '/competicoes/liga',
    });
  });

  it('segue a ordem da EX8 e marca só onde o jogador participa', () => {
    expect(showcase.competitions.map((item) => [item.id, item.participating])).toEqual([
      ['copa', false],
      ['liga', true],
      ['pausa', false],
    ]);
    expect(showcase.hasOpenCompetition).toBe(true);
  });

  it('só com ranking entre temporadas não há competição aberta (EX13)', () => {
    const onlyPause = { ...domain, competitions: [pausa] };
    const view = exploreShowcase(onlyPause, ana, links);
    expect(view.competitions.map((item) => item.situation)).toEqual(['Entre temporadas']);
    expect(view.hasOpenCompetition).toBe(false);
  });

  it('arenas com a contagem de abertas e a rota pelo @username', () => {
    expect(showcase.arenas).toEqual([
      { id: 'org-zebu', name: 'Arena Zebu', avatarUrl: null, city: 'Belo Horizonte', openCompetitions: '2 competições abertas', href: '/organizacoes/org-zebu' },
    ]);
  });

  it('competição de organização que não existe é erro com o id', () => {
    const broken = { ...domain, competitions: [ranking('orfa', 'Órfã', 'org-x')] };
    expect(() => exploreShowcase(broken, ana, links)).toThrow("organização 'org-x'");
  });
});

describe('organizationPageView (EX22)', () => {
  it('cabeçalho com o tipo escrito, lista na ordem da EX8 e torneios passados à parte', () => {
    const view = organizationPageView('org-zebu', domain, ana, links);
    expect(view).toMatchObject({ name: 'Arena Zebu', kindLabel: 'Arena', city: 'Belo Horizonte', hasOpenCompetition: true });
    expect(view?.competitions.map((item) => item.id)).toEqual(['copa', 'liga']);
    expect(view?.closed.map((item) => [item.id, item.situation])).toEqual([['passada', 'Encerrado']]);
  });

  it('ranking entre temporadas fica na lista, sem competição aberta', () => {
    const view = organizationPageView('org-clube', domain, ana, links);
    expect(view?.competitions.map((item) => item.id)).toEqual(['pausa']);
    expect(view?.hasOpenCompetition).toBe(false);
    expect(view?.closed).toEqual([]);
  });

  it('@username que não existe → null', () => {
    expect(organizationPageView('nao-existe', domain, ana, links)).toBeNull();
  });
});

describe('organizationKindLabel', () => {
  it('os quatro tipos escritos', () => {
    expect((['arena', 'club', 'federation', 'group'] as const).map(organizationKindLabel)).toEqual([
      'Arena',
      'Clube',
      'Federação',
      'Grupo',
    ]);
  });
});
