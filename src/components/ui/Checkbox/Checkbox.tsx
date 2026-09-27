"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./Checkbox.module.css";

type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
} & Omit<ComponentProps<"input">, "type" | "checked" | "defaultChecked" | "onChange" | "children">;

/**
 * Caixa de marcação com rótulo clicável: a linha inteira alterna o valor.
 * @example <Checkbox name="phone-consent" label="Mostrar meu telefone…" checked={consent} onCheckedChange={setConsent} />
 */
export function Checkbox({
  label,
  checked,
  onCheckedChange,
  error,
  id,
  className,
  ...rest
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={[styles.checkbox, className].filter(Boolean).join(" ")}>
      <label className={styles.checkbox__row} htmlFor={inputId}>
        <input
          {...rest}
          id={inputId}
          type="checkbox"
          className={styles.checkbox__input}
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <span className={styles.checkbox__box}>
          <Icon icon={CheckIcon} size="sm" weight="bold" className={styles.checkbox__check} />
        </span>
        <span className={styles.checkbox__label}>{label}</span>
      </label>

      {error && (
        <span id={errorId} role="alert" className={styles.checkbox__error}>
          {error}
        </span>
      )}
    </div>
  );
}
