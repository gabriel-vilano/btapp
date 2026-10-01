import { formatFormGuideLabel, type H2HOutcome } from "../h2hText";
import styles from "./FormGuide.module.css";

interface FormGuideProps {
  /** Resultados da mais antiga para a mais recente. Mostra até 5: com mais, ficam as 5 últimas. */
  results: readonly H2HOutcome[];
  /** De quem é a forma ("Lucas", "Lucas e Rafael"), para o nome acessível. */
  label: string;
}

const MAX_RESULTS = 5;

const LETTER: Record<H2HOutcome, string> = { win: "V", loss: "D" };

/**
 * A forma recente de um lado: um círculo com V ou D por partida, a mais recente à direita (HH12).
 * @example <FormGuide results={["win", "win", "loss"]} label="Lucas" />
 */
export function FormGuide({ results, label }: FormGuideProps) {
  const recent = results.slice(-MAX_RESULTS);
  if (recent.length === 0) {
    return (
      <p className={styles["form-guide__empty"]}>
        <span className={styles["visually-hidden"]}>{label}: </span>
        Sem partidas
      </p>
    );
  }
  // role="img": o grupo vira uma imagem com nome por extenso, e as letras não são lidas uma a uma
  return (
    <div className={styles["form-guide"]} role="img" aria-label={formatFormGuideLabel(recent, label)}>
      {recent.map((result, i) => (
        <span key={i} className={`${styles["form-guide__result"]} ${styles[`form-guide__result--${result}`]}`}>
          {LETTER[result]}
        </span>
      ))}
    </div>
  );
}

export type { FormGuideProps };
