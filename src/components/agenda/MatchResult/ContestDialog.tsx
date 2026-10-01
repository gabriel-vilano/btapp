"use client";

import { useState } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { ChoiceChipGroup } from "@/src/components/ui/Chip";
import { Dialog } from "@/src/components/ui/Dialog";
import { EMPTY_SCORE_DRAFT, ScoreInput, type ScoreDraft } from "@/src/components/ui/ScoreInput";
import type { ContestDetails, ContestReason, MatchFormat, MatchSideKey } from "@/src/types/domain";
import type { SideVoice } from "../ReportResult/reportSummary";
import { contestDetailsOf } from "./contestDetails";
import { CONTEST_REASON_LABEL, CONTEST_REASONS } from "./resultTexts";
import styles from "./MatchResult.module.css";

type ContestDialogProps = {
  format: MatchFormat;
  /** Lados como a tela escreve, com o de quem contesta como "Você e Pedro". */
  voice: SideVoice;
  userSide: MatchSideKey;
  competitionName: string;
  /** Recusa do domínio, já em texto. */
  error: string | null;
  onClose: () => void;
  onContest: (details: ContestDetails) => void;
};

const REASON_OPTIONS = CONTEST_REASONS.map((reason) => ({ value: reason, label: CONTEST_REASON_LABEL[reason] }));

/**
 * Folha de contestar (docs/RESULTS.md §4.2, RG15): diz o que acontece depois,
 * pede o motivo, obrigatório, e, com "placar diferente", o placar lembrado,
 * opcional. Montada só enquanto aberta, então sempre começa em branco.
 * @example {open && <ContestDialog format="one_set_of_6" voice={voice} userSide="b" competitionName="Ranking BH" … />}
 */
export function ContestDialog({ format, voice, userSide, competitionName, error, onClose, onContest }: ContestDialogProps) {
  const [reason, setReason] = useState<ContestReason | null>(null);
  const [draft, setDraft] = useState<ScoreDraft>(EMPTY_SCORE_DRAFT);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    const details = contestDetailsOf(reason, draft, { format, userSide });
    if (typeof details === "string") return setFormError(details);
    setFormError(null);
    onContest(details);
  };
  const message = formError ?? error;

  return (
    <Dialog
      open
      onClose={onClose}
      title="Contestar o resultado"
      description={`O resultado vai para o admin do ${competitionName}, que define o placar. Até lá, a partida não pontua.`}
      footer={<ContestActions onCancel={onClose} onSubmit={submit} />}
    >
      <div className={styles.contest}>
        <ChoiceChipGroup
          label="Motivo"
          name="contest-reason"
          options={REASON_OPTIONS}
          value={reason}
          onValueChange={(value) => setReason(CONTEST_REASONS.find((candidate) => candidate === value) ?? null)}
        />
        {reason === "different_score" && (
          <RememberedScore format={format} voice={voice} userSide={userSide} draft={draft} onDraftChange={setDraft} />
        )}
        {message && <Alert status="attention" title={message} />}
      </div>
    </Dialog>
  );
}

type RememberedScoreProps = Pick<ContestDialogProps, "format" | "voice" | "userSide"> & {
  draft: ScoreDraft;
  onDraftChange: (draft: ScoreDraft) => void;
};

// Opcional: começado, pode ser limpo, para contestar sem placar
function RememberedScore({ format, voice, userSide, draft, onDraftChange }: RememberedScoreProps) {
  return (
    <div className={styles.contest__score}>
      <p className={styles.contest__hint}>Se quiser, informe o placar que você lembra. O admin vê os dois.</p>
      <ScoreInput
        format={format}
        type="normal"
        userSide={userSide}
        sideNames={voice.names}
        isSingles={voice.isSingles}
        value={draft}
        onValueChange={onDraftChange}
      />
      {draft !== EMPTY_SCORE_DRAFT && (
        <Button variant="ghost" fullWidth onClick={() => onDraftChange(EMPTY_SCORE_DRAFT)}>
          Limpar placar
        </Button>
      )}
    </div>
  );
}

function ContestActions({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: () => void }) {
  return (
    <div className={styles.dialog__actions}>
      <Button variant="secondary" fullWidth onClick={onCancel}>
        Cancelar
      </Button>
      <Button fullWidth onClick={onSubmit}>
        Contestar resultado
      </Button>
    </div>
  );
}
