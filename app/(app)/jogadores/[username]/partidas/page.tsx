import { notFound, redirect } from "next/navigation";
import { PlayerMatches, playerMatchesTitle } from "@/src/components/profile/PlayerMatches";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { OWN_HISTORY_PATH } from "@/src/lib/domain/profile-page";
import { MOCK_VIEWER, mockPlayerMatches } from "@/src/mocks/profilePage";

// Partidas de outro jogador (docs/PROFILE.md PF18), o "Ver todas" do perfil
// público, com os mocks até a integração com o Supabase.
// Tipo explícito em vez do `PageProps` global: ele só existe depois do
// `next typegen`, e o `npm run typecheck` da CI roda antes do build
interface PlayerMatchesPageProps {
  params: Promise<{ username: string }>;
}

export default async function PlayerMatchesPage({ params }: PlayerMatchesPageProps) {
  const { username } = await params;
  // O próprio histórico é o da aba Jogos (PF18): duas listas dele poderiam divergir
  if (username === MOCK_VIEWER.username) redirect(OWN_HISTORY_PATH);
  const data = mockPlayerMatches(username);
  if (data === null) notFound();
  // "Voltar" leva ao perfil de onde a lista abriu, não à raiz da aba
  return (
    <>
      <DetailHeader title={playerMatchesTitle(data)} parentHref={data.profile_href} />
      <main>
        <PlayerMatches data={data} />
      </main>
    </>
  );
}
