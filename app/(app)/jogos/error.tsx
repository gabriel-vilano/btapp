"use client";

import { AgendaError, AgendaHeader } from "@/src/components/agenda/AgendaView";

// O erro fica no lugar do conteúdo, e o cabeçalho continua funcionando (N24).
export default function JogosError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <>
      <AgendaHeader />
      <main>
        <AgendaError onRetry={unstable_retry} />
      </main>
    </>
  );
}
