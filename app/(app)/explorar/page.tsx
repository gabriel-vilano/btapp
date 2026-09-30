import { CompassIcon } from "@phosphor-icons/react/ssr";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { EmptyState } from "@/src/components/ui/EmptyState";

// Provisória até a vitrine e a busca do Explorar (docs/NAVIGATION.md §7)
export default function ExplorePage() {
  return (
    <>
      <AppHeader title="Explorar" />
      <main>
        <EmptyState
          icon={CompassIcon}
          title="Explorar chega em breve."
          description="Aqui vão aparecer as competições e as arenas para você jogar, e a busca de jogadores."
        />
      </main>
    </>
  );
}
