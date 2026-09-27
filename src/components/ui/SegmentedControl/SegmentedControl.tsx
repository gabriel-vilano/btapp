"use client";

import { type ReactNode } from "react";
import styles from "./SegmentedControl.module.css";

type SegmentedControlOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type SegmentedControlProps = {
  label: string;
  hideLabel?: boolean;
  name: string;
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Escolha única entre 2 a 4 visões da mesma tela, com rádios nativos: as setas trocam o segmento.
 * @example <SegmentedControl label="Recorte" hideLabel name="h2h-recorte" options={recortes} value={recorte} onValueChange={setRecorte} />
 */
export function SegmentedControl({
  label,
  hideLabel = false,
  name,
  options,
  value,
  onValueChange,
  disabled = false,
  className,
}: SegmentedControlProps) {
  const legendClass = hideLabel
    ? styles["segmented__legend--hidden"]
    : styles.segmented__legend;

  return (
    <fieldset className={[styles.segmented, className].filter(Boolean).join(" ")} disabled={disabled}>
      <legend className={legendClass}>{label}</legend>
      <div className={styles.segmented__track}>
        {options.map((option) => (
          <label key={option.value} className={styles.segmented__option}>
            <input
              type="radio"
              className={styles.segmented__input}
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onValueChange(option.value)}
            />
            <span className={styles.segmented__segment}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export type { SegmentedControlOption };
