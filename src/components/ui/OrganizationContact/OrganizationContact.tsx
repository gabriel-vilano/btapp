import { ButtonLink } from "@/src/components/ui/Button";
import { readOrganizationContact } from "@/src/lib/organizationContact";
import styles from "./OrganizationContact.module.css";

export interface OrganizationContactProps {
  /** O contato como a organização informou: link ou texto. */
  contact: string | null;
  /** Rótulo do botão quando o contato é link: "Falar com Arena Mangaba" (EX22), "Falar com o organizador" (EX28). */
  linkLabel: string;
}

/**
 * Contato da organização (docs/EXPLORE.md, EX22 e EX28): link https vira
 * botão que abre fora do app; texto aparece como foi escrito, selecionável.
 * Sem contato, não renderiza nada, e quem usa decide o que mostrar no lugar.
 */
export function OrganizationContact({ contact, linkLabel }: OrganizationContactProps) {
  const view = readOrganizationContact(contact);
  if (view === null) return null;
  if (view.kind === "text") return <p className={styles["organization-contact__text"]}>{view.text}</p>;
  return (
    // O contato é externo (WhatsApp, Instagram, site): abre fora do app
    <ButtonLink href={view.href} variant="secondary" target="_blank" rel="noopener noreferrer">
      {linkLabel}
    </ButtonLink>
  );
}
