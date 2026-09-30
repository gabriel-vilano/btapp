import { AgendaItem } from "@/src/components/ui/AgendaItem";
import { List } from "@/src/components/ui/ListItem";
import type { AgendaItemModel } from "@/src/lib/agenda/agendaItemModel";
import styles from "./AgendaSection.module.css";

/** Um bloco de itens dentro da seção. `label` é o subtítulo (o mês, no Histórico). */
export interface AgendaGroup {
  label: string | null;
  items: AgendaItemModel[];
}

interface AgendaSectionProps {
  /** Prefixo dos ids do título, único na página. Ex.: "sua-vez". */
  id: string;
  title: string;
  groups: AgendaGroup[];
  /** Linha no lugar da lista vazia. Sem ela, a seção vazia some (N14). */
  emptyText?: string;
}

/**
 * Seção da agenda: título e lista de AgendaItem. Vazia, some, ou vira a linha
 * de `emptyText` ("Sua vez" → "Nada pendente").
 * @example <AgendaSection id="sua-vez" title="Sua vez" groups={[{ label: null, items }]} emptyText="Nada pendente" />
 */
export function AgendaSection({ id, title, groups, emptyText }: AgendaSectionProps) {
  const filled = groups.filter((group) => group.items.length > 0);
  if (filled.length === 0 && emptyText === undefined) return null;
  const titleId = `${id}-title`;
  return (
    <section className={styles["agenda-section"]} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles["agenda-section__title"]}>
        {title}
      </h2>
      {filled.length === 0 && <p className={styles["agenda-section__empty"]}>{emptyText}</p>}
      {filled.map((group) => (
        <AgendaGroupList key={group.label ?? "items"} group={group} />
      ))}
    </section>
  );
}

function AgendaGroupList({ group }: { group: AgendaGroup }) {
  return (
    <>
      {group.label && <h3 className={styles["agenda-section__group"]}>{group.label}</h3>}
      <List divided>
        {group.items.map((item) => (
          <AgendaItem key={item.matchId} {...item} />
        ))}
      </List>
    </>
  );
}
