"use client";

import { XIcon } from "@phosphor-icons/react";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { IconButtonLink } from "@/src/components/ui/IconButton";
import type { FriendlyReportData } from "./friendlyReportData";
import { FriendlyReportForm } from "./FriendlyReportForm";
import type { SubmitFriendly } from "./submitFriendly";
import styles from "./FriendlyReport.module.css";

const AGENDA_HREF = "/jogos";

type FriendlyReportFlowProps = {
  data: FriendlyReportData;
  /** "Agora" do primeiro render, em ISO 8601. Vem do servidor, para o HTML e a hidratação concordarem. */
  now: string;
  /** Relógio das ações. As stories fixam o tempo por ele. */
  clock?: () => string;
  /** Envio do amistoso. Sem ele, vale o servidor local sobre os mocks (`reportFriendlyLocally`). */
  submit?: SubmitFriendly;
  /** Id do amistoso criado. Com o Supabase, quem gera é o banco. */
  createId?: () => string;
};

/**
 * Registrar amistoso, modal em tela cheia sobre a aba Jogos (docs/RESULTS.md
 * §6.1, NAVIGATION.md N4 e N19): "Fechar" e o fim do fluxo levam de volta à agenda.
 * @example <FriendlyReportFlow data={friendlyReportDataOf(viewerId)} now={new Date().toISOString()} />
 */
export function FriendlyReportFlow({ data, now, clock = systemClock, submit, createId = randomId }: FriendlyReportFlowProps) {
  return (
    <div className={styles["friendly-report"]}>
      <AppHeader title="Registrar amistoso" actions={<IconButtonLink href={AGENDA_HREF} icon={XIcon} label="Fechar" />} />
      <div className={styles["friendly-report__content"]}>
        <FriendlyReportForm data={data} now={now} clock={clock} submit={submit} createId={createId} />
      </div>
    </div>
  );
}

function systemClock(): string {
  return new Date().toISOString();
}

// `crypto.randomUUID` só existe em contexto seguro (HTTPS ou localhost), e o
// teste no iPhone pelo IP da rede é HTTP (CLAUDE.md > "iOS Chrome/Safari")
function randomId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export type { FriendlyReportFlowProps };
