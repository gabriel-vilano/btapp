import type { CompetitionPageData } from '@/src/lib/domain/competition-page';
import { DEFAULT_RESPONSE_DEADLINE_HOURS, DEFAULT_SCORING_RULE } from '@/src/types/domain';
import { mockEntities } from './domain';
import { daysAgo, daysFromNow } from './relativeTime';

// Página da competição (docs/RANKING.md §7) vista pelo Lucas, em cada relação
// dele com a competição. Os nomes e as posições são os da aba Competições
// (`src/mocks/competitionsTab.ts`), para as duas telas contarem a mesma
// história. As datas são relativas ao carregamento.

const { ranking, season, rounds, organizations } = mockEntities;

/** Inscrito em duas categorias, sem ser admin. Regra e temporada vêm do cenário do domínio. */
const arenaMangaba: CompetitionPageData = {
  slug: 'ranking-arena-mangaba',
  name: 'Ranking Arena Mangaba',
  organizer: {
    name: organizations.arenaMangaba.name,
    avatar_url: organizations.arenaMangaba.avatar_url,
    contact: { text: 'WhatsApp da recepção da Arena Mangaba', href: 'https://wa.me/5531900000000' },
  },
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
  organizer: {
    name: 'Arena Mangaba',
    avatar_url: null,
    contact: { text: 'Instagram @arenamangaba', href: 'https://instagram.com/arenamangaba' },
  },
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
  organizer: {
    name: 'Praia Norte Beach Club',
    avatar_url: null,
    contact: { text: 'Procure o Carlos na recepção do clube, de terça a domingo.', href: null },
  },
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
 * Situações da página. Ex.: `<CompetitionPage data={mockCompetitionPage.praiaNorte} now={…} />`.
 * - `enrolled`: inscrito, com a posição em cada categoria;
 * - `admin`: admin da competição, sem jogar nela;
 * - `notEnrolled`: não inscrito, vê "Como se inscrever" e "Tenho interesse";
 * - `interested`: o mesmo, já com o interesse marcado;
 * - `withoutSeason`: competição sem temporada em andamento (RK19);
 * - `withoutContact`: organizador sem contato cadastrado.
 */
export const mockCompetitionPage = {
  enrolled: arenaMangaba,
  admin: ligaPitanga,
  notEnrolled: praiaNorte,
  interested: { ...praiaNorte, viewer: { is_admin: false, interested: true } },
  withoutSeason: { ...praiaNorte, season: null },
  withoutContact: { ...praiaNorte, organizer: { ...praiaNorte.organizer, contact: null } },
} satisfies Record<string, CompetitionPageData>;

const bySlug = new Map([arenaMangaba, ligaPitanga, praiaNorte].map((page) => [page.slug, page]));

/** A página mockada de uma rota, ou undefined quando o slug não existe. */
export function mockCompetitionPageBySlug(slug: string): CompetitionPageData | undefined {
  return bySlug.get(slug);
}
