import { describe, expect, it } from 'vitest';
import { mockEntities, mockProfileDomain, pastSeasonEntities } from '@/src/mocks/domain';
import { daysAgo } from '@/src/mocks/relativeTime';
import { categorySwitcher, rankingScreen, type CategorySwitcherRequest } from '.';

// Folha do seletor de categoria (docs/RANKING.md, RK6) sobre o cenário dos
// mocks: o Ranking Arena Mangaba tem Masculino B (Lucas e Rafael são a T1) e
// Mista C 40+ (quatro duplas ativas; a Júlia joga com o Vinícius).

const { players, ranking, rankingCategories, masculinoB: mb, season } = mockEntities;
const MB = rankingCategories.masculinoB.id;
const MX = rankingCategories.mistaC40.id;
const NOW = new Date().toISOString();
const hrefOf = (categoryId: string) => `/ranking/${categoryId}`;

function request(partial: Partial<CategorySwitcherRequest> = {}): CategorySwitcherRequest {
  return {
    competition_id: ranking.id,
    category_id: MB,
    season_id: season.id,
    is_default_season: true,
    viewer_id: players.lucas.id,
    now: NOW,
    ...partial,
  };
}

const switcher = (partial?: Partial<CategorySwitcherRequest>, domain = mockProfileDomain) =>
  categorySwitcher(domain, request(partial), hrefOf);

describe('categorySwitcher: "Suas categorias" (RK6)', () => {
  it('traz a inscrição ativa do jogador, com parceiro e a categoria aberta marcada', () => {
    const [own, ...rest] = switcher().own;
    expect(rest).toEqual([]);
    expect(own).toMatchObject({
      enrollment_id: mb.t1.id,
      competition_name: ranking.name,
      category: { id: MB },
      partner: { id: players.rafael.id },
      href: `/ranking/${MB}`,
      is_current: true,
    });
  });

  it('mostra a mesma posição e o mesmo delta da linha na tabela (RK12)', () => {
    const screen = rankingScreen(mockProfileDomain, { category_id: MB, season_id: null, viewer_id: players.lucas.id, now: NOW });
    if (screen?.content.kind !== 'table') throw new Error(`Esperado 'table', recebi '${screen?.content.kind}'`);
    const line = [...screen.content.qualified, ...screen.content.outside].find((row) => row.is_own);
    expect(switcher().own[0]).toMatchObject({ position: line?.position, delta: line?.delta });
  });

  it('põe a inscrição mais recente primeiro, como "Minhas competições" (N29)', () => {
    const later = { ...mb.t1, id: 'enr-lucas-mista', category_id: MX, enrolled_at: daysAgo(1) };
    const domain = { ...mockProfileDomain, enrollments: [...mockProfileDomain.enrollments, later] };
    const { own, others } = switcher({}, domain);
    expect(own.map((option) => option.enrollment_id)).toEqual([later.id, mb.t1.id]);
    // Inscrito nas duas, nenhuma sobra para "Outras categorias"
    expect(others).toEqual([]);
  });

  it('fica vazia para quem não está inscrito', () => {
    expect(switcher({ viewer_id: 'player-sem-inscricao' }).own).toEqual([]);
  });
});

describe('categorySwitcher: "Outras categorias" (RK6)', () => {
  it('traz as categorias da competição sem inscrição do jogador, com as inscrições ativas', () => {
    // A M4 se desfez (troca de parceiro): conta só as quatro ativas
    expect(switcher().others).toEqual([
      { category: rankingCategories.mistaC40, unit_count: 4, href: `/ranking/${MX}`, is_current: false },
    ]);
  });

  it('marca a categoria aberta quando o jogador não está inscrito nela', () => {
    const { others } = switcher({ viewer_id: 'player-sem-inscricao' });
    expect(others.map((option) => [option.category.id, option.is_current])).toEqual([
      [MB, true],
      [MX, false],
    ]);
  });

  it('conta os inscritos da temporada que a tela mostra', () => {
    const past = switcher({ season_id: pastSeasonEntities.season.id, is_default_season: false });
    expect(past.others[0]?.unit_count).toBe(0);
  });

  it('sem temporada, não conta inscritos (RK19)', () => {
    expect(switcher({ season_id: null }).others[0]?.unit_count).toBeNull();
  });
});

describe('categorySwitcher: quando o seletor vira texto (RK6)', () => {
  const onlyMasculinoB = { ...mockProfileDomain, categories: mockProfileDomain.categories.filter((c) => c.id !== MX) };

  it('com outra categoria na competição, há para onde trocar', () => {
    expect(switcher().can_switch).toBe(true);
  });

  it('uma inscrição só e nenhuma outra categoria: não há para onde trocar', () => {
    expect(switcher({}, onlyMasculinoB).can_switch).toBe(false);
  });

  it('numa temporada antiga, o item da própria categoria leva à atual e conta como troca', () => {
    const past = switcher({ season_id: pastSeasonEntities.season.id, is_default_season: false }, onlyMasculinoB);
    expect(past.own[0]?.is_current).toBe(false);
    expect(past.can_switch).toBe(true);
  });
});
