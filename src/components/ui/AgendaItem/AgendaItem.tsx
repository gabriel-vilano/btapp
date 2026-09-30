import Link from "next/link";
import { AvatarStack } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { ButtonLink } from "@/src/components/ui/Button";
import type { AgendaItemModel, AgendaItemPerson } from "@/src/lib/agenda/agendaItemModel";
import { formatSideNames } from "@/src/lib/agenda/agendaText";
import styles from "./AgendaItem.module.css";

type AgendaItemProps = Omit<AgendaItemModel, "matchId">;

/**
 * Uma partida na agenda do jogador: lados, contexto, situação e, em "Sua vez",
 * o botão da ação. Renderiza um `<li>`: use dentro de `<List>`.
 * @example <AgendaItem {...agendaItemModel(domain, entry, now)} />
 */
export function AgendaItem({ ownSide, opponentSide, context, situation, badge, href, action }: AgendaItemProps) {
  return (
    <li className={styles["agenda-item"]}>
      <Link href={href} className={styles["agenda-item__main"]}>
        {/* aria-hidden: os nomes já estão no título; o avatar os repetiria */}
        <span className={styles["agenda-item__leading"]} aria-hidden>
          <AvatarStack items={avatarItems(opponentSide)} size={40} />
        </span>
        <span className={styles["agenda-item__content"]}>
          <span className={styles["agenda-item__title"]}>
            <span className={styles["agenda-item__sides"]}>
              {sideNames(ownSide)} × {sideNames(opponentSide)}
            </span>
            {badge && <Badge tone="accent">{badge}</Badge>}
          </span>
          <span className={styles["agenda-item__context"]}>{context}</span>
          <span className={styles["agenda-item__situation"]}>{situation}</span>
        </span>
      </Link>
      {action && (
        <div className={styles["agenda-item__action"]}>
          <ButtonLink href={action.href} variant="secondary">
            {action.label}
          </ButtonLink>
        </div>
      )}
    </li>
  );
}

function sideNames(people: AgendaItemPerson[]): string {
  return formatSideNames(people.map((person) => person.name.split(" ")[0]));
}

function avatarItems(people: AgendaItemPerson[]) {
  return people.map((person) => ({ id: person.id, url: person.avatarUrl, alt: person.name }));
}

export type { AgendaItemProps };
