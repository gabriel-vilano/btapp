import { RankingList, RankingRow } from "../RankingRow";
import type { RankingRowVisualProps } from "../RankingScreen/rowProps";
import styles from "./PinnedStandingRow.module.css";

interface PinnedStandingRowProps {
  /** Por onde a linha saiu da vista: a cópia fica no topo, abaixo do cabeçalho, ou no rodapé. */
  side: "top" | "bottom";
  /** A própria linha, com as mesmas props da linha na tabela. */
  row: RankingRowVisualProps;
  /** Toque na cópia: a tela rola até a linha (RK9). */
  onActivate: () => void;
}

/**
 * Cópia fixa da própria linha quando ela sai da vista (RANKING.md, RK9). Quem decide
 * quando e de que lado ela aparece é a tela.
 * Ex.: `<PinnedStandingRow side="bottom" row={ownRow} onActivate={scrollToOwnRow} />`
 */
export function PinnedStandingRow({ side, row, onActivate }: PinnedStandingRowProps) {
  // aria-hidden e sem foco: o leitor de tela lê a linha só no lugar dela, e quem navega
  // por teclado usa o "Ir para a minha posição" do cabeçalho. O clique é só para o toque
  return (
    <div className={`${styles.pinned} ${styles[`pinned--${side}`]}`} aria-hidden="true" onClick={onActivate}>
      <RankingList>
        <RankingRow {...row} isOwn />
      </RankingList>
    </div>
  );
}

export type { PinnedStandingRowProps };
