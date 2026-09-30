import { RankingTableSkeleton } from "@/src/components/ranking/RankingTableSkeleton";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// Carregando (RANKING.md 8.3, N23): o cabeçalho na hora e a tabela em esqueleto
export default function RankingLoading() {
  return (
    <>
      <DetailHeader title="Classificação" />
      <main>
        <RankingTableSkeleton />
      </main>
    </>
  );
}
