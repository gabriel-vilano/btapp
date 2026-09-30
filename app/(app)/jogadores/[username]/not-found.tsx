import { PlayerNotFound } from "@/src/components/profile/ProfilePage";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// "Jogador não encontrado" (docs/PROFILE.md §6.2): nada revela se a conta existiu
export default function PlayerProfileNotFound() {
  return (
    <>
      <DetailHeader title="Perfil" />
      <main>
        <PlayerNotFound />
      </main>
    </>
  );
}
