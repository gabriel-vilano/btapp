import { mockEntities } from './domain';

// Quem vê a agenda enquanto ela lê dos mocks: o Lucas, do Masculino B do
// Ranking Arena Mangaba. A aba Jogos e o badge dela (N3) usam o mesmo jogador.
// Quando a agenda ler do Supabase, o jogador vem da sessão.
export const MOCK_AGENDA_VIEWER_ID = mockEntities.players.lucas.id;
