import { notFound } from "next/navigation";
import { connection } from "next/server";
import { OrganizationPage } from "@/src/components/explore/OrganizationPage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { mockOrganizationPage } from "@/src/mocks/explorePage";

// Página da organização (docs/EXPLORE.md, EX22): o slug é o @username. Dados
// mockados até a integração com o Supabase.
// Tipo explícito em vez do `PageProps` global: ele só existe depois do
// `next typegen`, e o `npm run typecheck` da CI roda antes do build
interface OrganizationRouteProps {
  params: Promise<{ organizacao: string }>;
}

export default async function OrganizationRoute({ params }: OrganizationRouteProps) {
  // Renderiza a cada acesso: o que está aberto depende do dia
  await connection();
  const { organizacao } = await params;
  const data = mockOrganizationPage(organizacao, new Date().toISOString());
  if (data === null) notFound();
  // O h1 é o nome, no conteúdo: o @username do topo vai como `p`, como no perfil
  return (
    <>
      <DetailHeader title={`@${data.username}`} titleAs="p" />
      <main>
        <OrganizationPage data={data} />
      </main>
    </>
  );
}
