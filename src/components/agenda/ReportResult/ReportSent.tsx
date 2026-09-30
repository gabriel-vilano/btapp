"use client";

import { useEffect, useRef } from "react";
import { ButtonLink } from "@/src/components/ui/Button";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import { toScore } from "@/src/lib/domain/profile-page/score";
import type { ReportableResult } from "@/src/types/domain";
import type { ReportResultData } from "./reportResultData";
import { otherSide } from "./reportResultModel";
import { responseDeadlineText } from "./reportSummary";
import styles from "./ReportResult.module.css";

type ReportSentProps = {
  data: ReportResultData;
  result: ReportableResult;
  /** Lado de quem lançou: o outro é quem confirma. Ignorado no torneio. */
  reporterSide: "a" | "b";
  sentAt: string;
  matchHref: string;
};

/**
 * Fim do fluxo: o que foi enviado, quem confirma e até quando (RG7, §3.6).
 * O foco vem para o título, porque a revisão que tinha o foco fechou.
 */
export function ReportSent({ data, result, reporterSide, sentAt, matchHref }: ReportSentProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  const title = data.ranking ? `Resultado enviado a ${data.sideNames[otherSide(reporterSide)]}` : "Resultado lançado";

  return (
    <section className={styles["report-result__sent"]} aria-labelledby="report-result-sent-title">
      <h2 id="report-result-sent-title" ref={titleRef} tabIndex={-1} className={styles["report-result__sent-title"]}>
        {title}
      </h2>
      <ScoreBlock score={toScore(result)} />
      <p className={styles["report-result__note"]}>{responseDeadlineText(data, reporterSide, sentAt)}</p>
      <ButtonLink href={matchHref} fullWidth>
        Voltar para a partida
      </ButtonLink>
    </section>
  );
}
