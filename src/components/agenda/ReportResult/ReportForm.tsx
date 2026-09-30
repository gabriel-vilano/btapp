"use client";

import { useId } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { ChoiceChipGroup } from "@/src/components/ui/Chip";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import { ScoreInput, type ScoreInputType } from "@/src/components/ui/ScoreInput";
import { toScore } from "@/src/lib/domain/profile-page/score";
import type { MatchFormat, MatchSideKey } from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";
import {
  adminWinnerQuestion,
  displaySideNames,
  formatLabel,
  MATCH_FORMATS,
  OUTCOME_TYPES,
  outcomeLabel,
  sidesInDisplayOrder,
  viewerSideOf,
  type ReporterRole,
} from "./reportResultModel";
import { ReportReview } from "./ReportReview";
import { ReportSent } from "./ReportSent";
import { winnerLine, type SideVoice } from "./reportSummary";
import { scoreErrorMessage } from "./scoreErrorMessage";
import type { SubmitReport } from "./submitReport";
import { useReportResult, type ReportResultState } from "./useReportResult";
import styles from "./ReportResult.module.css";

type ReportFormProps = {
  data: ReportResultData;
  role: ReporterRole;
  now: string;
  clock: () => string;
  submit?: SubmitReport;
  matchHref: string;
};

/**
 * Formulário do lançamento numa tela só (docs/RESULTS.md §3): como terminou,
 * o placar set a set com a prévia da partida, e a revisão numa folha por cima.
 */
export function ReportForm({ data, role, now, clock, submit, matchHref }: ReportFormProps) {
  const flow = useReportResult(data, role, { initialNow: now, clock, submit });
  const voice: SideVoice = { names: displaySideNames(data, role), userSide: role === "player" ? viewerSideOf(data) : null, isSingles: data.isSingles };
  const { result, sendState } = flow;

  if (sendState.kind === "sent" && result.status === "valid") {
    return (
      <ReportSent data={data} result={result.result} reporterSide={flow.userSide} sentAt={sendState.at} matchHref={matchHref} />
    );
  }
  return (
    <>
      <OutcomeFields data={data} role={role} flow={flow} voice={voice} />
      <ScoreFields data={data} role={role} flow={flow} voice={voice} />
      <div className={styles["report-result__footer"]}>
        <Button fullWidth disabled={result.status !== "valid"} onClick={flow.openReview}>
          Revisar resultado
        </Button>
      </div>
      {result.status === "valid" && (
        <ReportReview
          open={flow.reviewOpen}
          data={data}
          role={role}
          type={flow.type}
          format={flow.format}
          result={result.result}
          voice={voice}
          reviewAt={flow.reviewAt}
          sendState={sendState}
          matchHref={matchHref}
          onClose={flow.closeReview}
          onSend={flow.send}
        />
      )}
    </>
  );
}

type FieldsProps = { data: ReportResultData; role: ReporterRole; flow: ReportResultState; voice: SideVoice };

/** Formato (só o admin do torneio troca, R29), como terminou (§3.2) e, para o admin, o vencedor (§5.3). */
function OutcomeFields({ data, role, flow, voice }: FieldsProps) {
  const name = useId();
  return (
    <>
      {role === "admin" && (
        <ChoiceChipGroup
          label="Formato desta partida"
          name={`${name}-format`}
          options={MATCH_FORMATS.map((format) => ({ value: format, label: formatLabel(format) }))}
          value={flow.format}
          onValueChange={(format) => flow.changeFormat(format as MatchFormat)}
        />
      )}
      <ChoiceChipGroup
        label="Como terminou?"
        name={`${name}-outcome`}
        options={OUTCOME_TYPES.map((type) => ({ value: type, label: outcomeLabel(type, role) }))}
        value={flow.type}
        onValueChange={(type) => flow.setType(type as ScoreInputType)}
      />
      {role === "admin" && flow.type !== "normal" && (
        <ChoiceChipGroup
          label={adminWinnerQuestion(flow.type)}
          name={`${name}-winner`}
          options={sidesInDisplayOrder(data).map((side) => ({ value: side, label: voice.names[side] }))}
          value={flow.adminWinner}
          onValueChange={(side) => flow.setAdminWinner(side as MatchSideKey)}
        />
      )}
    </>
  );
}

/** O placar pelo ScoreInput, com a prévia da partida inteira no ScoreBlock (§3.3). */
function ScoreFields({ data, role, flow, voice }: FieldsProps) {
  const { result } = flow;
  if (role === "admin" && flow.type !== "normal" && flow.adminWinner === null) return null;
  return (
    <>
      {flow.type === "wo" && data.ranking && (
        <p className={styles["report-result__note"]}>
          W.O. vale {data.ranking.scoringRule.wo_winner} para quem compareceu e {data.ranking.scoringRule.wo_absent} para
          quem faltou. Se o adversário contestar, o admin decide, olhando o histórico da marcação.
        </p>
      )}
      <ScoreInput
        format={flow.format}
        type={flow.type}
        userSide={flow.userSide}
        sideNames={voice.names}
        isSingles={data.isSingles}
        neutral={role === "admin"}
        value={flow.draft}
        onValueChange={flow.setDraft}
      />
      {result.status === "valid" && result.result.type !== "wo" && (
        <section className={styles["report-result__preview"]} aria-label="Como o placar vai ficar">
          <p className={styles["report-result__winner"]}>{winnerLine(result.result, voice)}</p>
          <ScoreBlock score={toScore(result.result)} />
        </section>
      )}
      {result.status === "invalid" && (
        <Alert status="attention" title={scoreErrorMessage(result.code, flow.format, [])} />
      )}
    </>
  );
}
