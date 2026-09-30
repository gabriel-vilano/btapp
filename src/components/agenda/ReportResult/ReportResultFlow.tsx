"use client";

import { XIcon } from "@phosphor-icons/react";
import { Alert } from "@/src/components/ui/Alert";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { ButtonLink } from "@/src/components/ui/Button";
import { IconButtonLink } from "@/src/components/ui/IconButton";
import { ReportForm } from "./ReportForm";
import { ReportHeading } from "./ReportHeading";
import type { ReportResultData } from "./reportResultData";
import { reporterRoleOf } from "./reportResultModel";
import type { SubmitReport } from "./submitReport";
import { changedStatusMessage, notAllowedMessage } from "./transitionErrorMessage";
import styles from "./ReportResult.module.css";

type ReportResultFlowProps = {
  data: ReportResultData;
  /** "Agora" do primeiro render, em ISO 8601. Vem do servidor, para o HTML e a hidratação concordarem. */
  now: string;
  /** Relógio das ações. As stories fixam o tempo por ele. */
  clock?: () => string;
  /** Envio do lançamento. Sem ele, vale o servidor local sobre os mocks (`reportLocally`). */
  submit?: SubmitReport;
};

/**
 * Fluxo de lançar o resultado, modal em tela cheia sobre a partida
 * (docs/RESULTS.md §3 e §5.3, NAVIGATION.md N4 e N18): "Fechar" e o fim do
 * fluxo levam de volta à partida. Jogador no ranking, admin no torneio.
 * @example <ReportResultFlow data={reportResultDataOf(matchId)} now={new Date().toISOString()} />
 */
export function ReportResultFlow({ data, now, clock = systemClock, submit }: ReportResultFlowProps) {
  const role = reporterRoleOf(data);
  const matchHref = `/jogos/${encodeURIComponent(data.match.id)}`;
  const blocked = role === null ? notAllowedMessage(data) : blockedByStatus(data);

  return (
    <div className={styles["report-result"]}>
      <AppHeader title="Lançar resultado" actions={<IconButtonLink href={matchHref} icon={XIcon} label="Fechar" />} />
      <div className={styles["report-result__content"]}>
        <ReportHeading data={data} role={role ?? "player"} />
        {role === null || blocked !== null ? (
          <BlockedNotice message={blocked ?? notAllowedMessage(data)} matchHref={matchHref} />
        ) : (
          <ReportForm data={data} role={role} now={now} clock={clock} submit={submit} matchHref={matchHref} />
        )}
      </div>
    </div>
  );
}

// Aberto pelo link de uma partida que já saiu de Confronto definido (outro
// jogador lançou, o admin decidiu): mostra o motivo antes do formulário.
function blockedByStatus(data: ReportResultData): string | null {
  return data.match.status === "defined" ? null : changedStatusMessage(data, data.match);
}

function BlockedNotice({ message, matchHref }: { message: string; matchHref: string }) {
  return (
    <>
      <Alert status="attention" title={message} />
      <ButtonLink href={matchHref} fullWidth>
        Ver a partida
      </ButtonLink>
    </>
  );
}

function systemClock(): string {
  return new Date().toISOString();
}

export type { ReportResultFlowProps };
