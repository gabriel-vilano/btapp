"use client"; // error boundaries são Client Components

import { RankingLoadError } from "@/src/components/ranking/RankingLoadError";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// Erro (RANKING.md 8.3, N24): o cabeçalho fica e "Tentar de novo" refaz a carga
export default function RankingError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <>
      <DetailHeader title="Classificação" />
      <main>
        <RankingLoadError onRetry={unstable_retry} />
      </main>
    </>
  );
}
