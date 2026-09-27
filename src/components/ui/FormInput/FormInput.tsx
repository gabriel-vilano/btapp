"use client";

import { useState, type ElementType, type ReactNode } from "react";
import {
  CalendarBlankIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import styles from "./FormInput.module.css";

export type FormInputType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "search"
  | "datetime-local";

type FormInputProps = {
  label: string;
  labelTrailing?: ReactNode;
  name: string;
  type?: FormInputType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  valid?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric" | "tel" | "search";
  disabled?: boolean;
  maxLength?: number;
  /**
   * Limites do `datetime-local`, no formato `AAAA-MM-DDTHH:mm`.
   * O picker do iOS não respeita: validar também no código.
   */
  min?: string;
  max?: string;
};

// Ícone à esquerda que diz o tipo do campo antes de qualquer valor
// (o datetime-local vazio no iOS não mostra placeholder).
const LEADING_ICON: Partial<Record<FormInputType, ElementType>> = {
  search: MagnifyingGlassIcon,
  "datetime-local": CalendarBlankIcon,
};

// Sem autocomplete, o iOS sugere e-mails e nomes salvos em cima do teclado
// de telefone e da busca.
const DEFAULT_AUTOCOMPLETE: Partial<Record<FormInputType, string>> = {
  tel: "tel",
  search: "off",
  "datetime-local": "off",
};

function buildFieldClasses(
  type: FormInputType,
  error?: string,
  valid?: boolean,
): string {
  return [
    styles["form-input__field"],
    LEADING_ICON[type] && styles["form-input__field--with-leading"],
    type === "datetime-local" && styles["form-input__field--datetime"],
    error && styles["form-input__field--error"],
    valid && !error && styles["form-input__field--valid"],
  ]
    .filter(Boolean)
    .join(" ");
}

function StatusIcon({
  valid,
  error,
}: {
  valid?: boolean;
  error?: string;
}) {
  if (error) {
    return (
      <span className={styles["form-input__icon--error"]}>
        <Icon icon={XIcon} size="sm" />
      </span>
    );
  }
  if (!valid) return null;
  return (
    <span className={styles["form-input__icon--valid"]}>
      <Icon icon={CheckIcon} size="sm" />
    </span>
  );
}

export function FormInput({
  label,
  labelTrailing,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  valid,
  placeholder,
  autoComplete,
  inputMode,
  disabled,
  maxLength,
  min,
  max,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const leadingIcon = LEADING_ICON[type];

  const showStatus = value.length > 0 && (valid || error);
  const errorId = `${name}-error`;

  return (
    <div className={styles["form-input"]}>
      <div className={styles["form-input__label-row"]}>
        <label className={styles["form-input__label"]} htmlFor={name}>
          {label}
        </label>
        {labelTrailing}
      </div>

      <div className={styles["form-input__wrapper"]}>
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete ?? DEFAULT_AUTOCOMPLETE[type]}
          inputMode={inputMode}
          enterKeyHint={type === "search" ? "search" : undefined}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          className={buildFieldClasses(type, error, valid)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />

        {leadingIcon && (
          <span className={styles["form-input__leading"]}>
            <Icon icon={leadingIcon} size="sm" />
          </span>
        )}

        <span className={styles["form-input__trailing"]}>
          {isPassword && (
            <button
              type="button"
              className={styles["form-input__toggle"]}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              <Icon icon={showPassword ? EyeSlashIcon : EyeIcon} size="sm" />
            </button>
          )}

          {!isPassword && showStatus && (
            <StatusIcon valid={valid} error={error} />
          )}
        </span>
      </div>

      {error && (
        <span
          id={errorId}
          role="alert"
          className={styles["form-input__error"]}
        >
          {error}
        </span>
      )}
    </div>
  );
}
