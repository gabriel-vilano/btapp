import { buildH2HPageView, type H2HPageLinks, type H2HPageView, type H2HPageViewResult } from '@/src/lib/domain/h2h-page';
import { mockEntities, mockH2HDomain } from './domain';
import { MOCK_VIEWER } from './profilePage';
import { mockRankingRoutes } from './rankingRoutes';

// Página de H2H sobre o `mockH2HDomain`, até a integração com o Supabase.
// Quem vê é o Lucas, o mesmo jogador do perfil e da aba Competições.

// A mesma rota da classificação que o perfil usa (RK1): o slug da categoria
const H2H_LINKS: H2HPageLinks = { rankingHref: (categoryId) => mockRankingRoutes.categoryHref(categoryId) };

/**
 * H2H de `/h2h/[sideA]/[sideB]` visto pelo Lucas, ou "H2H não encontrado".
 * Ex.: `mockH2HPage('lucassilva+rafaelcosta', 'pedrohenrique+thiagomendes')`.
 */
export function mockH2HPage(sideA: string, sideB: string, now = new Date().toISOString()): H2HPageViewResult {
  return buildH2HPageView(mockH2HDomain, { sideA, sideB, viewerId: MOCK_VIEWER.id, now }, H2H_LINKS);
}

function viewOf(sideA: string, sideB: string): H2HPageView {
  const result = mockH2HPage(sideA, sideB);
  if (result.status === 'not_found') throw new Error(`Mocks do H2H: '${sideA}/${sideB}' não encontrado (${result.reason})`);
  return result.view;
}

const { lucas, rafael, pedro, thiago, gustavo, marcos } = mockEntities.players;
const lucasRafael = `${lucas.username}+${rafael.username}`;
const pedroThiago = `${pedro.username}+${thiago.username}`;
const doubles = viewOf(lucasRafael, pedroThiago);

/**
 * Situações da página, para as stories e os testes. Ex.: `<H2HPage view={mockH2HPages.doubles} />`.
 * - `doubles`: Lucas e Rafael × Pedro e Thiago, 3 × 1, com "No ranking" e os 4 pares cruzados;
 * - `players`: Lucas × Pedro, 3 × 2, com os parceiros de cada partida;
 * - `thirdParty`: Rafael × Thiago, visto pelo Lucas, que não está em nenhum lado;
 * - `oneMatch`: Lucas × Gustavo, um confronto só (sem barra);
 * - `tie`: Gustavo × Rafael, 1 a 1, visto de fora;
 * - `neverMet`: Lucas × Marcos, sem confronto, com a forma recente;
 * - `sectionError`: a de duplas com "Forma recente" e "No ranking" falhando (HH22).
 */
export const mockH2HPages = {
  doubles,
  players: viewOf(lucas.username, pedro.username),
  thirdParty: viewOf(rafael.username, thiago.username),
  oneMatch: viewOf(lucas.username, gustavo.username),
  tie: viewOf(gustavo.username, rafael.username),
  neverMet: viewOf(lucas.username, marcos.username),
  sectionError: { ...doubles, form: { status: 'error' }, rankings: { status: 'error' } },
} satisfies Record<string, H2HPageView>;
