"use client";

import { useId, type KeyboardEvent, type MouseEvent } from "react";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./Stepper.module.css";

type StepperProps = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
  className?: string;
};

// Teclas do APG Spinbutton: setas andam de 1 em 1, Home e End vão aos limites
function valueForKey(key: string, value: number, min: number, max: number): number | null {
  if (key === "ArrowUp") return value + 1;
  if (key === "ArrowDown") return value - 1;
  if (key === "Home") return min;
  if (key === "End") return max;
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Os botões não pegam o foco no clique: ao chegar no limite eles ficam
// desabilitados, e o foco que estivesse neles cairia no <body>.
function keepFocus(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

/**
 * Número inteiro ajustado de 1 em 1 entre `min` e `max` (APG Spinbutton).
 * @example <Stepper label="Games de Lucas e Rafael" value={games} onValueChange={setGames} min={0} max={6} />
 */
export function Stepper({
  label,
  value,
  onValueChange,
  min,
  max,
  disabled = false,
  className,
}: StepperProps) {
  const labelId = useId();
  const valueId = useId();

  function change(next: number) {
    const clamped = clamp(next, min, max);
    if (!disabled && clamped !== value) onValueChange(clamped);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = valueForKey(event.key, value, min, max);
    if (next === null) return;
    event.preventDefault();
    change(next);
  }

  return (
    <div className={[styles.stepper, className].filter(Boolean).join(" ")}>
      <span id={labelId} className={styles.stepper__label}>
        {label}
      </span>

      <div className={styles.stepper__controls}>
        <button
          type="button"
          tabIndex={-1}
          className={styles.stepper__button}
          aria-label={`Diminuir ${label}`}
          aria-controls={valueId}
          disabled={disabled || value <= min}
          onMouseDown={keepFocus}
          onClick={() => change(value - 1)}
        >
          <span className={styles.stepper__circle}>
            <Icon icon={MinusIcon} size="sm" weight="bold" />
          </span>
        </button>

        <div
          id={valueId}
          role="spinbutton"
          tabIndex={disabled ? -1 : 0}
          className={styles.stepper__value}
          aria-labelledby={labelId}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
        >
          {value}
        </div>

        <button
          type="button"
          tabIndex={-1}
          className={styles.stepper__button}
          aria-label={`Aumentar ${label}`}
          aria-controls={valueId}
          disabled={disabled || value >= max}
          onMouseDown={keepFocus}
          onClick={() => change(value + 1)}
        >
          <span className={styles.stepper__circle}>
            <Icon icon={PlusIcon} size="sm" weight="bold" />
          </span>
        </button>
      </div>
    </div>
  );
}
