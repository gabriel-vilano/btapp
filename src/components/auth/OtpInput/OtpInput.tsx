"use client";

import { useRef, useEffect } from "react";
import { OTP_LENGTH } from "@/src/lib/validations";
import styles from "./OtpInput.module.css";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
};

export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  error,
  disabled,
}: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filtered = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(filtered);
  }

  const fieldClasses = [styles.otp__field, error && styles["otp__field--error"]]
    .filter(Boolean)
    .join(" ");

  const placeholder = "0".repeat(length);

  return (
    <div className={styles.otp}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        enterKeyHint="done"
        autoComplete="one-time-code"
        maxLength={length}
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={fieldClasses}
      />
      {error && <span className={styles.otp__error}>{error}</span>}
    </div>
  );
}
