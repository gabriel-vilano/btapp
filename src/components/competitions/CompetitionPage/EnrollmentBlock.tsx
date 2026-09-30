"use client";

import { useId } from "react";
import { ButtonLink } from "@/src/components/ui/Button";
import type { CompetitionOrganizer } from "@/src/lib/domain/competition-page";
import { InterestToggle } from "./InterestToggle";
import styles from "./CompetitionPage.module.css";

interface EnrollmentBlockProps {
  organizer: CompetitionOrganizer;
  interested: boolean;
}

/**
 * "Como se inscrever" e "Tenho interesse", para quem não está inscrito
 * (docs/NAVIGATION.md, N33). No beta a inscrição entra por carga (R32), então
 * o caminho é o contato do organizador.
 */
export function EnrollmentBlock({ organizer, interested }: EnrollmentBlockProps) {
  const headingId = useId();
  return (
    <section className={styles["competition-page__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["competition-page__section-title"]}>
        Como se inscrever
      </h2>
      <div className={styles["competition-page__body"]}>
        <p className={styles["competition-page__text"]}>A inscrição é feita com o organizador, {organizer.name}.</p>
        <OrganizerContactInfo organizer={organizer} />
        <InterestToggle initialInterested={interested} />
      </div>
    </section>
  );
}

function OrganizerContactInfo({ organizer }: { organizer: CompetitionOrganizer }) {
  const { contact } = organizer;
  if (!contact) return null;
  return (
    <>
      <p className={`${styles["competition-page__text"]} ${styles["competition-page__contact"]}`}>{contact.text}</p>
      {contact.href && (
        // O contato é externo (WhatsApp, Instagram): abre fora do app
        <ButtonLink href={contact.href} variant="secondary" target="_blank" rel="noopener noreferrer">
          Falar com o organizador
        </ButtonLink>
      )}
    </>
  );
}
