"use client";

import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { ScheduleOptionPicker } from "../ScheduleOptionPicker";
import { Button, ButtonLink } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { nameOf, type PlayerNames } from "@/src/components/ui/ScheduleTimeline";
import type { AgreedSchedule, ScheduleView } from "@/src/lib/domain/schedule-state";
import { formatEventMoment } from "@/src/lib/formatters";
import { formatScheduleDay, formatScheduleTime } from "@/src/lib/scheduleOptionFormat";
import { formatTimeLeft } from "@/src/lib/timeLeft";
import type { MatchStatus, PendingScheduleProposal, ScheduleOption } from "@/src/types/domain";
import { scheduleWhatsAppHref, type WhatsAppSubject } from "./whatsAppText";
import styles from "./MatchScheduling.module.css";

// "use client": o ícone do WhatsApp vem do Phosphor, e o seletor de opções guarda estado.

/** O que cada estado precisa para montar texto e ações. */
export interface ScheduleStateCardProps {
  view: ScheduleView;
  viewerId: string;
  playerNames: PlayerNames;
  /** O outro lado, do ponto de vista de quem vê. Ex.: "Caio e Diego". */
  opponentsName: string;
  roundNumber: number;
  roundDeadline: string; // ISO 8601
  matchStatus: MatchStatus;
  now: string; // ISO 8601
  resultHref: string;
  onAccept: (optionIndex: number) => void;
  /** Abre o formulário de proposta: propor, "Nenhum serve", "Trocar horários" e "Remarcar". */
  onPropose: () => void;
  onReport: () => void;
  onWithdraw: () => void;
}

/** O estado atual da marcação e as ações dele (docs/SCHEDULING.md §6). */
export function ScheduleStateCard(props: ScheduleStateCardProps) {
  const { view } = props;
  switch (view.kind) {
    case "no_date":
      return <NoDateCard {...props} />;
    case "awaiting_you":
      return <AwaitingYouCard {...props} proposal={view.proposal} agreed={view.agreed} />;
    case "awaiting_other_side":
      return <AwaitingOtherSideCard {...props} proposal={view.proposal} agreed={view.agreed} />;
    case "agreed":
      return <AgreedCard {...props} agreed={view.agreed} />;
    case "date_passed":
      return <DatePassedCard {...props} agreed={view.agreed} />;
    case "frozen":
      return <FrozenCard matchStatus={props.matchStatus} agreed={view.agreed} playerNames={props.playerNames} />;
    case "public":
      return <PublicCard agreed={view.agreed} />;
  }
}

function NoDateCard({ roundNumber, roundDeadline, now, onPropose, onReport }: ScheduleStateCardProps) {
  const deadlineLeft = formatTimeLeft(roundDeadline, now);
  return (
    <StateCard title="Jogo sem data">
      <p className={styles.card__text}>
        A rodada fecha {deadlineLeft} ({formatEventMoment(roundDeadline)}). Proponha horários ou informe a data que vocês
        combinaram.
      </p>
      <div className={styles.card__actions}>
        <Button fullWidth onClick={onPropose}>
          Propor horários
        </Button>
        <Button variant="secondary" fullWidth onClick={onReport}>
          Informar data combinada
        </Button>
        <WhatsAppLink subject={{ kind: "invite", roundNumber, deadlineLeft }} />
      </div>
    </StateCard>
  );
}

type ProposalCardProps = ScheduleStateCardProps & { proposal: PendingScheduleProposal; agreed: AgreedSchedule | null };

function AwaitingYouCard({ proposal, agreed, playerNames, now, onAccept, onPropose }: ProposalCardProps) {
  const proposer = nameOf(proposal.proposed_by, playerNames);
  return (
    <StateCard title={`${proposer} propôs ${proposal.options.length} horários`}>
      <p className={styles.card__text}>Enviada {formatEventMoment(proposal.created_at)}.</p>
      {agreed && <RescheduleNote agreed={agreed} now={now} />}
      <ScheduleOptionPicker
        options={proposal.options}
        now={now}
        onConfirm={onAccept}
        onNoneWorks={onPropose}
      />
    </StateCard>
  );
}

function AwaitingOtherSideCard(props: ProposalCardProps) {
  const { proposal, agreed, viewerId, playerNames, opponentsName, now, onPropose, onWithdraw } = props;
  const proposer = proposal.proposed_by === viewerId ? "Você" : nameOf(proposal.proposed_by, playerNames);
  return (
    <StateCard title={`Proposta enviada · aguardando ${opponentsName}`}>
      <p className={styles.card__text}>
        {proposer} propôs {proposal.options.length} horários {formatEventMoment(proposal.created_at)}.
      </p>
      {agreed && <RescheduleNote agreed={agreed} now={now} />}
      <OptionList options={proposal.options} />
      <div className={styles.card__actions}>
        <Button variant="secondary" fullWidth onClick={onPropose}>
          Trocar horários
        </Button>
        <Button variant="ghost" fullWidth onClick={onWithdraw}>
          Retirar proposta
        </Button>
        <WhatsAppLink subject={{ kind: "proposal", options: proposal.options }} />
      </div>
    </StateCard>
  );
}

type AgreedCardProps = ScheduleStateCardProps & { agreed: AgreedSchedule };

function AgreedCard({ agreed, playerNames, onPropose }: AgreedCardProps) {
  return (
    <StateCard title="Jogo marcado">
      <AgreedDate agreed={agreed} />
      <p className={styles.card__text}>{agreedSourceText(agreed, playerNames)}</p>
      <div className={styles.card__actions}>
        <Button variant="secondary" fullWidth onClick={onPropose}>
          Remarcar
        </Button>
        <WhatsAppLink subject={{ kind: "agreed", option: agreed }} />
      </div>
    </StateCard>
  );
}

// Só o lançamento é ação principal (§6). "Remarcar" continua valendo (M13): o
// jogo pode não ter saído por chuva ou lesão
function DatePassedCard({ agreed, resultHref, onPropose }: AgreedCardProps) {
  return (
    <StateCard title="O jogo já passou">
      <AgreedDate agreed={agreed} />
      <p className={styles.card__text}>Lance o resultado para a partida contar no ranking.</p>
      <div className={styles.card__actions}>
        <ButtonLink href={resultHref} fullWidth>
          Lançar resultado
        </ButtonLink>
        <Button variant="ghost" fullWidth onClick={onPropose}>
          O jogo não aconteceu, remarcar
        </Button>
      </div>
    </StateCard>
  );
}

const FROZEN_TEXT: Partial<Record<MatchStatus, string>> = {
  awaiting_confirmation: "O resultado foi lançado. A marcação fica como registro do confronto.",
  in_arbitration: "O resultado está com o admin. A marcação fica como registro do confronto.",
  confirmed: "Partida encerrada. A marcação fica como registro do confronto.",
  not_played: "O prazo da rodada venceu sem resultado. O admin decide a partida com este histórico.",
  cancelled: "Partida cancelada pelo admin. A marcação fica como registro do confronto.",
};

type FrozenCardProps = Pick<ScheduleStateCardProps, "matchStatus" | "playerNames"> & { agreed: AgreedSchedule | null };

function FrozenCard({ matchStatus, agreed, playerNames }: FrozenCardProps) {
  return (
    <StateCard title="Marcação encerrada">
      {agreed && <AgreedDate agreed={agreed} />}
      {agreed && <p className={styles.card__text}>{agreedSourceText(agreed, playerNames)}</p>}
      <p className={styles.card__text}>{FROZEN_TEXT[matchStatus] ?? FROZEN_TEXT.confirmed}</p>
    </StateCard>
  );
}

// Quem não é do confronto vê só a data e a arena, como no card público (M18)
function PublicCard({ agreed }: { agreed: AgreedSchedule | null }) {
  if (agreed === null) {
    return (
      <StateCard title="Sem data marcada">
        <p className={styles.card__text}>Os jogadores ainda não marcaram o jogo.</p>
      </StateCard>
    );
  }
  return (
    <StateCard title="Jogo marcado">
      <AgreedDate agreed={agreed} />
    </StateCard>
  );
}

function StateCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.card__title}>{title}</h3>
      {children}
    </div>
  );
}

function AgreedDate({ agreed }: { agreed: ScheduleOption }) {
  return (
    <p className={styles.card__date}>
      <span className={styles["card__date-when"]}>{formatScheduleDay(agreed.starts_at)}</span>
      <span className={styles["card__date-venue"]}>
        {formatScheduleTime(agreed.starts_at)} · {agreed.venue ?? "Arena a combinar"}
      </span>
    </p>
  );
}

// Remarcação pendente: a data acordada vale até alguém aceitar (M13)
function RescheduleNote({ agreed, now }: { agreed: AgreedSchedule; now: string }) {
  const passed = Date.parse(agreed.starts_at) <= Date.parse(now);
  // No meio da frase, o dia vai em minúscula: "marcado para sábado, 3 de outubro, 14h"
  const when = `${formatScheduleDay(agreed.starts_at).toLocaleLowerCase("pt-BR")}, ${formatScheduleTime(agreed.starts_at)}`;
  const text = passed
    ? `O jogo marcado para ${when} já passou.`
    : `O jogo marcado para ${when} continua valendo até alguém aceitar um novo horário.`;
  return <p className={styles.card__note}>{text}</p>;
}

function OptionList({ options }: { options: readonly ScheduleOption[] }) {
  return (
    <ul className={styles.card__options} aria-label="Horários propostos">
      {options.map((option) => (
        <li key={option.starts_at} className={styles.card__option}>
          <span className={styles["card__option-day"]}>{formatScheduleDay(option.starts_at)}</span>
          <span className={styles["card__option-time"]}>{formatScheduleTime(option.starts_at)}</span>
          <span className={styles["card__option-venue"]}>{option.venue ?? "Arena a combinar"}</span>
        </li>
      ))}
    </ul>
  );
}

// O WhatsApp abre fora do app: nova aba, sem passar o `opener` para a página dele
function WhatsAppLink({ subject }: { subject: WhatsAppSubject }) {
  return (
    <ButtonLink href={scheduleWhatsAppHref(subject)} variant="ghost" fullWidth target="_blank" rel="noopener noreferrer">
      <Icon icon={WhatsappLogoIcon} size="sm" />
      <span>Abrir no WhatsApp</span>
    </ButtonLink>
  );
}

function agreedSourceText(agreed: AgreedSchedule, names: PlayerNames): string {
  const { source } = agreed;
  if (source.kind === "proposal") {
    return `Marcado por proposta, aceita por ${nameOf(source.accepted_by, names)} ${formatEventMoment(agreed.agreed_at)}.`;
  }
  return `Informado por ${nameOf(source.reported_by, names)} ${formatEventMoment(agreed.agreed_at)}, combinado fora do app.`;
}
