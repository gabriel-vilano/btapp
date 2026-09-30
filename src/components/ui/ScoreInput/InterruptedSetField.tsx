"use client";

import type { MatchSideKey } from "@/src/types/domain";
import type { SetKind } from "@/src/lib/domain/setRules";
import { Stepper } from "@/src/components/ui/Stepper";
import { interruptedBounds, targetOf } from "./scoreDraft";
import { otherSide, setPreview, sideReference, type ScorePerspective } from "./scorePreview";
import { ScoreSetGroup } from "./ScoreSetGroup";
import styles from "./ScoreInput.module.css";

type InterruptedSetFieldProps = {
  index: number;
  setKind: SetKind;
  score: Record<MatchSideKey, number>;
  perspective: ScorePerspective;
  onScoreChange: (score: Record<MatchSideKey, number>) => void;
};

function titleFor(index: number, kind: SetKind): string {
  return kind.type === "super_tiebreak" ? "Super tiebreak · interrompido" : `Set ${index + 1} · interrompido`;
}

/**
 * Set em que houve a desistência (docs/RESULTS.md §3.4): ainda sem vencedor,
 * então cada lado ganha um Stepper com o placar parcial.
 */
export function InterruptedSetField({ index, setKind, score, perspective, onScoreChange }: InterruptedSetFieldProps) {
  const target = targetOf(setKind);
  const unit = setKind.type === "super_tiebreak" ? "Pontos" : "Games";
  const sides = [perspective.userSide, otherSide(perspective.userSide)];
  const set = { games_a: score.a, games_b: score.b, super_tiebreak: false, interrupted: true };

  return (
    <ScoreSetGroup title={titleFor(index, setKind)} preview={setPreview(set, perspective)}>
      <div className={styles["score-set__steppers"]}>
        {sides.map((side) => (
          <Stepper
            key={side}
            label={`${unit} de ${sideReference(side, perspective)}`}
            value={score[side]}
            {...interruptedBounds(score[otherSide(side)], target)}
            onValueChange={(value) => onScoreChange({ ...score, [side]: value })}
          />
        ))}
      </div>
    </ScoreSetGroup>
  );
}
