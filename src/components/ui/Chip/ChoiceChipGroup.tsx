"use client";

import { type ReactNode } from "react";
import styles from "./Chip.module.css";

type ChoiceChipOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type ChoiceChipGroupProps = {
  label: string;
  hideLabel?: boolean;
  name: string;
  options: ChoiceChipOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Grupo de chips de escolha única, com rádios nativos: as setas do teclado trocam a opção.
 * @example <ChoiceChipGroup label="Games de quem perdeu" name="set-1" options={games} value={loserGames} onValueChange={setLoserGames} />
 */
export function ChoiceChipGroup({
  label,
  hideLabel = false,
  name,
  options,
  value,
  onValueChange,
  disabled = false,
  className,
}: ChoiceChipGroupProps) {
  const legendClass = hideLabel ? styles["chip-group__legend--hidden"] : styles["chip-group__legend"];

  return (
    <fieldset className={[styles["chip-group"], className].filter(Boolean).join(" ")} disabled={disabled}>
      <legend className={legendClass}>{label}</legend>
      <div className={styles["chip-group__options"]}>
        {options.map((option) => (
          <label key={option.value} className={styles["chip-choice"]}>
            <input
              type="radio"
              className={styles["chip-choice__input"]}
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onValueChange(option.value)}
            />
            <span className={styles.chip}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export type { ChoiceChipOption };
