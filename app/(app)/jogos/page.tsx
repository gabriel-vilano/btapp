import { connection } from "next/server";
import { AgendaHeader, AgendaView } from "@/src/components/agenda/AgendaView";
import { agendaViewModel } from "@/src/lib/agenda/agendaViewModel";
import { MOCK_AGENDA_LINKS, MOCK_AGENDA_VIEWER_ID } from "@/src/mocks/agendaViewer";
import { mockDomain } from "@/src/mocks/domain";

export default async function JogosPage() {
  // Prazos e "Hoje" dependem do momento do acesso: nada de pré-render no build
  await connection();
  const viewer = { playerId: MOCK_AGENDA_VIEWER_ID, now: new Date().toISOString() };
  const agenda = agendaViewModel(mockDomain, viewer, MOCK_AGENDA_LINKS);
  return (
    <>
      <AgendaHeader />
      <main>
        <AgendaView {...agenda} />
      </main>
    </>
  );
}
