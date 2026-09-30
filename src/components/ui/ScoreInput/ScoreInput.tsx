"use client";

import { useId } from "react";
import type { MatchFormat, MatchSideKey } from "@/src/types/domain";
import { setKindsOf } from "@/src/lib/domain/matchScore";
import { ChoiceChipGroup, type ChoiceChipOption } from "@/src/components/ui/Chip";
import { GamesSetField } from "./GamesSetField";
import { InterruptedSetField } from "./InterruptedSetField";
import { SuperTiebreakField } from "./SuperTiebreakField";
import { scoreSlots, type GamesSetEntry, type ScoreDraft, type ScoreInputType, type ScoreSlot } from "./scoreDraft";
import { sideReference, type ScorePerspective } from "./scorePreview";
import styles from "./ScoreInput.module.css";

type ScoreInputProps = {
  format: MatchFormat;
  /** Como terminou: jogo até o fim, desistência do adversário ou W.O. */
  type: ScoreInputType;
  /** Lado de quem lança. A prévia fala com ele ("para vocês"). */
  userSide: MatchSideKey;
  /** Nome de cada lado, como no cabeçalho da partida. Ex.: `{ a: "Você e Pedro", b: "Lucas e Rafael" }`. */
  sideNames: Record<MatchSideKey, string>;
  /** Partida de simples: "você" no lugar de "vocês". */
  isSingles?: boolean;
  value: ScoreDraft;
  onValueChange: (draft: ScoreDraft) => void;
  className?: string;
};

const INTERRUPTED_SET_NAMES = ["1º set", "2º set", "Super tiebreak"];

function interruptedOptions(format: MatchFormat): ChoiceChipOption[] {
  return setKindsOf(format).map((_, index) => ({ value: String(index), label: INTERRUPTED_SET_NAMES[index] }));
}

function withGamesSet(draft: ScoreDraft, index: number, entry: GamesSetEntry): ScoreDraft {
  const gamesSets = [...draft.gamesSets];
  gamesSets[index] = entry;
  return { ...draft, gamesSets: Array.from(gamesSets, (set) => set ?? { winner: null, loserGames: null }) };
}

/**
 * Entrada de placar set a set, que só deixa montar placar válido (docs/RESULTS.md §3.3 e §3.4).
 * Controlado: o consumidor guarda o `ScoreDraft` e lê o resultado com `draftToResult`.
 * @example <ScoreInput format="one_set_of_6" type="normal" userSide="a" sideNames={names} value={draft} onValueChange={setDraft} />
 */
export function ScoreInput({ format, type, userSide, sideNames, isSingles = false, value, onValueChange, className }: ScoreInputProps) {
  const name = useId();
  const perspective: ScorePerspective = { userSide, sideNames, isSingles };
  const askInterruptedSet = type === "retired" && setKindsOf(format).length > 1;

  function renderSlot(slot: ScoreSlot) {
    if (slot.kind === "games") {
      return (
        <GamesSetField
          key={`games-${slot.index}`}
          {...slot}
          perspective={perspective}
          onEntryChange={(entry) => onValueChange(withGamesSet(value, slot.index, entry))}
        />
      );
    }
    if (slot.kind === "super_tiebreak") {
      return (
        <SuperTiebreakField
          key="super-tiebreak"
          points={value.superTiebreak}
          perspective={perspective}
          onPointsChange={(superTiebreak) => onValueChange({ ...value, superTiebreak })}
        />
      );
    }
    return (
      <InterruptedSetField
        key={`interrupted-${slot.index}`}
        index={slot.index}
        setKind={slot.setKind}
        score={value.interrupted}
        perspective={perspective}
        onScoreChange={(interrupted) => onValueChange({ ...value, interrupted })}
      />
    );
  }

  return (
    <div className={[styles["score-input"], className].filter(Boolean).join(" ")}>
      {type === "wo" && (
        <p className={styles["score-input__note"]}>
          W.O. não tem placar. A vitória fica com {sideReference(userSide, perspective)}.
        </p>
      )}
      {askInterruptedSet && (
        <ChoiceChipGroup
          label="Em que set foi a desistência?"
          name={`${name}-interrupted`}
          options={interruptedOptions(format)}
          value={value.interruptedIndex === null ? null : String(value.interruptedIndex)}
          // O placar parcial é de outro set: recomeça em 0/0
          onValueChange={(index) => onValueChange({ ...value, interruptedIndex: Number(index), interrupted: { a: 0, b: 0 } })}
        />
      )}
      {scoreSlots(value, format, type).map(renderSlot)}
    </div>
  );
}
