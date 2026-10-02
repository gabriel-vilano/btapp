"use client"; // error boundaries são Client Components

import { H2HLoadError } from "@/src/components/h2h/H2HPage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// Erro de lados e resumo (HH22, N24): o erro ocupa a tela, e "Tentar de novo" refaz a carga
export default function H2HError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <>
      <DetailHeader title="H2H" titleAs="p" />
      <main>
        <H2HLoadError onRetry={unstable_retry} />
      </main>
    </>
  );
}
