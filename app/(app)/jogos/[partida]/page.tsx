import { notFound } from "next/navigation";
import { connection } from "next/server";
import { FriendlyScreen } from "@/src/components/agenda/FriendlyScreen";
import { MatchScreen } from "@/src/components/agenda/MatchScreen";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { loadOwnPhone } from "@/src/lib/supabase/ownPhone";
import { friendlyScreenDataOf } from "@/src/mocks/friendlyScreen";
import { matchScreenDataOf } from "@/src/mocks/matchScreen";

// Tela do confronto (docs/NAVIGATION.md N10, docs/SCHEDULING.md §6 e
// docs/RESULTS.md §4) sobre os mocks, vista pelo Lucas. O amistoso usa a mesma
// rota, com a tela dele, sem marcação nem prazo (RESULTS.md §6.2). O torneio
// não tem marcação (M1), e a tela dele é de outra issue.
export default async function MatchPage({ params }: { params: Promise<{ partida: string }> }) {
  // Renderiza a cada acesso: prerenderizada no build, a página congelaria o
  // "agora" e as datas relativas dos mocks
  await connection();
  const { partida } = await params;
  const matchId = decodeURIComponent(partida);
  const now = new Date().toISOString();
  const friendly = friendlyScreenDataOf(matchId);
  if (friendly !== null) {
    return (
      <>
        <DetailHeader title="Amistoso" />
        <main>
          <FriendlyScreen data={friendly} now={now} />
        </main>
      </>
    );
  }
  const data = matchScreenDataOf(matchId);
  if (data === null) notFound();
  // O amistoso não tem marcação nem WhatsApp: o telefone só é lido aqui.
  // O confronto ainda é dos mocks, mas o telefone é do jogador logado, lido do
  // Supabase: só ele decide se o "Abrir no WhatsApp" pergunta pelo número (M20).
  // Na falha da leitura, não pergunta: o pedido é opcional
  const ownPhone = await loadOwnPhone();
  return (
    <>
      <DetailHeader title="Confronto" />
      <main>
        <MatchScreen data={data} now={now} askForPhone={ownPhone === null} />
      </main>
    </>
  );
}
