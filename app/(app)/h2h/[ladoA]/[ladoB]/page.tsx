import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { H2HPage } from "@/src/components/h2h/H2HPage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { isCanonicalH2HRequest } from "@/src/lib/domain/h2h-page";
import { mockH2HPage } from "@/src/mocks/h2hPage";

// Página de H2H (docs/HEAD_TO_HEAD.md, HH5), com os mocks até a integração
// com o Supabase. A aba marcada é a de origem; de fora do app, o Feed (N28).
// Tipo explícito em vez do `PageProps` global: ele só existe depois do
// `next typegen`, e o `npm run typecheck` da CI roda antes do build
interface H2HRoutePageProps {
  params: Promise<{ ladoA: string; ladoB: string }>;
}

export default async function H2HRoutePage({ params }: H2HRoutePageProps) {
  await connection();
  const { ladoA, ladoB } = await params;
  const result = mockH2HPage(ladoA, ladoB);
  if (result.status === "not_found") notFound();
  if (!isCanonicalH2HRequest(ladoA, ladoB)) redirect(result.canonical_path);
  // O h1 é o confronto por extenso, no conteúdo (§7): o título do topo vai como `p`
  return (
    <>
      <DetailHeader title="H2H" titleAs="p" />
      <main>
        <H2HPage view={result.view} />
      </main>
    </>
  );
}
