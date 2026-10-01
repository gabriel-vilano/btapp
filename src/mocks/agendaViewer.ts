import type { AgendaLinks } from '@/src/lib/agenda/agendaViewModel';
import { mockEntities } from './domain';
import { mockRankingRoutes } from './rankingRoutes';

// Quem vê a agenda enquanto ela lê dos mocks: o Lucas, do Masculino B do
// Ranking Arena Mangaba. A aba Jogos, o badge dela (N3) e o bloco "Sua vez"
// do feed (N20) usam o mesmo jogador.
// Quando a agenda ler do Supabase, o jogador vem da sessão.
export const MOCK_AGENDA_VIEWER_ID = mockEntities.players.lucas.id;

/** Rotas da agenda nos mocks: a classificação pelo slug, como no perfil. */
export const MOCK_AGENDA_LINKS: AgendaLinks = { rankingHref: mockRankingRoutes.categoryHref };
