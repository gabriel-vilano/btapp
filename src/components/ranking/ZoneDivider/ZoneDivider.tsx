import styles from "./ZoneDivider.module.css";

interface ZoneDividerProps {
  /** O que a linha significa. Ex.: "Classificam para a Saideira · 8 vagas". */
  label: string;
  /** Segunda linha, para o empate na última vaga. Ex.: "Empate na última vaga: decisão do admin". */
  detail?: string;
}

/**
 * Linha de corte da final na classificação (RANKING.md, RK13). Fica entre duas `<RankingList>`:
 * a das vagas e a de fora delas, que começa na posição seguinte (`start`).
 * Ex.: `<RankingList>…</RankingList><ZoneDivider label="Classificam para a Saideira · 8 vagas" /><RankingList start={9}>…</RankingList>`
 */
export function ZoneDivider({ label, detail }: ZoneDividerProps) {
  const accessibleName = detail ? `${label}. ${detail}` : label;
  // Fora da lista, e não um <li role="separator"> dentro dela: uma lista ARIA só pode ter
  // listitem como filho, e o axe reprova o separator ali (aria-required-children), com ou sem
  // role="list". Duas listas mantêm cada linha contada uma vez só, e a de fora recomeça a contagem.
  // Os filhos de um separator são apresentacionais, por isso o texto vai no aria-label
  return (
    <div className={styles["zone-divider"]} role="separator" aria-label={accessibleName}>
      <span className={styles["zone-divider__text"]}>
        <span className={styles["zone-divider__label"]}>{label}</span>
        {detail && <span>{detail}</span>}
      </span>
    </div>
  );
}
