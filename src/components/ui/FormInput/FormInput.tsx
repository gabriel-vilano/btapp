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
import { focusNextField } from "./focusNextField";
import styles from "./FormInput.module.css";

export type FormInputType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "search"
  | "date"
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
  /** Texto de apoio abaixo do campo, lido junto com o rótulo. O erro toma o lugar dele. */
  hint?: string;
  valid?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric" | "tel" | "search";
  /**
   * Rótulo da tecla Enter do teclado virtual. Em `"next"`, o Enter passa o
   * foco ao próximo campo em vez de enviar o formulário. No `search`, o
   * padrão é `"search"`.
   */
  enterKeyHint?: "next" | "done" | "go" | "search" | "enter";
  disabled?: boolean;
  maxLength?: number;
  /**
   * Limites do `date` (`AAAA-MM-DD`) e do `datetime-local` (`AAAA-MM-DDTHH:mm`).
   * O picker do iOS não respeita: validar também no código.
   */
  min?: string;
  max?: string;
};

// Ícone à esquerda que diz o tipo do campo antes de qualquer valor
// (o date e o datetime-local vazios no iOS não mostram placeholder).
const LEADING_ICON: Partial<Record<FormInputType, ElementType>> = {
  search: MagnifyingGlassIcon,
  date: CalendarBlankIcon,
  "datetime-local": CalendarBlankIcon,
};

// Sem autocomplete, o iOS sugere e-mails e nomes salvos em cima do teclado
// de telefone e da busca.
const DEFAULT_AUTOCOMPLETE: Partial<Record<FormInputType, string>> = {
  tel: "tel",
  search: "off",
  "datetime-local": "off",
};

const DATE_TYPES: ReadonlySet<FormInputType> = new Set(["date", "datetime-local"]);

function buildFieldClasses(
  type: FormInputType,
  error?: string,
  valid?: boolean,
): string {
  return [
    styles["form-input__field"],
    LEADING_ICON[type] && styles["form-input__field--with-leading"],
    DATE_TYPES.has(type) && styles["form-input__field--datetime"],
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
  hint,
  valid,
  placeholder,
  autoComplete,
  inputMode,
  enterKeyHint,
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
  const resolvedEnterKeyHint =
    enterKeyHint ?? (type === "search" ? "search" : undefined);

  // O Enter de um formulário envia, não avança: sem isto, a tecla "Seguinte"
  // dispararia o envio com o resto dos campos vazio.
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (resolvedEnterKeyHint !== "next" || e.key !== "Enter") return;
    if (e.nativeEvent.isComposing) return;
    const input = e.currentTarget;
    if (focusNextField(input.form, input)) e.preventDefault();
  }

  const hintId = `${name}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

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
          enterKeyHint={resolvedEnterKeyHint}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          className={buildFieldClasses(type, error, valid)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
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
      {!error && hint && (
        <span id={hintId} className={styles["form-input__hint"]}>
          {hint}
        </span>
      )}
    </div>
  );
}
