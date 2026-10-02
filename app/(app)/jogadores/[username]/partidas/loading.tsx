import { PlayerMatchesSkeleton } from "@/src/components/profile/PlayerMatches";
import { DetailHeader } from "@/src/components/shell/DetailHeader";

// Sem este arquivo, a lista herdaria o carregando do perfil (o de `[username]`)
export default function PlayerMatchesLoading() {
  return (
    <>
      <DetailHeader title="Partidas" />
      <main>
        <PlayerMatchesSkeleton />
      </main>
    </>
  );
}
