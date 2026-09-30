import { ButtonLink } from "@/src/components/ui/Button";
import styles from "./AgendaView.module.css";

/** Rota proposta do registro de amistoso (N19). O fluxo é de outra issue. */
export const FRIENDLY_HREF = "/jogos/amistoso";

/**
 * Topo da aba Jogos: título e "Registrar amistoso", fixo no topo (N19). Não
 * depende de dado do servidor: aparece na hora, inclusive no carregando (N23).
 */
export function AgendaHeader() {
  return (
    <header className={styles["agenda-header"]}>
      <h1 className={styles["agenda-header__title"]}>Jogos</h1>
      <ButtonLink href={FRIENDLY_HREF} variant="secondary">
        Registrar amistoso
      </ButtonLink>
    </header>
  );
}
