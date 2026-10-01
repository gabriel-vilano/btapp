"use client";

import { useId } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { ChoiceChipGroup } from "@/src/components/ui/Chip";
import { FormInput } from "@/src/components/ui/FormInput";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import { ScoreInput } from "@/src/components/ui/ScoreInput";
import { SegmentedControl } from "@/src/components/ui/SegmentedControl";
import { SidePicker, type SideModality } from "@/src/components/ui/SidePicker";
import { brasiliaToday } from "@/src/lib/brasiliaDateTime";
import { toScore } from "@/src/lib/domain/profile-page/score";
import type { MatchFormat } from "@/src/types/domain";
import { formatLabel, MATCH_FORMATS, outcomeLabel } from "../ReportResult/reportResultModel";
import { winnerLine } from "../ReportResult/reportSummary";
import { scoreErrorMessage } from "../ReportResult/scoreErrorMessage";
import type { FriendlyReportData } from "./friendlyReportData";
import { friendlyVoiceOf } from "./friendlyReportModel";
import { FriendlyReview } from "./FriendlyReview";
import { FriendlySent } from "./FriendlySent";
import type { SubmitFriendly } from "./submitFriendly";
import { useFriendlyReport, type FriendlyOutcomeType, type FriendlyReportState } from "./useFriendlyReport";
import styles from "./FriendlyReport.module.css";

type FriendlyReportFormProps = {
  data: FriendlyReportData;
  now: string;
  clock: () => string;
  submit?: SubmitFriendly;
  createId: () => string;
};

const MODALITY_OPTIONS = [
  { value: "singles", label: "Simples" },
  { value: "doubles", label: "Duplas" },
];

// Sem W.O. no amistoso (R44)
const OUTCOME_TYPES: FriendlyOutcomeType[] = ["normal", "retired"];

/**
 * Formulário do amistoso numa tela só, na ordem da §6.1: modalidade, lados,
 * data e arena, formato, como terminou e o placar, com a revisão numa folha por cima.
 */
export function FriendlyReportForm({ data, now, clock, submit, createId }: FriendlyReportFormProps) {
  const flow = useFriendlyReport(data, { initialNow: now, clock, submit, createId });
  const { sides, result, sendState } = flow;

  if (sendState.kind === "sent" && sides !== null) {
    return <FriendlySent match={sendState.match} sides={sides} players={data.players} />;
  }
  return (
    <>
      <SegmentedControl
        label="Modalidade"
        name="friendly-modality"
        options={MODALITY_OPTIONS}
        value={flow.modality}
        onValueChange={(value) => flow.changeModality(value as SideModality)}
      />
      <SidePicker
        modality={flow.modality}
        self={data.viewer}
        players={data.players}
        value={flow.slots}
        onValueChange={flow.setSlots}
      />
      <WhenAndWhere flow={flow} now={now} />
      <MatchFields flow={flow} />
      <ScoreFields data={data} flow={flow} />
      <div className={styles["friendly-report__footer"]}>
        <Button fullWidth disabled={!flow.canReview} onClick={flow.openReview}>
          Revisar resultado
        </Button>
      </div>
      {sides !== null && result.status === "valid" && result.result.type !== "wo" && (
        <FriendlyReview
          open={flow.reviewOpen}
          type={flow.type}
          format={flow.format}
          playedOn={flow.playedOn}
          venue={flow.venue}
          result={result.result}
          sides={sides}
          players={data.players}
          sendState={sendState}
          onClose={flow.closeReview}
          onSend={flow.send}
        />
      )}
    </>
  );
}

type FlowProps = { flow: FriendlyReportState };

/** Data obrigatória, hoje por padrão e nunca no futuro; arena opcional, em texto (§6.1). */
function WhenAndWhere({ flow, now }: FlowProps & { now: string }) {
  return (
    <div className={styles["friendly-report__fields"]}>
      <FormInput
        label="Data do jogo"
        name="friendly-played-on"
        type="date"
        value={flow.playedOn}
        max={brasiliaToday(new Date(now))}
        onChange={(event) => flow.setPlayedOn(event.target.value)}
        error={flow.dateError ?? undefined}
      />
      <FormInput
        label="Arena (opcional)"
        name="friendly-venue"
        value={flow.venue}
        placeholder="Ex.: Arena Mangaba"
        maxLength={120}
        onChange={(event) => flow.setVenue(event.target.value)}
      />
    </div>
  );
}

/** Formato, escolhido por quem lança (R29), e como terminou: sem W.O. (R44). */
function MatchFields({ flow }: FlowProps) {
  const name = useId();
  return (
    <>
      <ChoiceChipGroup
        label="Formato"
        name={`${name}-format`}
        options={MATCH_FORMATS.map((format) => ({ value: format, label: formatLabel(format) }))}
        value={flow.format}
        onValueChange={(format) => flow.changeFormat(format as MatchFormat)}
      />
      <ChoiceChipGroup
        label="Como terminou?"
        name={`${name}-outcome`}
        options={OUTCOME_TYPES.map((type) => ({ value: type, label: outcomeLabel(type, "player") }))}
        value={flow.type}
        onValueChange={(type) => flow.setType(type as FriendlyOutcomeType)}
      />
    </>
  );
}

// O placar fala dos lados pelo nome: até os lados estarem completos, não há com quem jogar
function ScoreFields({ data, flow }: FlowProps & { data: FriendlyReportData }) {
  const { sides, result } = flow;
  if (sides === null) {
    return <p className={styles["friendly-report__note"]}>Escolha os lados para informar o placar.</p>;
  }
  const voice = friendlyVoiceOf(sides, data.players);
  return (
    <>
      <ScoreInput
        format={flow.format}
        type={flow.type}
        userSide="a"
        sideNames={voice.names}
        isSingles={voice.isSingles}
        value={flow.draft}
        onValueChange={flow.setDraft}
      />
      {result.status === "valid" && result.result.type !== "wo" && (
        <section className={styles["friendly-report__preview"]} aria-label="Como o placar vai ficar">
          <p className={styles["friendly-report__winner"]}>{winnerLine(result.result, voice)}</p>
          <ScoreBlock score={toScore(result.result)} />
        </section>
      )}
      {result.status === "invalid" && <Alert status="attention" title={scoreErrorMessage(result.code, flow.format, [])} />}
    </>
  );
}
