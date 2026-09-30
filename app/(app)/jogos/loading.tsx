import { AgendaHeader, AgendaSkeleton } from "@/src/components/agenda/AgendaView";

// O cabeçalho aparece na hora; só o conteúdo espera (N23).
export default function JogosLoading() {
  return (
    <main>
      <AgendaHeader />
      <AgendaSkeleton />
    </main>
  );
}
