"use client";

import { useEffect, useRef } from "react";
import { ButtonLink } from "@/src/components/ui/Button";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import type { PickablePlayer } from "@/src/components/ui/SidePicker";
import type { MatchSidePlayers } from "@/src/lib/domain/match-state";
import { toScore } from "@/src/lib/domain/profile-page/score";
import type { FriendlyMatch } from "@/src/types/domain";
import { friendlyRespondersText, friendlyVoiceOf, pendingFriendlyText } from "./friendlyReportModel";
import styles from "./FriendlyReport.module.css";

type FriendlySentProps = {
  match: FriendlyMatch;
  sides: MatchSidePlayers;
  players: readonly PickablePlayer[];
};

const AGENDA_HREF = "/jogos";

/**
 * Fim do fluxo: o amistoso foi para o outro lado confirmar (§6.1) e aparece em
 * "Aguardando" na agenda (N19). O foco vem para o título, porque a revisão que
 * tinha o foco fechou.
 */
export function FriendlySent({ match, sides, players }: FriendlySentProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  const voice = friendlyVoiceOf(sides, players);

  return (
    <section className={styles["friendly-report__sent"]} aria-labelledby="friendly-report-sent-title">
      <h2 id="friendly-report-sent-title" ref={titleRef} tabIndex={-1} className={styles["friendly-report__sent-title"]}>
        Amistoso enviado a {voice.names.b}
      </h2>
      <ScoreBlock score={toScore(match.report.result)} />
      <p className={styles["friendly-report__note"]}>
        {pendingFriendlyText(friendlyRespondersText(sides, players), voice.isSingles)}
      </p>
      <ButtonLink href={AGENDA_HREF} fullWidth>
        Voltar para Jogos
      </ButtonLink>
    </section>
  );
}
