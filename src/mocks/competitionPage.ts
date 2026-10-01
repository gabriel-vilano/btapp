import type { CompetitionOrganizer, CompetitionPageData } from '@/src/lib/domain/competition-page';
import { DEFAULT_RESPONSE_DEADLINE_HOURS, DEFAULT_SCORING_RULE } from '@/src/types/domain';
import { mockEntities, mockExploreDomain } from './domain';
import { daysAgo, daysFromNow } from './relativeTime';

// Página da competição (docs/RANKING.md §7) vista pelo Lucas, em cada relação
// dele com a competição. Os nomes e as posições são os da aba Competições
// (`src/mocks/competitionsTab.ts`), para as duas telas contarem a mesma
// história. As organizações são as do `mockExploreDomain`, com o contato de
// cada uma (EXPLORE.md, EX28). As datas são relativas ao carregamento.

const { ranking, season, rounds } = mockEntities;

function organizer(username: string): CompetitionOrganizer {
  const organization = mockExploreDomain.organizations.find((candidate) => candidate.username === username);
  if (!organization) throw new Error(`Organização '${username}' não existe no mockExploreDomain`);
  const { name, avatar_url, contact } = organization;
  return { name, username, avatar_url, contact };
}

/** Inscrito nas duas categorias, sem ser admin. Regra e temporada vêm do cenário do domínio. */
const arenaMangaba: CompetitionPageData = {
  slug: 'ranking-arena-mangaba',
  name: 'Ranking Arena Mangaba',
  type: 'ranking',
  organizer: organizer('arenamangaba'), // contato em link
  categories: [
    {
      category_id: mockEntities.rankingCategories.masculinoB.id,
      name: 'Masculino B',
      modality: 'doubles',
      unit_count: 16,
      href: '/ranking/masculino-b',
      standing: { position: 3, delta: { direction: 'up', value: 2 }, partner_name: 'Rafael' },
    },
    {
      category_id: mockEntities.rankingCategories.mistaC40.id,
      name: 'Mista C 40+',
      modality: 'doubles',
      unit_count: 12,
      href: '/ranking/mista-c-40',
      standing: { position: 8, delta: { direction: 'down', value: 1 }, partner_name: 'Ana' },
    },
  ],
  season: {
    name: season.name,
    starts_on: season.starts_on,
    ends_on: season.ends_on,
    current_round: { number: rounds.third.number, total: 4, deadline: rounds.third.deadline },
    final: season.final,
  },
  matches_per_round: ranking.matches_per_round,
  match_format: ranking.match_format,
  scoring_rule: ranking.scoring_rule,
  response_deadline_hours: ranking.response_deadline_hours,
  viewer: { is_admin: false, interested: false },
};

/**
 * Admin sem jogar (as pendências da aba apontam para cá). Regra própria, com
 * valores diferentes do padrão, para a página provar que lê a do ranking (RK18).
 */
const ligaPitanga: CompetitionPageData = {
  slug: 'liga-pitanga',
  name: 'Liga Pitanga',
  type: 'ranking',
  organizer: organizer('arenamangaba'),
  categories: [
    { category_id: 'cat-liga-pitanga-masculino-c', name: 'Masculino C', modality: 'doubles', unit_count: 10, href: '/ranking/masculino-c', standing: null },
    { category_id: 'cat-liga-pitanga-feminino-b', name: 'Feminino B', modality: 'doubles', unit_count: 8, href: '/ranking/feminino-b', standing: null },
  ],
  season: {
    name: '2º semestre de 2026',
    starts_on: daysAgo(45),
    ends_on: daysFromNow(80),
    current_round: { number: 4, total: null, deadline: daysFromNow(1) },
    final: { name: 'Finals', qualifiers: 8, cutoff_date: daysFromNow(60) },
  },
  matches_per_round: 2,
  match_format: 'two_sets_of_6_stb',
  scoring_rule: {
    win: 60,
    loss: 20,
    per_game_won: 1,
    per_game_lost: -1,
    wo_winner: 60,
    wo_absent: 0,
    retirement_winner: 60,
    retirement_retiree: 20,
  },
  response_deadline_hours: 72,
  viewer: { is_admin: true, interested: false },
};

/** Não inscrito: contato só em texto, temporada sem sorteio e sem final, uma categoria de simples. */
const praiaNorte: CompetitionPageData = {
  slug: 'circuito-praia-norte',
  name: 'Circuito Praia Norte',
  type: 'ranking',
  organizer: organizer('clubecajui'), // contato em texto
  categories: [
    { category_id: 'cat-praia-norte-masculino-a', name: 'Masculino A', modality: 'doubles', unit_count: 12, href: '/ranking/masculino-a', standing: null },
    { category_id: 'cat-praia-norte-feminino-c', name: 'Feminino C', modality: 'doubles', unit_count: 1, href: '/ranking/feminino-c', standing: null },
    { category_id: 'cat-praia-norte-masculino-open', name: 'Masculino Open · Simples', modality: 'singles', unit_count: 20, href: '/ranking/masculino-open-simples', standing: null },
  ],
  season: {
    name: 'Temporada de verão 2027',
    starts_on: daysAgo(2),
    ends_on: daysFromNow(120),
    current_round: null,
    final: null,
  },
  matches_per_round: 4,
  match_format: 'one_set_of_8',
  scoring_rule: DEFAULT_SCORING_RULE,
  response_deadline_hours: DEFAULT_RESPONSE_DEADLINE_HOURS,
  viewer: { is_admin: false, interested: false },
};

/**
 * Inscrito numa das categorias, com outra livre (EX26): vê o "Como se
 * inscrever" compacto, sem "Tenho interesse" (EX27). O interesse marcado
 * antes da inscrição continua guardado (EX31).
 */
const mistaPequi: CompetitionPageData = {
  ...praiaNorte,
  slug: 'mista-pequi',
  name: 'Mista Pequi',
  organizer: organizer('federacaovaleazul'), // contato em link
  categories: [
    {
      category_id: 'cat-mista-pequi-mista-b',
      name: 'Mista B',
      modality: 'doubles',
      unit_count: 14,
      href: '/ranking/mista-b',
      standing: { position: null, delta: null, partner_name: 'Ana' },
    },
    { category_id: 'cat-mista-pequi-masculino-b', name: 'Masculino B', modality: 'doubles', unit_count: 9, href: '/ranking/masculino-b-pequi', standing: null },
  ],
  viewer: { is_admin: false, interested: true },
};

/**
 * Situações da página. Ex.: `<CompetitionPage data={mockCompetitionPage.notEnrolled} now={…} />`.
 * - `enrolled`: inscrito em todas as categorias, com a posição em cada uma;
 * - `partiallyEnrolled`: inscrito numa categoria, com outra livre (EX26);
 * - `admin`: admin da competição, sem jogar nela;
 * - `notEnrolled`: não inscrito, vê "Como se inscrever" e "Tenho interesse";
 * - `interested`: o mesmo, já com o interesse marcado;
 * - `withoutSeason`: competição sem temporada em andamento (RK19);
 * - `withoutContact`: organização sem contato cadastrado.
 */
export const mockCompetitionPage = {
  enrolled: arenaMangaba,
  partiallyEnrolled: mistaPequi,
  admin: ligaPitanga,
  notEnrolled: praiaNorte,
  interested: { ...praiaNorte, viewer: { is_admin: false, interested: true } },
  withoutSeason: { ...praiaNorte, season: null },
  withoutContact: { ...praiaNorte, organizer: organizer('gruposaquecurto') },
} satisfies Record<string, CompetitionPageData>;

const bySlug = new Map([arenaMangaba, mistaPequi, ligaPitanga, praiaNorte].map((page) => [page.slug, page]));

/** A página mockada de uma rota, ou undefined quando o slug não existe. */
export function mockCompetitionPageBySlug(slug: string): CompetitionPageData | undefined {
  return bySlug.get(slug);
}
