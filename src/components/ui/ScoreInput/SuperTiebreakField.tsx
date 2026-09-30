"use client";

import { useId, useState } from "react";
import type { MatchSideKey } from "@/src/types/domain";
import { FormInput } from "@/src/components/ui/FormInput";
import { isInvalidSuperTiebreak, superTiebreakSetFrom } from "./scoreDraft";
import {
  otherSide,
  scoreFromUserSide,
  setPreview,
  setTitle,
  sideReference,
  type ScorePerspective,
} from "./scorePreview";
import { ScoreSetGroup } from "./ScoreSetGroup";
import styles from "./ScoreInput.module.css";

type SuperTiebreakFieldProps = {
  points: Record<MatchSideKey, string>;
  perspective: ScorePerspective;
  onPointsChange: (points: Record<MatchSideKey, string>) => void;
};

function errorFor(points: Record<MatchSideKey, string>, perspective: ScorePerspective): string | undefined {
  const set = superTiebreakSetFrom(points);
  if (set === null || !isInvalidSuperTiebreak(points)) return undefined;
  const score = scoreFromUserSide(set, perspective.userSide);
  return `${score} não fecha o super tiebreak. Vence quem chega a 10 com 2 de vantagem, como 10/8 ou 12/10.`;
}

/**
 * Super tiebreak do 1 set a 1, em dois campos numéricos (docs/RESULTS.md §3.3).
 * O erro espera o jogador sair do campo: enquanto digita "12", o "1" não é erro.
 */
export function SuperTiebreakField({ points, perspective, onPointsChange }: SuperTiebreakFieldProps) {
  const name = useId();
  const [touched, setTouched] = useState(false);
  const set = superTiebreakSetFrom(points);
  const error = touched ? errorFor(points, perspective) : undefined;
  const preview = set && !isInvalidSuperTiebreak(points) ? setPreview(set, perspective) : "";
  const sides = [perspective.userSide, otherSide(perspective.userSide)];

  return (
    <ScoreSetGroup title={setTitle(2, "super_tiebreak", 10)} preview={preview} error={error}>
      <div className={styles["score-set__sides"]}>
        {sides.map((side) => (
          <FormInput
            key={side}
            label={`Pontos de ${sideReference(side, perspective)}`}
            name={`${name}-${side}`}
            value={points[side]}
            inputMode="numeric"
            maxLength={2}
            autoComplete="off"
            onChange={(event) => onPointsChange({ ...points, [side]: event.target.value.replace(/\D/g, "") })}
            onBlur={() => setTouched(true)}
          />
        ))}
      </div>
    </ScoreSetGroup>
  );
}
