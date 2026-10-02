import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CompetitionPage } from "@/src/components/competitions/CompetitionPage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { isEnrolledInCompetition } from "@/src/lib/domain/competition-page";
import { competitionArrivalTab } from "@/src/lib/navigation/mainTabs";
import { mockCompetitionPageBySlug } from "@/src/mocks/competitionPage";
import { registerCompetitionInterest } from "./actions";

// Dados mockados até a integração com o Supabase: cada slug é uma relação do
// jogador com a competição (inscrito, admin, não inscrito)
export default async function CompetitionRoute({ params }: { params: Promise<{ competicao: string }> }) {
  // Renderiza a cada acesso: prerenderizada, a página congelaria o prazo da
  // rodada ("fecha em 3 dias") no momento do build
  await connection();
  const { competicao } = await params;
  const data = mockCompetitionPageBySlug(competicao);
  if (!data) notFound();
  // Quem chega de fora e não está inscrito cai no Explorar (N28): só a página sabe da inscrição
  return (
    <>
      <DetailHeader title={data.name} arrivalTab={competitionArrivalTab(isEnrolledInCompetition(data))} />
      <main>
        <CompetitionPage
          data={data}
          now={new Date().toISOString()}
          registerInterest={registerCompetitionInterest.bind(null, data.slug)}
        />
      </main>
    </>
  );
}
