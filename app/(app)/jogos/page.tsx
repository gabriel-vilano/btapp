import { connection } from "next/server";
import { AgendaHeader, AgendaView } from "@/src/components/agenda/AgendaView";
import { agendaViewModel } from "@/src/lib/agenda/agendaViewModel";
import { mockDomain, mockEntities } from "@/src/mocks/domain";

// Agenda sobre mocks: quem vê é o Lucas, do Masculino B do Ranking Arena RM.
// Quando a agenda ler do Supabase, o jogador vem da sessão.
const MOCK_VIEWER_ID = mockEntities.players.lucas.id;

export default async function JogosPage() {
  // Prazos e "Hoje" dependem do momento do acesso: nada de pré-render no build
  await connection();
  const agenda = agendaViewModel(mockDomain, { playerId: MOCK_VIEWER_ID, now: new Date().toISOString() });
  return (
    <main>
      <AgendaHeader />
      <AgendaView {...agenda} />
    </main>
  );
}
