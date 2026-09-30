import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ProfilePage } from "@/src/components/profile/ProfilePage";
import { OWN_PROFILE_PATH } from "@/src/lib/domain/profile-page";
import { MOCK_VIEWER, mockProfilePage } from "@/src/mocks/profilePage";

// Perfil de outro jogador (docs/PROFILE.md, N10), com os mocks até a
// integração com o Supabase.
// Tipo explícito em vez do `PageProps` global: ele só existe depois do
// `next typegen`, e o `npm run typecheck` da CI roda antes do build
interface PlayerProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  await connection();
  const { username } = await params;
  // O próprio perfil tem rota própria (N10): o link compartilhado de si mesmo leva a ela
  if (username === MOCK_VIEWER.username) redirect(OWN_PROFILE_PATH);
  const data = mockProfilePage(username);
  if (data === null) notFound();
  return (
    <main>
      <ProfilePage data={data} />
    </main>
  );
}
