"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { useToast } from "@/src/components/ui/Toast";
import type { RegisterInterest } from "@/src/lib/domain/competition-page";
import styles from "./InterestToggle.module.css";

export const INTEREST_ERROR_MESSAGE = "Não foi possível registrar. Tente de novo.";

interface InterestToggleProps {
  /** Interesse já marcado quando a página abre. */
  initialInterested: boolean;
  /** Registra ou desfaz o interesse. Mock até a persistência no Supabase (EX31). */
  registerInterest: RegisterInterest;
}

/**
 * "Tenho interesse" (docs/EXPLORE.md, EX29 a EX33): registra e desfaz o
 * interesse na competição. Privado: não avisa o organizador. O rótulo só muda
 * quando o registro dá certo; se falha, o botão fica como estava e um Toast avisa.
 * @example <InterestToggle initialInterested={false} registerInterest={registerCompetitionInterest.bind(null, slug)} />
 */
export function InterestToggle({ initialInterested, registerInterest }: InterestToggleProps) {
  const [interested, setInterested] = useState(initialInterested);
  const [sending, setSending] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const { showToast } = useToast();

  async function toggle() {
    const next = !interested;
    setSending(true);
    const registered = await registerInterest(next).then(
      (result) => result.ok,
      () => false, // queda de rede ou erro do servidor: o mesmo aviso
    );
    setSending(false);
    if (!registered) return showToast(INTEREST_ERROR_MESSAGE, "error");
    setInterested(next);
    setAnnouncement(next ? "Interesse registrado" : "Interesse removido");
  }

  // Sem aria-pressed: o rótulo já muda com o estado, e os dois juntos fariam o
  // leitor de tela dizer "Interesse registrado, pressionado" (WCAG 2.5.3)
  return (
    <div className={styles["interest-toggle"]}>
      <Button variant="secondary" loading={sending} onClick={toggle}>
        {interested ? (
          <>
            <Icon icon={CheckIcon} size="sm" /> Interesse registrado
          </>
        ) : (
          "Tenho interesse"
        )}
      </Button>
      <p className={styles["interest-toggle__note"]}>
        Só você vê. O organizador não é avisado.
      </p>
      <span className={styles["interest-toggle__announcement"]} aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

export type { InterestToggleProps };
