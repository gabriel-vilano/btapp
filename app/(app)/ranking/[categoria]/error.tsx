"use client"; // error boundaries são Client Components

import { RankingLoadError } from "@/src/components/ranking/RankingLoadError";
import { AppHeader } from "@/src/components/ui/AppHeader";

// Erro (RANKING.md 8.3, N24): o cabeçalho fica e "Tentar de novo" refaz a carga
export default function RankingError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <>
      <AppHeader title="Classificação" backHref="/competicoes" />
      <main>
        <RankingLoadError onRetry={unstable_retry} />
      </main>
    </>
  );
}
