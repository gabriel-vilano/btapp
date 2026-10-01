import type { Ref } from "react";
import { formatEventMoment } from "@/src/lib/formatters";
import type { RankingMatch } from "@/src/types/domain";
import { peopleNamesOf, voiceOf, type MatchResultContext } from "./matchResultContext";
import { CardText, ResultCard, ResultScore, type ResultBadge } from "./ResultCard";
import { actorName, confirmationText, confirmedAt, CONTEST_REASON_LABEL, resultLine } from "./resultTexts";

// Estados em que ninguém da partida age mais pela tela: em arbitragem,
// confirmada, cancelada e o lançamento desfeito (docs/RESULTS.md §4.3).
// Os atos do admin aparecem com nome e momento (RG11).

type CardProps<S extends RankingMatch["status"]> = {
  match: Extract<RankingMatch, { status: S }>;
  context: MatchResultContext;
  titleRef: Ref<HTMLHeadingElement>;
};

export function ArbitrationCard({ match, context, titleRef }: CardProps<"in_arbitration">) {
  const { contest, report } = match;
  const contester = actorName(contest.responded_by, context.viewerId, context.playerNames);
  const reporter = actorName(report.reported_by, context.viewerId, context.playerNames);
  const remembered = contest.reason === "different_score" ? contest.remembered_result : null;
  return (
    <ResultCard badges={[{ label: "Em arbitragem", tone: "attention" }]} title={`${contester} contestou o resultado`} titleRef={titleRef}>
      <CardText>
        {formatEventMoment(contest.responded_at)}. Motivo: {CONTEST_REASON_LABEL[contest.reason].toLocaleLowerCase("pt-BR")}. O
        admin do {context.competitionName} vai decidir o placar. Até lá, a partida não pontua.
      </CardText>
      <CardText>Lançado por {reporter === "Você" ? "você" : reporter}:</CardText>
      <ResultScore result={report.result} voice={voiceOf(context)} />
      {remembered && <CardText>Placar lembrado por quem contestou: {resultLine(remembered, context.sideNames)}.</CardText>}
    </ResultCard>
  );
}

export function ConfirmedCard({ match, context, titleRef }: CardProps<"confirmed">) {
  const people = peopleNamesOf(context);
  const badges: ResultBadge[] = [{ label: "Confirmado", tone: "success" }];
  if (match.correction) badges.push({ label: "Corrigido", tone: "neutral" });
  return (
    <ResultCard badges={badges} title="Resultado confirmado" titleRef={titleRef}>
      <ResultScore result={match.result} voice={voiceOf(context)} />
      <CardText>
        {confirmationText(match.confirmation, context.viewerId, people)} · {formatEventMoment(confirmedAt(match.confirmation))}
      </CardText>
      {match.correction && (
        <CardText>
          Placar corrigido por {actorName(match.correction.admin_id, context.viewerId, people)} (admin) ·{" "}
          {formatEventMoment(match.correction.acted_at)}
        </CardText>
      )}
    </ResultCard>
  );
}

export function CancelledCard({ match, context, titleRef }: CardProps<"cancelled">) {
  const people = peopleNamesOf(context);
  const annulled = match.reason === "annulled";
  return (
    <ResultCard
      badges={[{ label: annulled ? "Anulado" : "Cancelada", tone: "neutral" }]}
      title={annulled ? "Resultado anulado pelo admin" : "Partida cancelada pelo admin"}
      titleRef={titleRef}
    >
      <CardText>
        {actorName(match.cancellation.admin_id, context.viewerId, people)} (admin) ·{" "}
        {formatEventMoment(match.cancellation.acted_at)}. A partida não pontua.
      </CardText>
    </ResultCard>
  );
}

/** A partida voltou a Confronto definido: o último lançamento foi desfeito por quem lançou (RG16). */
export function UndoneCard({ match, context, titleRef }: CardProps<"defined">) {
  const last = match.undone_reports.at(-1);
  if (last === undefined) return null;
  return (
    <ResultCard badges={[]} title="Lançamento desfeito" titleRef={titleRef}>
      <CardText>
        {actorName(last.reported_by, context.viewerId, context.playerNames)} desfez o lançamento{" "}
        {formatEventMoment(last.undone_at)}. O jogo volta a esperar o resultado.
      </CardText>
    </ResultCard>
  );
}
