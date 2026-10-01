import { notFound } from "next/navigation";
import { FriendsList, friendsListTitle } from "@/src/components/profile/FriendsList";
import { DetailHeader } from "@/src/components/shell/DetailHeader";
import { mockFriendsList } from "@/src/mocks/profilePage";

// Lista de amigos do jogador (docs/PROFILE.md PF5), com os mocks até a
// integração com o Supabase. O próprio jogador também chega por aqui: o
// número "amigos" do cabeçalho leva a esta rota em qualquer perfil.
// Tipo explícito em vez do `PageProps` global: ele só existe depois do
// `next typegen`, e o `npm run typecheck` da CI roda antes do build
interface FriendsListPageProps {
  params: Promise<{ username: string }>;
}

export default async function FriendsListPage({ params }: FriendsListPageProps) {
  const { username } = await params;
  const data = mockFriendsList(username);
  if (data === null) notFound();
  // "Voltar" leva ao perfil de onde a lista abriu, não à raiz da aba
  return (
    <>
      <DetailHeader title={friendsListTitle(data)} parentHref={data.profile_href} />
      <main>
        <FriendsList data={data} />
      </main>
    </>
  );
}
