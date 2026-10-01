import type { ReactNode, Ref } from "react";
import { Badge } from "@/src/components/ui/Badge";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import { toScore } from "@/src/lib/domain/profile-page/score";
import type { CompetitionResult } from "@/src/types/domain";
import { winnerLine, type SideVoice } from "../ReportResult/reportSummary";
import styles from "./MatchResult.module.css";

/** Selo do estado no topo do cartão. */
export type ResultBadge = { label: string; tone: "neutral" | "accent" | "success" | "attention" };

type ResultCardProps = {
  /** Selo do estado: "Aguardando confirmação", "Em arbitragem", "Confirmado". */
  badges: ResultBadge[];
  title: string;
  /** O título recebe o foco depois de uma ação que muda o estado. */
  titleRef: Ref<HTMLHeadingElement>;
  /** Ação no canto do cartão, como o menu "⋯" de quem lançou (RG16). */
  menu?: ReactNode;
  children: ReactNode;
};

/** Cartão do estado do resultado: selos, título e o conteúdo do estado. */
export function ResultCard({ badges, title, titleRef, menu, children }: ResultCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.card__header}>
        <div className={styles.card__heading}>
          {badges.length > 0 && (
            <div className={styles.card__badges}>
              {badges.map((badge) => (
                <Badge key={badge.label} tone={badge.tone}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          <h3 ref={titleRef} tabIndex={-1} className={styles.card__title}>
            {title}
          </h3>
        </div>
        {menu}
      </div>
      {children}
    </div>
  );
}

/** Quem venceu e o placar. O W.O. duplo não tem vencedor nem placar (R36). */
export function ResultScore({ result, voice }: { result: CompetitionResult; voice: SideVoice }) {
  if (result.type === "double_wo") {
    return <p className={styles.card__winner}>W.O. duplo: nenhum lado pontua.</p>;
  }
  return (
    <>
      <p className={styles.card__winner}>{winnerLine(result, voice)}</p>
      <ScoreBlock score={toScore(result)} />
    </>
  );
}

export function CardText({ children }: { children: ReactNode }) {
  return <p className={styles.card__text}>{children}</p>;
}
