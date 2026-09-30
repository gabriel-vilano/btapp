import { PlayerNotFound } from "@/src/components/profile/ProfilePage";

// "Jogador não encontrado" (docs/PROFILE.md §6.2): nada revela se a conta existiu
export default function PlayerProfileNotFound() {
  return (
    <main>
      <PlayerNotFound />
    </main>
  );
}
