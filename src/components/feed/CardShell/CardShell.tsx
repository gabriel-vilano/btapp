import type { ReactNode } from "react";
import styles from "./CardShell.module.css";

interface CardShellProps {
  header: ReactNode;
  body: ReactNode;
  footer: ReactNode;
}

export function CardShell({ header, body, footer }: CardShellProps) {
  return (
    <article className={styles.card}>
      {header}
      <div className={styles.card__body}>{body}</div>
      <div className={styles.card__divider} role="separator" />
      {footer}
    </article>
  );
}
