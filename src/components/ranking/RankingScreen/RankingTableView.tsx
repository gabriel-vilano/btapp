"use client";

import { useRef } from "react";
import type { RankingLine, RankingPlayer, RankingScreenContent } from "@/src/lib/domain/ranking-screen";
import { PinnedStandingRow } from "../PinnedStandingRow";
import { RankingList, RankingRow } from "../RankingRow";
import { ZoneDivider } from "../ZoneDivider";
import { dividerText, profileHref, TIE_NOTE } from "./rankingScreenText";
import { rankingRowProps } from "./rowProps";
import { useOwnRow } from "./useOwnRow";
import styles from "./RankingScreen.module.css";

type TableContent = Extract<RankingScreenContent, { kind: "table" }>;

interface RankingTableViewProps {
  content: TableContent;
  viewerId: string;
  /** Abre a tela rolada até a própria linha (RK21). */
  scrollToOwnOnOpen: boolean;
  /** Toque numa dupla: a tela abre a folha com os dois jogadores (RK14). */
  onOpenPair: (players: RankingPlayer[]) => void;
}

/**
 * A tabela: `<ol>` das vagas, ZoneDivider e `<ol>` de fora delas (RK13), a nota
 * de empate (4.4), a cópia fixa da própria linha (RK9) e, para teclado e leitor
 * de tela, o "Ir para a minha posição", que fecha o cabeçalho e só aparece no foco.
 */
export function RankingTableView({ content, viewerId, scrollToOwnOnOpen, onOpenPair }: RankingTableViewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const lines = [...content.qualified, ...content.outside];
  const ownIndex = lines.findIndex((line) => line.is_own);
  const own = ownIndex === -1 ? null : lines[ownIndex];
  const { side, scrollToOwnRow } = useOwnRow(tableRef, own ? ownIndex : null, scrollToOwnOnOpen);

  const row = (line: RankingLine) => (
    <RankingRow
      key={line.enrollment_id}
      {...rankingRowProps(line, viewerId)}
      href={line.players.length === 1 ? profileHref(line.players[0], viewerId) : undefined}
      onClick={line.players.length === 2 ? () => onOpenPair(line.players) : undefined}
    />
  );

  return (
    <>
      {own && (
        <button type="button" className={styles["ranking-screen__skip"]} onClick={() => scrollToOwnRow(true)}>
          Ir para a minha posição
        </button>
      )}
      <div ref={tableRef} className={styles["ranking-screen__table"]}>
        <TableLists content={content} renderRow={row} />
        {content.has_tie && <p className={styles["ranking-screen__note"]}>{TIE_NOTE}</p>}
      </div>
      {own && (side === "above" || side === "below") && (
        <PinnedStandingRow
          side={side === "above" ? "top" : "bottom"}
          row={rankingRowProps(own, viewerId)}
          onActivate={() => scrollToOwnRow(false)}
        />
      )}
    </>
  );
}

function TableLists({ content, renderRow }: { content: TableContent; renderRow: (line: RankingLine) => React.ReactNode }) {
  if (content.divider === null) {
    return <RankingList aria-label="Classificação">{content.qualified.map(renderRow)}</RankingList>;
  }
  const { label, detail } = dividerText(content.divider);
  const firstOutside = content.outside[0]?.position;
  return (
    <>
      <RankingList aria-label="Dentro das vagas">{content.qualified.map(renderRow)}</RankingList>
      <ZoneDivider label={label} detail={detail} />
      {content.outside.length > 0 && (
        <RankingList aria-label="Fora das vagas" start={firstOutside}>
          {content.outside.map(renderRow)}
        </RankingList>
      )}
    </>
  );
}
