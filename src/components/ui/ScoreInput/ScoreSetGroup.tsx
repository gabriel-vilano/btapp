import { useId, type ReactNode } from "react";
import styles from "./ScoreInput.module.css";

type ScoreSetGroupProps = {
  title: string;
  /** Frase da prévia; vazia enquanto o set não fecha. */
  preview: string;
  /** Mensagem de erro do set, ligada ao grupo por `aria-describedby`. */
  error?: string;
  children: ReactNode;
};

/** Moldura de um set: título, campos e a prévia, que o leitor de tela anuncia ao mudar. */
export function ScoreSetGroup({ title, preview, error, children }: ScoreSetGroupProps) {
  const titleId = useId();
  const errorId = useId();

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-describedby={error ? errorId : undefined}
      className={styles["score-set"]}
    >
      <p id={titleId} className={styles["score-set__title"]}>
        {title}
      </p>
      {children}
      {error && (
        <p id={errorId} role="alert" className={styles["score-set__error"]}>
          {error}
        </p>
      )}
      {/* A região viva existe desde o início: o leitor de tela só anuncia mudanças numa região já montada */}
      <p aria-live="polite" className={styles["score-set__preview"]}>
        {preview}
      </p>
    </div>
  );
}
