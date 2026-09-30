import { ProfilePageSkeleton } from "@/src/components/profile/ProfilePage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

export default function PlayerProfileLoading() {
  return (
    <>
      <DetailHeader title="Perfil" />
      <main>
        <ProfilePageSkeleton />
      </main>
    </>
  );
}
