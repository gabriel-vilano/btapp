import { Skeleton } from "@/src/components/ui/Skeleton";
import styles from "./RankingTableSkeleton.module.css";

const ROWS = 8;

/**
 * Tabela carregando (RANKING.md 8.3): 8 linhas no formato do RankingRow — posição,
 * avatar, duas linhas de texto e o bloco dos pontos. Nada de spinner em tela cheia (N23).
 * Ex.: `<RankingTableSkeleton />`
 */
export function RankingTableSkeleton() {
  return (
    <div className={styles["ranking-skeleton"]} role="status" aria-label="Carregando a classificação">
      {Array.from({ length: ROWS }, (_, index) => (
        <div key={index} className={styles["ranking-skeleton__row"]}>
          <Skeleton shape="circle" size={32} />
          <Skeleton shape="text" textScale="body-md" lines={2} className={styles["ranking-skeleton__text"]} />
          <Skeleton shape="rect" className={styles["ranking-skeleton__points"]} />
        </div>
      ))}
    </div>
  );
}
