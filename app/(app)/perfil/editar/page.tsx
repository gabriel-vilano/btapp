import { checkUsername } from "@/app/(auth)/actions";
import { EditProfileForm, EditProfileLoadError } from "@/src/components/profile/EditProfile";
import { brasiliaToday } from "@/src/lib/brasiliaDateTime";
import { updateProfile } from "./actions";
import { loadEditableProfile } from "./editableProfile";

// "Editar perfil" (docs/PROFILE.md PF9). É rota de tarefa (N4): a casca esconde a
// TabBar e o NavigationRail aqui (shell/AppShell/taskRoutes.ts), sem desmontar.
// Lê e grava o Supabase de verdade, ao contrário do /perfil, que ainda usa os mocks.
export default async function EditProfilePage() {
  const profile = await loadEditableProfile();
  return (
    <main>
      {profile === null ? (
        <EditProfileLoadError />
      ) : (
        <EditProfileForm
          profile={profile}
          today={brasiliaToday()}
          saveProfile={updateProfile}
          checkUsername={checkUsername}
        />
      )}
    </main>
  );
}
