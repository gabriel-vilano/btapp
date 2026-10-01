"use client";

import { useId } from "react";
import { OrganizationContact } from "@/src/components/ui/OrganizationContact";
import { TextLink } from "@/src/components/ui/TextLink";
import { organizationHref, type CompetitionOrganizer, type RegisterInterest } from "@/src/lib/domain/competition-page";
import { readOrganizationContact } from "@/src/lib/organizationContact";
import { InterestToggle } from "@/src/components/competitions/InterestToggle";
import styles from "./CompetitionPage.module.css";

interface EnrollmentBlockProps {
  organizer: CompetitionOrganizer;
  /** `full`: no topo, com "Tenho interesse"; `compact`: abaixo das categorias, só o contato. */
  placement: "full" | "compact";
  interested: boolean;
  registerInterest: RegisterInterest;
}

/**
 * "Como se inscrever" (docs/EXPLORE.md, EX26 a EX28). No beta a inscrição
 * entra por carga (R32), então o caminho é o contato da organização. A forma
 * completa leva o "Tenho interesse"; a compacta, de quem já joga outra
 * categoria, não (EX27).
 */
export function EnrollmentBlock({ organizer, placement, interested, registerInterest }: EnrollmentBlockProps) {
  const headingId = useId();
  const compact = placement === "compact";
  const sectionClass = compact ? styles["competition-page__section--compact"] : styles["competition-page__section"];
  const titleClass = compact ? styles["competition-page__compact-title"] : styles["competition-page__section-title"];
  return (
    <section className={sectionClass} aria-labelledby={headingId}>
      <h2 id={headingId} className={titleClass}>
        Como se inscrever
      </h2>
      <div className={styles["competition-page__body"]}>
        <OrganizerContactInfo organizer={organizer} />
        {!compact && <InterestToggle initialInterested={interested} registerInterest={registerInterest} />}
      </div>
    </section>
  );
}

// Sem contato, a linha leva à página da organização, onde ela pode ser procurada (EX28)
function OrganizerContactInfo({ organizer }: { organizer: CompetitionOrganizer }) {
  if (readOrganizationContact(organizer.contact) === null) {
    return (
      <p className={styles["competition-page__text"]}>
        A inscrição é feita com o organizador,{" "}
        <TextLink href={organizationHref(organizer.username)}>{organizer.name}</TextLink>.
      </p>
    );
  }
  return (
    <>
      <p className={styles["competition-page__text"]}>A inscrição é feita com o organizador.</p>
      <OrganizationContact contact={organizer.contact} linkLabel="Falar com o organizador" />
    </>
  );
}
