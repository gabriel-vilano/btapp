"use client";

import type { Ref } from "react";
import { Button } from "@/src/components/ui/Button";
import { responseDeadline } from "@/src/lib/domain/match-state";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import { formatEventMoment } from "@/src/lib/formatters";
import type { MatchSideKey, RankingMatch } from "@/src/types/domain";
import { pointsPreview } from "../ReportResult/reportSummary";
import { voiceOf, type MatchResultActions, type MatchResultContext } from "./matchResultContext";
import { CardText, ResultCard, ResultScore } from "./ResultCard";
import { resultRoleOf, type ResultViewerRole } from "./resultRole";
import { actorName, responseDeadlineParts, sideOr, type ResponseDeadlineParts } from "./resultTexts";
import { UndoReportMenu } from "./UndoReportMenu";
import styles from "./MatchResult.module.css";

type AwaitingMatch = Extract<RankingMatch, { status: "awaiting_confirmation" }>;

type AwaitingCardProps = {
  match: AwaitingMatch;
  context: MatchResultContext;
  actions: MatchResultActions;
  now: string;
  titleRef: Ref<HTMLHeadingElement>;
};

const BADGE = [{ label: "Aguardando confirmação", tone: "accent" as const }];

/**
 * Aguardando confirmação (docs/RESULTS.md §4.1 e §4.3). O lado adversário
 * responde; quem lançou e o parceiro acompanham, e só quem lançou desfaz (RG16).
 */
export function AwaitingCard({ match, context, actions, now, titleRef }: AwaitingCardProps) {
  const { report } = match;
  const role = resultRoleOf(report, context.sides, context.viewerId);
  const deadline = responseDeadlineParts(responseDeadline(report.reported_at, context.responseDeadlineHours), now);
  const voice = voiceOf(context);
  const canUndo = role === "reporter" && !deadline.expired;
  return (
    <ResultCard
      badges={BADGE}
      title={awaitingTitle(match, context, role)}
      titleRef={titleRef}
      menu={canUndo && <UndoReportMenu actions={actions} />}
    >
      <CardText>{reportedLine(match, context, role)}</CardText>
      <ResultScore result={report.result} voice={voice} />
      {role !== "outsider" && (
        <CardText>{pointsPreview(report.result, match.format, context.scoringRule, voice)}</CardText>
      )}
      <DeadlineLine deadline={deadline} role={role} />
      {role === "responder" && !deadline.expired && <ResponseActions actions={actions} />}
    </ResultCard>
  );
}

function awaitingTitle(match: AwaitingMatch, context: MatchResultContext, role: ResultViewerRole): string {
  if (role === "responder") return `${actorName(match.report.reported_by, context.viewerId, context.playerNames)} lançou o resultado`;
  if (role === "outsider") return "Resultado lançado";
  return `Aguardando ${respondersOf(match, context)}`;
}

function reportedLine(match: AwaitingMatch, context: MatchResultContext, role: ResultViewerRole): string {
  const moment = formatEventMoment(match.report.reported_at);
  if (role === "responder") return `Lançado ${moment}.`;
  const reporter = actorName(match.report.reported_by, context.viewerId, context.playerNames);
  if (role === "outsider") return `${reporter} lançou ${moment}. Aguardando ${respondersOf(match, context)}.`;
  return `${reporter} lançou ${moment}.`;
}

/** Quem pode responder: o lado adversário de quem lançou. Ex.: "Caio ou Diego". */
function respondersOf(match: AwaitingMatch, context: MatchResultContext): string {
  const responderSide: MatchSideKey = sideOfPlayer(context.sides, match.report.reported_by) === "a" ? "b" : "a";
  return sideOr(context.sides[responderSide], context.playerNames);
}

// "Confirma sozinho em 18h (qui, 01/10, 21h10)": contagem e data lado a lado,
// e nas últimas 24h só a contagem fica na cor de atenção (RG9)
function DeadlineLine({ deadline, role }: { deadline: ResponseDeadlineParts; role: ResultViewerRole }) {
  if (deadline.expired) {
    return <CardText>O prazo de resposta acabou em {deadline.absolute}. O resultado vale como foi lançado.</CardText>;
  }
  const countdownClass = deadline.urgent ? styles["card__countdown--urgent"] : styles.card__countdown;
  return (
    <p className={styles.card__deadline}>
      {role === "responder" ? "Confirma sozinho " : "Sem resposta, confirma sozinho "}
      <span className={countdownClass}>{deadline.countdown}</span> ({deadline.absolute})
    </p>
  );
}

// Confirmar é a primária e não pede motivo; contestar é secundária e pede (RG10)
function ResponseActions({ actions }: { actions: MatchResultActions }) {
  return (
    <div className={styles.card__actions}>
      <Button fullWidth onClick={actions.confirm}>
        Confirmar
      </Button>
      <Button variant="secondary" fullWidth onClick={() => actions.openDialog("contest")}>
        Contestar
      </Button>
    </div>
  );
}
