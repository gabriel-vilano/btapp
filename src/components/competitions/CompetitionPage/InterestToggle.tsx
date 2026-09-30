"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./CompetitionPage.module.css";

interface InterestToggleProps {
  /** Interesse já marcado quando a página abre. */
  initialInterested: boolean;
  /** Avisa a mudança. Sem persistência ainda: no MVP, o interesse é mock (N33). */
  onChange?: (interested: boolean) => void;
}

/**
 * "Tenho interesse" (docs/NAVIGATION.md, N33): registra e desfaz o interesse
 * na competição. Privado: não avisa o organizador.
 * @example <InterestToggle initialInterested={false} />
 */
export function InterestToggle({ initialInterested, onChange }: InterestToggleProps) {
  const [interested, setInterested] = useState(initialInterested);
  const [announcement, setAnnouncement] = useState("");

  function toggle() {
    const next = !interested;
    setInterested(next);
    setAnnouncement(next ? "Interesse registrado" : "Interesse removido");
    onChange?.(next);
  }

  // Sem aria-pressed: o rótulo já muda com o estado, e os dois juntos fariam o
  // leitor de tela dizer "Interesse registrado, pressionado" (WCAG 2.5.3)
  return (
    <div className={styles["competition-page__interest"]}>
      <Button variant="secondary" onClick={toggle}>
        {interested ? (
          <>
            <Icon icon={CheckIcon} size="sm" /> Interesse registrado
          </>
        ) : (
          "Tenho interesse"
        )}
      </Button>
      <p className={`${styles["competition-page__text"]} ${styles["competition-page__text--secondary"]}`}>
        Só você vê. O organizador não é avisado.
      </p>
      <span className={styles["competition-page__visually-hidden"]} aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

export type { InterestToggleProps };
