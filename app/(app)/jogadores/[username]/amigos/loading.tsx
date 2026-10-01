import { FriendsListSkeleton } from "@/src/components/profile/FriendsList";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// Sem este arquivo, a lista herdaria o carregando do perfil (o de `[username]`)
export default function FriendsListLoading() {
  return (
    <>
      <DetailHeader title="Amigos" />
      <main>
        <FriendsListSkeleton />
      </main>
    </>
  );
}
