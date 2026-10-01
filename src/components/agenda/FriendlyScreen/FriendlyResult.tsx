"use client";

import { useEffect, useId, useRef, type Ref } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import type { FriendlyMatch } from "@/src/types/domain";
import type { SideVoice } from "../ReportResult/reportSummary";
import { CardText, ResultCard, ResultScore } from "../MatchResult/ResultCard";
import { resultRoleOf } from "../MatchResult/resultRole";
import { CancelFriendlyMenu, ContestFriendlyDialog } from "./FriendlyDialogs";
import {
  awaitingFriendlyTitle,
  cancelledLine,
  confirmedLine,
  discardedLine,
  reportedAgoLine,
} from "./friendlyResultTexts";
import type { FriendlyScreenData } from "./friendlyScreenData";
import type { FriendlyResultActions } from "./useFriendlyResult";
import styles from "./FriendlyScreen.module.css";

/** Âncora da seção: "Confirmar amistoso" na agenda abre a tela já nela, como no ranking. */
export const FRIENDLY_RESULT_SECTION_ID = "resultado";

type FriendlyResultProps = {
  data: FriendlyScreenData;
  actions: FriendlyResultActions;
  /** "Agora", em ISO 8601: conta há quanto tempo foi lançado. */
  now: string;
};

/**
 * Seção do resultado na tela do amistoso (docs/RESULTS.md §6.2): o estado e,
 * enquanto pendente, confirmar e contestar para o outro lado e cancelar para quem lançou.
 * @example <FriendlyResult data={data} actions={useFriendlyResult(data, clock)} now={now} />
 */
export function FriendlyResult({ data, actions, now }: FriendlyResultProps) {
  const headingId = useId();
  const titleRef = useFocusOnStatusChange(actions.match.status);
  return (
    <section id={FRIENDLY_RESULT_SECTION_ID} className={styles["friendly-screen__result"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["friendly-screen__title"]}>
        Resultado
      </h2>
      {actions.error && actions.dialog === null && <Alert status="attention" title={actions.error} />}
      <StateCard data={data} actions={actions} now={now} titleRef={titleRef} />
      <ContestFriendlyDialog actions={actions} />
    </section>
  );
}

type StateCardProps = FriendlyResultProps & { titleRef: Ref<HTMLHeadingElement> };

function StateCard({ data, actions, now, titleRef }: StateCardProps) {
  const { match } = actions;
  const voice = friendlyScreenVoice(data);
  switch (match.status) {
    case "awaiting_confirmation":
      return <AwaitingFriendlyCard match={match} data={data} actions={actions} now={now} titleRef={titleRef} />;
    case "confirmed":
      return (
        <ResultCard badges={[{ label: "Confirmado", tone: "success" }]} title="Amistoso confirmado" titleRef={titleRef}>
          <ResultScore result={match.report.result} voice={voice} />
          <CardText>{confirmedLine(match.response.responded_by, match.response.responded_at, data)}</CardText>
        </ResultCard>
      );
    case "discarded":
      return (
        <ResultCard badges={[{ label: "Descartado", tone: "neutral" }]} title="Resultado descartado" titleRef={titleRef}>
          <CardText>{discardedLine(match.response.responded_by, match.response.responded_at, data)}</CardText>
          <ResultScore result={match.report.result} voice={voice} />
        </ResultCard>
      );
    case "cancelled":
      return (
        <ResultCard badges={[{ label: "Cancelado", tone: "neutral" }]} title="Amistoso cancelado" titleRef={titleRef}>
          <CardText>{cancelledLine(match, data)}</CardText>
        </ResultCard>
      );
  }
}

type AwaitingFriendlyCardProps = Omit<StateCardProps, "actions"> & {
  match: Extract<FriendlyMatch, { status: "awaiting_confirmation" }>;
  actions: FriendlyResultActions;
};

// Sem prazo (R43): no lugar da contagem, "Lançado há 3 dias" (§6.2)
function AwaitingFriendlyCard({ match, data, actions, now, titleRef }: AwaitingFriendlyCardProps) {
  const role = resultRoleOf(match.report, data.sides, data.viewerId);
  return (
    <ResultCard
      badges={[{ label: "Aguardando confirmação", tone: "accent" }]}
      title={awaitingFriendlyTitle(match, data, role)}
      titleRef={titleRef}
      menu={role === "reporter" && <CancelFriendlyMenu actions={actions} />}
    >
      <CardText>{reportedAgoLine(match, data, role, now)}</CardText>
      <ResultScore result={match.report.result} voice={friendlyScreenVoice(data)} />
      <CardText>Amistoso não vale ponto de ranking.</CardText>
      {role === "responder" && (
        <div className={styles["friendly-screen__actions"]}>
          <Button fullWidth onClick={actions.confirm}>
            Confirmar
          </Button>
          <Button variant="secondary" fullWidth onClick={() => actions.openDialog("contest")}>
            Contestar
          </Button>
        </div>
      )}
    </ResultCard>
  );
}

/** O lado de quem vê vira "Você e Pedro" e "vocês" (RG3). */
function friendlyScreenVoice(data: FriendlyScreenData): SideVoice {
  const userSide = sideOfPlayer(data.sides, data.viewerId);
  const isSingles = data.sides.a.length === 1;
  if (userSide === null) return { names: data.sideNames, userSide, isSingles };
  const partners = data.sides[userSide].filter((id) => id !== data.viewerId).map((id) => data.playerNames[id]);
  return { names: { ...data.sideNames, [userSide]: ["Você", ...partners].join(" e ") }, userSide, isSingles };
}

// Depois de confirmar, contestar ou cancelar, o botão que tinha o foco some
// com o estado antigo: o foco vai para o título do estado novo
function useFocusOnStatusChange(status: FriendlyMatch["status"]) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previous = useRef(status);
  useEffect(() => {
    if (previous.current === status) return;
    previous.current = status;
    titleRef.current?.focus();
  }, [status]);
  return titleRef;
}
