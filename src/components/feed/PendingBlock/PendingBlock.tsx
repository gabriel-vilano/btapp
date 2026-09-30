import { AgendaItem } from "@/src/components/ui/AgendaItem";
import { List } from "@/src/components/ui/ListItem";
import { TextLink } from "@/src/components/ui/TextLink";
import type { PendingBlockModel } from "@/src/lib/agenda/pendingBlockModel";
import styles from "./PendingBlock.module.css";

/** A aba Jogos, onde "Sua vez" mostra todas as pendências. */
export const JOGOS_HREF = "/jogos";

const TITLE_ID = "feed-sua-vez-title";

/**
 * Bloco "Sua vez" no topo do feed (N20): as primeiras pendências do jogador,
 * com o mesmo item da aba Jogos. Sem pendência, não renderiza nada.
 * @example <PendingBlock {...pendingBlockModel(domain, { playerId, now })} />
 */
export function PendingBlock({ items, total }: PendingBlockModel) {
  if (items.length === 0) return null;
  return (
    <section className={styles["pending-block"]} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={styles["pending-block__title"]}>
        Sua vez
      </h2>
      <List divided>
        {items.map((item) => (
          <AgendaItem key={item.matchId} {...item} />
        ))}
      </List>
      {total > items.length && (
        <div className={styles["pending-block__see-all"]}>
          <TextLink href={JOGOS_HREF}>Ver todas em Jogos ({total})</TextLink>
        </div>
      )}
    </section>
  );
}
