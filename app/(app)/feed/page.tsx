import { connection } from "next/server";
import { PendingBlock } from "@/src/components/feed/PendingBlock";
import { pendingBlockModel } from "@/src/lib/agenda/pendingBlockModel";
import { MOCK_AGENDA_VIEWER_ID } from "@/src/mocks/agendaViewer";
import { mockDomain } from "@/src/mocks/domain";
import { ClearSignupPersistence } from "./ClearSignupPersistence";
import { LogoutForm } from "./LogoutForm";

export default async function FeedPage() {
  // Os prazos de "Sua vez" dependem do momento do acesso: nada de pré-render no build
  await connection();
  const pending = pendingBlockModel(mockDomain, { playerId: MOCK_AGENDA_VIEWER_ID, now: new Date().toISOString() });
  return (
    <main>
      <ClearSignupPersistence />
      <h1>Feed</h1>
      <PendingBlock {...pending} />
      <p>Placeholder — feed será implementado na Fase 4.</p>
      <LogoutForm />
    </main>
  );
}
