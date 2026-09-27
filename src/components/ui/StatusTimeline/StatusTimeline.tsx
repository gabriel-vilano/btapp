import type { ReactNode } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { formatEventMoment } from "@/src/lib/formatters";
import styles from "./StatusTimeline.module.css";

interface StatusTimelineEvent {
  /** Chave estável do evento (id do registro no banco). */
  id: string;
  /** Quem agiu. Sem `actor`, o evento é do sistema e `action` é a frase inteira ("A proposta expirou."). */
  actor?: string;
  /** Papel de quem agiu, quando importa para o evento. Ex.: `"admin"` (R39: quem arbitrou fica visível). */
  actorRole?: string;
  /** O que aconteceu, continuando o nome: "propôs 3 horários", "contestou o resultado". */
  action: string;
  /** Uma linha de apoio: os horários da proposta, o placar, o motivo da contestação. */
  detail?: ReactNode;
  /** Quando, em ISO 8601. Vira `<time>` e é mostrado em pt-BR, no fuso de São Paulo. */
  at: string;
  /** Ícone do marcador. Decorativo: o significado está no texto. Sem ícone, o marcador é um ponto. */
  icon?: React.ElementType;
}

interface StatusTimelineProps {
  /** Eventos em ordem cronológica, do mais antigo para o mais recente. */
  events: StatusTimelineEvent[];
  /** Nome acessível da lista. Ex.: "Histórico da marcação". */
  label: string;
  className?: string;
}

/**
 * Linha do tempo de fatos: quem fez o quê e quando. Mostra evidência, não veredito.
 * @example <StatusTimeline label="Histórico do resultado" events={[{ id: "1", actor: "Pedro", action: "lançou o resultado", at: "2026-09-22T23:00:00Z" }]} />
 */
export function StatusTimeline({ events, label, className }: StatusTimelineProps) {
  if (events.length === 0) return null;
  const rootClasses = [styles["status-timeline"], className].filter(Boolean).join(" ");

  return (
    <ol className={rootClasses} aria-label={label}>
      {events.map((event) => (
        <StatusTimelineItem key={event.id} {...event} />
      ))}
    </ol>
  );
}

function StatusTimelineItem({ actor, actorRole, action, detail, at, icon }: StatusTimelineEvent) {
  return (
    <li className={styles["status-timeline__item"]}>
      <span className={styles["status-timeline__marker"]}>
        {icon ? <Icon icon={icon} size="sm" /> : <span className={styles["status-timeline__dot"]} />}
      </span>
      <div className={styles["status-timeline__content"]}>
        <p className={styles["status-timeline__summary"]}>
          <EventSentence actor={actor} actorRole={actorRole} action={action} />
        </p>
        {detail && <p className={styles["status-timeline__detail"]}>{detail}</p>}
        <time className={styles["status-timeline__time"]} dateTime={at}>
          {formatEventMoment(at)}
        </time>
      </div>
    </li>
  );
}

function EventSentence({ actor, actorRole, action }: Pick<StatusTimelineEvent, "actor" | "actorRole" | "action">) {
  if (!actor) return action;
  return (
    <>
      <strong className={styles["status-timeline__actor"]}>{actor}</strong>
      {actorRole && <span className={styles["status-timeline__role"]}> ({actorRole})</span>} {action}
    </>
  );
}

export type { StatusTimelineEvent, StatusTimelineProps };
