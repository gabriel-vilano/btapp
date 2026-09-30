import type { AdminAreaData, AdminMatchItem } from '@/src/lib/domain/admin-area';
import { mockCompetitionPage, mockCompetitionPageBySlug } from './competitionPage';
import { daysAgo } from './relativeTime';

// Área "Administrar" (docs/NAVIGATION.md N31) da Liga Vila, a competição que o
// Lucas administra sem jogar (`mockCompetitionPage.admin`). As duas decisões
// são as mesmas do bloco "Pendências de admin" da aba Competições
// (`src/mocks/competitionsTab.ts`), para as duas telas contarem a mesma fila.
// As partidas da Liga Vila ainda não existem nas tabelas mockadas do domínio:
// o link de cada uma leva à rota da partida, que responde 404 até lá.

const ligaVila = mockCompetitionPage.admin;

function match(id: string, fields: Omit<AdminMatchItem, 'id' | 'href' | 'corrected'> & { corrected?: boolean }): AdminMatchItem {
  return { id, corrected: false, href: `/jogos/${id}`, ...fields };
}

const roundFour = [
  match('match-liga-vila-mc-r4-1', { category_name: 'Masculino C', sides: 'Bruno e Caio x Diego e Felipe', status: 'in_arbitration' }),
  match('match-liga-vila-mc-r4-2', { category_name: 'Masculino C', sides: 'Gabriel e Hugo x Otávio e Renato', status: 'defined' }),
  match('match-liga-vila-fb-r4-1', { category_name: 'Feminino B', sides: 'Beatriz e Clara x Laura e Sofia', status: 'awaiting_confirmation' }),
  match('match-liga-vila-fb-r4-2', { category_name: 'Feminino B', sides: 'Carla e Júlia x Helena e Luísa', status: 'confirmed' }),
];

const roundThree = [
  match('match-liga-vila-mc-r3-1', { category_name: 'Masculino C', sides: 'Bruno e Caio x Gabriel e Hugo', status: 'confirmed', corrected: true }),
  match('match-liga-vila-mc-r3-2', { category_name: 'Masculino C', sides: 'Diego e Felipe x Otávio e Renato', status: 'confirmed' }),
  match('match-liga-vila-fb-r3-1', { category_name: 'Feminino B', sides: 'Carla e Júlia x Marina e Paula', status: 'not_played' }),
];

const withDecisions: AdminAreaData = {
  slug: ligaVila.slug,
  competition_name: ligaVila.name,
  competition_href: `/competicoes/${ligaVila.slug}`,
  current_round: ligaVila.season?.current_round ?? null,
  // Fora de ordem de propósito: quem ordena a fila é a tela (RESULTS §5)
  decisions: [
    {
      id: 'decision-liga-vila-fb-r3-1',
      kind: 'not_played',
      category_name: 'Feminino B',
      round_label: 'Rodada 3',
      sides: 'Carla e Júlia x Marina e Paula',
      since: daysAgo(1),
    },
    {
      id: 'decision-liga-vila-mc-r4-1',
      kind: 'contested',
      category_name: 'Masculino C',
      round_label: 'Rodada 4',
      sides: 'Bruno e Caio x Diego e Felipe',
      since: daysAgo(2),
    },
  ],
  match_rounds: [
    { label: 'Rodada 4', matches: roundFour },
    { label: 'Rodada 3', matches: roundThree },
  ],
};

/**
 * Situações da área. Ex.: `<AdminArea data={mockAdminArea.withDecisions} now={…} />`.
 * - `withDecisions`: duas decisões na fila e as partidas de duas rodadas;
 * - `withoutDecisions`: fila vazia;
 * - `beforeFirstDraw`: temporada sem sorteio, sem decisões nem partidas.
 */
export const mockAdminArea = {
  withDecisions,
  withoutDecisions: { ...withDecisions, decisions: [] },
  beforeFirstDraw: { ...withDecisions, current_round: null, decisions: [], match_rounds: [] },
} satisfies Record<string, AdminAreaData>;

const bySlug = new Map([withDecisions].map((area) => [area.slug, area]));

/**
 * A área mockada de uma rota, só para o admin da competição (N31): quem não é
 * admin recebe undefined, como quem pede um slug que não existe. A mesma
 * relação decide a entrada "Administrar" na página da competição.
 */
export function mockAdminAreaBySlug(slug: string): AdminAreaData | undefined {
  if (mockCompetitionPageBySlug(slug)?.viewer.is_admin !== true) return undefined;
  return bySlug.get(slug);
}
