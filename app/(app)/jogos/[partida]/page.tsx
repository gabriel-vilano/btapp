import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MatchScreen } from "@/src/components/agenda/MatchScreen";
import { matchScreenDataOf } from "@/src/mocks/matchScreen";

// Tela do confronto (docs/NAVIGATION.md N10, docs/SCHEDULING.md §6) sobre os
// mocks, vista pelo Lucas. Por enquanto só a partida do ranking: torneio e
// amistoso não têm marcação (M1), e as telas deles são de outras issues.
export default async function MatchPage({ params }: { params: Promise<{ partida: string }> }) {
  // Renderiza a cada acesso: prerenderizada no build, a página congelaria o
  // "agora" e as datas relativas dos mocks
  await connection();
  const { partida } = await params;
  const data = matchScreenDataOf(decodeURIComponent(partida));
  if (data === null) notFound();
  return (
    <main>
      <MatchScreen data={data} now={new Date().toISOString()} />
    </main>
  );
}
