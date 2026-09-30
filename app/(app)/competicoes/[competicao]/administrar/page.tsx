import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AdminArea } from "@/src/components/admin/AdminArea";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { mockAdminAreaBySlug } from "@/src/mocks/adminArea";

// Área "Administrar" da competição (docs/NAVIGATION.md N31) sobre os mocks,
// vista pelo Lucas. Quem não é admin da competição recebe 404, como numa
// competição que não existe: a rota não revela que a área existe. Com o
// Supabase, a guarda passa a ser a consulta (RLS), não o mock.
export default async function AdminAreaRoute({ params }: { params: Promise<{ competicao: string }> }) {
  // Renderiza a cada acesso: prerenderizada, a página congelaria o prazo da
  // rodada no momento do build
  await connection();
  const { competicao } = await params;
  const data = mockAdminAreaBySlug(competicao);
  if (!data) notFound();
  return (
    <main>
      <DetailHeader title="Administrar" />
      <AdminArea data={data} now={new Date().toISOString()} />
    </main>
  );
}
