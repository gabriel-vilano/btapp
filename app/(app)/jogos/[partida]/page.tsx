import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MatchScreen } from "@/src/components/agenda/MatchScreen";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { loadOwnPhone } from "@/src/lib/supabase/ownPhone";
import { matchScreenDataOf } from "@/src/mocks/matchScreen";

// Tela do confronto (docs/NAVIGATION.md N10, docs/SCHEDULING.md §6 e
// docs/RESULTS.md §4) sobre os mocks, vista pelo Lucas. Por enquanto só a partida do ranking: torneio e
// amistoso não têm marcação (M1), e as telas deles são de outras issues.
export default async function MatchPage({ params }: { params: Promise<{ partida: string }> }) {
  // Renderiza a cada acesso: prerenderizada no build, a página congelaria o
  // "agora" e as datas relativas dos mocks
  await connection();
  const { partida } = await params;
  const data = matchScreenDataOf(decodeURIComponent(partida));
  if (data === null) notFound();
  // O confronto ainda é dos mocks, mas o telefone é do jogador logado, lido do
  // Supabase: só ele decide se o "Abrir no WhatsApp" pergunta pelo número (M20).
  // Na falha da leitura, não pergunta: o pedido é opcional
  const ownPhone = await loadOwnPhone();
  return (
    <>
      <DetailHeader title="Confronto" />
      <main>
        <MatchScreen data={data} now={new Date().toISOString()} askForPhone={ownPhone === null} />
      </main>
    </>
  );
}
