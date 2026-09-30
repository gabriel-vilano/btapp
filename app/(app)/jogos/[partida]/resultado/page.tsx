import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ReportResultFlow } from "@/src/components/agenda/ReportResult";
import { reportResultDataOf } from "@/src/mocks/reportResult";

// Lançar o resultado (docs/RESULTS.md §3, NAVIGATION.md N18) sobre os mocks,
// visto pelo Lucas. É rota de tarefa (N4): a casca esconde a TabBar e o
// NavigationRail aqui (shell/AppShell/taskRoutes.ts), sem desmontar.
export default async function ReportResultPage({ params }: { params: Promise<{ partida: string }> }) {
  // Renderiza a cada acesso: o "agora" conta o prazo de resposta da revisão
  await connection();
  const { partida } = await params;
  const data = reportResultDataOf(decodeURIComponent(partida));
  if (data === null) notFound();
  return (
    <main>
      <ReportResultFlow data={data} now={new Date().toISOString()} />
    </main>
  );
}
