import { connection } from "next/server";
import { ExploreShowcase } from "@/src/components/explore/ExploreShowcase";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { mockExploreShowcase } from "@/src/mocks/explorePage";

// Vitrine do Explorar (docs/EXPLORE.md §3), com os mocks até a integração com
// o Supabase. O campo de busca entra com a tela da busca (EX1).
export default async function ExplorePage() {
  // Renderiza a cada acesso: prerenderizada, a página congelaria no build o
  // que está aberto e a rodada de cada ranking
  await connection();
  return (
    <>
      <AppHeader title="Explorar" />
      <main>
        <ExploreShowcase showcase={mockExploreShowcase(new Date().toISOString())} />
      </main>
    </>
  );
}
