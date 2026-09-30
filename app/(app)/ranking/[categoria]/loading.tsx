import { RankingTableSkeleton } from "@/src/components/ranking/RankingTableSkeleton";
import { AppHeader } from "@/src/components/ui/AppHeader";

// Carregando (RANKING.md 8.3, N23): o cabeçalho na hora e a tabela em esqueleto
export default function RankingLoading() {
  return (
    <>
      <AppHeader title="Classificação" backHref="/competicoes" />
      <main>
        <RankingTableSkeleton />
      </main>
    </>
  );
}
