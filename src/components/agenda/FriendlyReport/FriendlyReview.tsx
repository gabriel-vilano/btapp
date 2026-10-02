"use client";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Dialog } from "@/src/components/ui/Dialog";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import type { PickablePlayer } from "@/src/components/ui/SidePicker";
import type { MatchSidePlayers } from "@/src/lib/domain/match-state";
import { toScore } from "@/src/lib/domain/profile-page/score";
import { formatPlayedDay } from "@/src/lib/formatters";
import type { FriendlyResult, MatchFormat } from "@/src/types/domain";
import { formatLabel, outcomeLabel } from "../ReportResult/reportResultModel";
import { winnerLine } from "../ReportResult/reportSummary";
import { friendlyRespondersText, friendlyVoiceOf, pendingFriendlyText, playedAtOf, venueOf } from "./friendlyReportModel";
import type { FriendlyOutcomeType, FriendlySendState } from "./useFriendlyReport";
import styles from "./FriendlyReport.module.css";

type FriendlyReviewProps = {
  open: boolean;
  type: FriendlyOutcomeType;
  format: MatchFormat;
  /** AAAA-MM-DD, como o campo de data. */
  playedOn: string;
  venue: string;
  result: FriendlyResult;
  sides: MatchSidePlayers;
  players: readonly PickablePlayer[];
  sendState: FriendlySendState;
  onClose: () => void;
  onSend: () => void;
};

const NETWORK_ERROR = "Não conseguimos enviar. Confira a conexão e tente de novo: o placar continua aqui.";

/**
 * Revisão antes do envio (RG7, §6.1): lados, quando e onde, formato, como
 * terminou, o placar e o que acontece depois. Sem pontos: amistoso não vale
 * ranking (R42), então a desistência também não mostra o placar completado.
 */
export function FriendlyReview(props: FriendlyReviewProps) {
  const { open, onClose, sendState } = props;
  return (
    <Dialog open={open} onClose={onClose} title="Revisar amistoso" footer={<ReviewActions {...props} />}>
      <div className={styles["friendly-report__review"]}>
        <ReviewSummary {...props} />
        {sendState.kind === "network_error" && <Alert status="attention" title={NETWORK_ERROR} />}
        {sendState.kind === "rejected" && <Alert status="attention" title={sendState.message} />}
      </div>
    </Dialog>
  );
}

function ReviewSummary({ type, format, playedOn, venue, result, sides, players }: FriendlyReviewProps) {
  const voice = friendlyVoiceOf(sides, players);
  const where = venueOf(venue);
  return (
    <>
      <p className={styles["friendly-report__review-sides"]}>
        {voice.names.a} × {voice.names.b}
      </p>
      <p className={styles["friendly-report__meta"]}>
        {[formatPlayedDay(playedAtOf(playedOn)), where, formatLabel(format)].filter(Boolean).join(" · ")}
      </p>
      <p className={styles["friendly-report__meta"]}>{outcomeLabel(type, "player")}</p>
      <p className={styles["friendly-report__winner"]}>{winnerLine(result, voice)}</p>
      <ScoreBlock score={toScore(result)} />
      <p className={styles["friendly-report__note"]}>
        {pendingFriendlyText(friendlyRespondersText(sides, players), voice.isSingles)}
      </p>
    </>
  );
}

function ReviewActions({ sendState, onClose, onSend }: FriendlyReviewProps) {
  if (sendState.kind === "rejected") {
    return (
      <Button fullWidth onClick={onClose}>
        Corrigir
      </Button>
    );
  }
  return (
    <div className={styles["friendly-report__actions"]}>
      <Button variant="secondary" fullWidth onClick={onClose}>
        Corrigir
      </Button>
      <Button fullWidth loading={sendState.kind === "sending"} onClick={onSend}>
        {sendState.kind === "network_error" ? "Tentar de novo" : "Enviar resultado"}
      </Button>
    </div>
  );
}
