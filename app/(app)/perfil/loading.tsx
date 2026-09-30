import { ProfilePageSkeleton } from "@/src/components/profile/ProfilePage";
import { AppHeader } from "@/src/components/ui/AppHeader";

export default function OwnProfileLoading() {
  return (
    <>
      <AppHeader title="Perfil" />
      <main>
        <ProfilePageSkeleton />
      </main>
    </>
  );
}
