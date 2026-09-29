import { connection } from "next/server";
import { CompetitionsTab } from "@/src/components/competitions/CompetitionsTab";
import { mockCompetitionsTab } from "@/src/mocks/competitionsTab";

// Dados mockados até a integração com o Supabase: o cenário do admin mostra
// o bloco de pendências e a lista juntos (docs/NAVIGATION.md §6)
export default async function CompetitionsPage() {
  // Renderiza a cada acesso: prerenderizada no build, a página congelaria as
  // datas relativas dos mocks e o "próximo jogo" viraria passado
  await connection();
  return (
    <main>
      <CompetitionsTab data={mockCompetitionsTab.admin} />
    </main>
  );
}
