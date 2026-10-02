import { connection } from "next/server";
import { FriendlyReportFlow } from "@/src/components/agenda/FriendlyReport";
import { friendlyReportDataOf } from "@/src/mocks/friendlyReport";

// Registrar amistoso (docs/RESULTS.md §6.1, NAVIGATION.md N19) sobre os mocks,
// visto pelo Lucas. É rota de tarefa (N4): a casca esconde a TabBar e o
// NavigationRail aqui (shell/AppShell/taskRoutes.ts), sem desmontar. A pasta
// estática vence o `[partida]` vizinho, então "amistoso" nunca é lido como id.
export default async function FriendlyReportPage() {
  // Renderiza a cada acesso: o "hoje" padrão da data é o do acesso
  await connection();
  return (
    <main>
      <FriendlyReportFlow data={friendlyReportDataOf()} now={new Date().toISOString()} />
    </main>
  );
}
