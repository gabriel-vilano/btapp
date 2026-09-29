"use client";

import { useId } from "react";
import type { MatchSideKey } from "@/src/types/domain";
import { ChoiceChipGroup, type ChoiceChipOption } from "@/src/components/ui/Chip";
import { gamesSetFrom, type GamesSetEntry } from "./scoreDraft";
import { otherSide, setPreview, setTitle, sideReference, type ScorePerspective } from "./scorePreview";
import { ScoreSetGroup } from "./ScoreSetGroup";
import styles from "./ScoreInput.module.css";

type GamesSetFieldProps = {
  index: number;
  target: 6 | 8;
  entry: GamesSetEntry;
  /** Lado que não pode vencer este set: fecharia a partida antes da desistência. */
  blockedWinner: MatchSideKey | null;
  perspective: ScorePerspective;
  onEntryChange: (entry: GamesSetEntry) => void;
};

function winnerOptions(perspective: ScorePerspective, blocked: MatchSideKey | null): ChoiceChipOption[] {
  const { userSide, sideNames } = perspective;
  return [userSide, otherSide(userSide)].map((side) => ({
    value: side,
    label: sideNames[side],
    disabled: side === blocked,
  }));
}

// 0 ao alvo: no set de 6, 5 e 6 viram 7/5 e 7/6 (R29)
function gamesOptions(target: number): ChoiceChipOption[] {
  return Array.from({ length: target + 1 }, (_, games) => ({ value: String(games), label: games }));
}

/** Set completo em dois toques: quem venceu e os games de quem perdeu (RG12), com a prévia (RG13). */
export function GamesSetField({ index, target, entry, blockedWinner, perspective, onEntryChange }: GamesSetFieldProps) {
  const name = useId();
  const set = gamesSetFrom(entry, target);
  const loser = entry.winner === null ? null : otherSide(entry.winner);
  const gridClass = target === 8 ? styles["score-set__games--grid"] : undefined;

  return (
    <ScoreSetGroup title={setTitle(index, "games", target)} preview={set ? setPreview(set, perspective) : ""}>
      <ChoiceChipGroup
        label="Quem venceu o set?"
        name={`${name}-winner`}
        options={winnerOptions(perspective, blockedWinner)}
        value={entry.winner}
        onValueChange={(side) => onEntryChange({ ...entry, winner: side as MatchSideKey })}
      />
      {loser !== null && (
        <ChoiceChipGroup
          label={`Games de ${sideReference(loser, perspective)}`}
          name={`${name}-games`}
          options={gamesOptions(target)}
          value={entry.loserGames === null ? null : String(entry.loserGames)}
          onValueChange={(games) => onEntryChange({ ...entry, loserGames: Number(games) })}
          optionsClassName={gridClass}
        />
      )}
    </ScoreSetGroup>
  );
}
