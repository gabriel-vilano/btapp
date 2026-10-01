import { AppHeader } from "@/src/components/ui/AppHeader";
import { ButtonLink } from "@/src/components/ui/Button";

/** Rota do registro de amistoso (N19, docs/RESULTS.md §6.1). */
export const FRIENDLY_HREF = "/jogos/amistoso";

/**
 * Topo da aba Jogos: título e "Registrar amistoso", fixo no topo (N19). Não
 * depende de dado do servidor: aparece na hora, inclusive no carregando (N23).
 */
export function AgendaHeader() {
  return (
    <AppHeader
      title="Jogos"
      actions={
        <ButtonLink href={FRIENDLY_HREF} variant="ghost">
          Registrar amistoso
        </ButtonLink>
      }
    />
  );
}
