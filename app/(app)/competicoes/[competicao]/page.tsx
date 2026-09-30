import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CompetitionPage } from "@/src/components/competitions/CompetitionPage";
import { mockCompetitionPageBySlug } from "@/src/mocks/competitionPage";

// Dados mockados até a integração com o Supabase: cada slug é uma relação do
// jogador com a competição (inscrito, admin, não inscrito)
export default async function CompetitionRoute({ params }: { params: Promise<{ competicao: string }> }) {
  // Renderiza a cada acesso: prerenderizada, a página congelaria o prazo da
  // rodada ("fecha em 3 dias") no momento do build
  await connection();
  const { competicao } = await params;
  const data = mockCompetitionPageBySlug(competicao);
  if (!data) notFound();
  return (
    <main>
      <CompetitionPage data={data} now={new Date().toISOString()} />
    </main>
  );
}
