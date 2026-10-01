"use client";

import { useState } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Badge } from "@/src/components/ui/Badge";
import { sideOfPlayer } from "@/src/lib/domain/schedule-state";
import { phoneSettingsHref } from "@/src/lib/navigation/phoneSettings";
import type { MatchSideKey } from "@/src/types/domain";
import { MatchResult } from "../MatchResult";
import { MatchScheduling } from "../MatchScheduling";
import { ScheduleForm } from "../ScheduleForm";
import type { MatchScreenData } from "./matchScreenData";
import { useMatchResult } from "./useMatchResult";
import { useMatchScheduling } from "./useMatchScheduling";
import styles from "./MatchScreen.module.css";

const AGENDA_HREF = "/jogos";

type MatchScreenProps = {
  data: MatchScreenData;
  /** "Agora" do primeiro render, em ISO 8601. Vem do servidor, para o HTML e a hidratação concordarem. */
  now: string;
  /** Relógio das ações. As stories fixam o tempo por ele. */
  clock?: () => string;
  /** Id da proposta ou da data nova. Com o Supabase, quem gera é o banco. */
  createId?: () => string;
  /**
   * Quem vê ainda não informou o telefone: o primeiro toque em "Abrir no WhatsApp"
   * pergunta se ele quer informar (docs/SCHEDULING.md M20).
   */
  askForPhone?: boolean;
};

/**
 * Tela do confronto do ranking: o resultado, quando já foi lançado
 * (docs/RESULTS.md §4), e a marcação do jogo (docs/SCHEDULING.md §6,
 * NAVIGATION.md N10), sem o cabeçalho: ele é da página. Enquanto os dados são
 * mocks, as ações mudam só a partida e o histórico em memória, pelas mesmas
 * funções puras que o banco vai usar.
 * @example <MatchScreen data={matchScreenDataOf(matchId, viewerId)} now={new Date().toISOString()} />
 */
export function MatchScreen(props: MatchScreenProps) {
  const { data, now: initialNow, clock = systemClock, createId = randomId, askForPhone = false } = props;
  // A partida é das duas seções: desfeito o lançamento, a marcação volta a valer (RG16)
  const [match, setMatch] = useState(data.match);
  const scheduling = useMatchScheduling({ ...data, match }, { initialNow, clock, createId });
  const result = useMatchResult({ match, setMatch, data, clock });
  const { view, form } = scheduling;
  const pendingOptions = view.kind === "awaiting_other_side" ? view.proposal.options : undefined;
  const viewerSide = sideOfPlayer(data.sides, data.viewerId);

  return (
    <div className={styles["match-screen"]}>
      <div className={styles["match-screen__content"]}>
        <MatchHeading data={data} viewerSide={viewerSide} />
        <MatchResult match={match} context={data} actions={result} now={scheduling.now} />
        {scheduling.error && <Alert status="attention" title={scheduling.error} />}
        <MatchScheduling
          view={view}
          history={scheduling.history}
          viewerId={data.viewerId}
          playerNames={data.playerNames}
          opponentsName={viewerSide === null ? "" : data.sideNames[otherSide(viewerSide)]}
          roundNumber={data.roundNumber}
          roundDeadline={data.roundDeadline}
          matchStatus={match.status}
          now={scheduling.now}
          resultHref={`${AGENDA_HREF}/${match.id}/resultado`}
          phoneSettingsHref={askForPhone ? phoneSettingsHref(`${AGENDA_HREF}/${match.id}`) : undefined}
          onAccept={scheduling.accept}
          onPropose={() => scheduling.openForm("propose")}
          onReport={() => scheduling.openForm("report")}
          onWithdraw={scheduling.withdraw}
        />
      </div>
      <ScheduleForm
        open={form !== null}
        mode={form ?? "propose"}
        initialOptions={form === "propose" ? pendingOptions : undefined}
        now={scheduling.now}
        roundDeadline={data.roundDeadline}
        onClose={() => scheduling.openForm(null)}
        onSubmit={scheduling.submitForm}
      />
    </div>
  );
}

type MatchHeadingProps = { data: MatchScreenData; viewerSide: MatchSideKey | null };

function MatchHeading({ data, viewerSide }: MatchHeadingProps) {
  return (
    <div className={styles["match-screen__heading"]}>
      <p className={styles["match-screen__context"]}>
        {data.competitionName} · {data.categoryName} · Rodada {data.roundNumber}
      </p>
      <ul className={styles["match-screen__sides"]} aria-label="Lados do confronto">
        {(["a", "b"] as const).map((side) => (
          <li key={side} className={styles["match-screen__side"]}>
            <span className={styles["match-screen__side-name"]}>{data.sideNames[side]}</span>
            {side === viewerSide && <Badge tone="neutral">Você</Badge>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function otherSide(side: MatchSideKey): MatchSideKey {
  return side === "a" ? "b" : "a";
}

function systemClock(): string {
  return new Date().toISOString();
}

// `crypto.randomUUID` só existe em contexto seguro (HTTPS ou localhost). O
// teste no iPhone pelo IP da rede (CLAUDE.md > "iOS Chrome/Safari") é HTTP, e
// lá o id sai do relógio. O id é só da sessão: com o Supabase, quem gera é o banco.
function randomId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export type { MatchScreenProps };
