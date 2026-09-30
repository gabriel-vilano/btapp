"use client";

import { Alert } from "@/src/components/ui/Alert";
import { Button, ButtonLink } from "@/src/components/ui/Button";
import { Dialog } from "@/src/components/ui/Dialog";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import type { ScoreInputType } from "@/src/components/ui/ScoreInput";
import { toScore } from "@/src/lib/domain/profile-page/score";
import type { MatchFormat, ReportableResult } from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";
import { outcomeLabel, sidesInDisplayOrder, type ReporterRole } from "./reportResultModel";
import { completedScoreText, pointsPreview, responseDeadlineText, winnerLine, type SideVoice } from "./reportSummary";
import type { SendState } from "./useReportResult";
import styles from "./ReportResult.module.css";

type ReportReviewProps = {
  open: boolean;
  data: ReportResultData;
  role: ReporterRole;
  type: ScoreInputType;
  format: MatchFormat;
  result: ReportableResult;
  voice: SideVoice;
  /** Momento da revisão: o prazo de resposta conta a partir dele. */
  reviewAt: string;
  sendState: SendState;
  matchHref: string;
  onClose: () => void;
  onSend: () => void;
};

const NETWORK_ERROR = "Não conseguimos enviar. Confira a conexão e tente de novo: o placar continua aqui.";

/**
 * Revisão antes do envio (RG7), numa folha sobre o formulário: lados, como
 * terminou, placar (completado, na desistência, RG6), pontos previstos (RG14) e prazo.
 * @example <ReportReview open data={data} role="player" type="normal" format={format} result={result} … />
 */
export function ReportReview(props: ReportReviewProps) {
  const { open, onClose, sendState } = props;
  return (
    <Dialog open={open} onClose={onClose} title="Revisar resultado" footer={<ReviewActions {...props} />}>
      <div className={styles["report-result__review"]}>
        <ReviewSummary {...props} />
        {sendState.kind === "network_error" && <Alert status="attention" title={NETWORK_ERROR} />}
        {sendState.kind === "rejected" && <Alert status="attention" title={sendState.message} />}
      </div>
    </Dialog>
  );
}

function ReviewSummary({ data, role, type, format, result, voice, reviewAt }: ReportReviewProps) {
  const [first, second] = sidesInDisplayOrder(data);
  return (
    <>
      <p className={styles["report-result__review-sides"]}>
        {voice.names[first]} × {voice.names[second]}
      </p>
      <p className={styles["report-result__meta"]}>{outcomeLabel(type, role)}</p>
      <p className={styles["report-result__winner"]}>{winnerLine(result, voice)}</p>
      <ScoreBlock score={toScore(result)} />
      {result.type === "retired" && <p className={styles["report-result__note"]}>{completedScoreText(result, format, voice)}</p>}
      {data.ranking && (
        <p className={styles["report-result__note"]}>{pointsPreview(result, format, data.ranking.scoringRule, voice)}</p>
      )}
      <p className={styles["report-result__note"]}>{responseDeadlineText(data, voice.userSide ?? "a", reviewAt)}</p>
    </>
  );
}

function ReviewActions({ sendState, matchHref, onClose, onSend }: ReportReviewProps) {
  if (sendState.kind === "rejected" && !sendState.canFix) {
    return <ButtonLink href={matchHref} fullWidth>Ver a partida</ButtonLink>;
  }
  if (sendState.kind === "rejected") {
    return <Button fullWidth onClick={onClose}>Corrigir</Button>;
  }
  return (
    <div className={styles["report-result__actions"]}>
      <Button variant="secondary" fullWidth onClick={onClose}>
        Corrigir
      </Button>
      <Button fullWidth loading={sendState.kind === "sending"} onClick={onSend}>
        {sendState.kind === "network_error" ? "Tentar de novo" : "Enviar resultado"}
      </Button>
    </div>
  );
}
