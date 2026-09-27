"use client";

import { type ComponentProps } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
} & ComponentProps<"button">;

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.btn,
    styles[`btn--${variant}`],
    fullWidth && styles["btn--full-width"],
    disabled && styles["btn--disabled"],
    loading && styles["btn--loading"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.btn__spinner} />}
      <span className={loading ? styles["btn__content--hidden"] : undefined}>
        {children}
      </span>
    </button>
  );
}
