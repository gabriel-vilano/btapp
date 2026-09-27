import styles from "./Spinner.module.css";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

type SpinnerProps = {
  /** Segue a escala do `<Icon />`: xs 12px, sm 16px, md 24px, lg 32px. */
  size?: SpinnerSize;
  /**
   * Texto para leitor de tela quando não há texto visível ao lado.
   * Sem ele, o spinner é decorativo (`aria-hidden`).
   */
  label?: string;
  className?: string;
};

/**
 * Indicador de carregamento em anel. A cor vem de `currentColor`.
 * @example <Spinner size="lg" label="Carregando ranking" />
 */
export function Spinner({ size = "md", label, className }: SpinnerProps) {
  const rootClasses = [styles.spinner, styles[`spinner--${size}`], className]
    .filter(Boolean)
    .join(" ");

  if (!label) {
    return <span className={rootClasses} aria-hidden="true" />;
  }

  return (
    <span className={rootClasses} role="status">
      <span className={styles.spinner__label}>{label}</span>
    </span>
  );
}

export type { SpinnerSize, SpinnerProps };
