"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { StandingSummaryItem } from "@/src/components/ui/StandingSummaryItem";
import type { H2HForm } from "@/src/lib/domain/h2h";
import type { H2HCrossPairView, H2HMatchView, H2HSideView, H2HStandingView } from "@/src/lib/domain/h2h-page";
import { FormGuide } from "../FormGuide";
import { H2HMatchItem } from "../H2HMatchItem";
import styles from "./H2HPage.module.css";

// O conteúdo de cada seção do H2H (HEAD_TO_HEAD.md §4). A seção em si, com o
// título e o erro, é o H2HSection.

interface FormRowsProps {
  left: H2HSideView;
  right: H2HSideView;
  form: { left: H2HForm; right: H2HForm };
}

/** "Forma recente" (HH12): cada lado na sua coluna, como os lados lá em cima. */
export function FormRows({ left, right, form }: FormRowsProps) {
  return (
    <div className={styles.h2h__form}>
      <FormSide side={left} results={form.left} />
      <FormSide side={right} results={form.right} alignEnd />
    </div>
  );
}

function FormSide({ side, results, alignEnd = false }: { side: H2HSideView; results: H2HForm; alignEnd?: boolean }) {
  const className = alignEnd ? `${styles["h2h__form-side"]} ${styles["h2h__form-side--end"]}` : styles["h2h__form-side"];
  return (
    <div className={className}>
      {/* O nome já entra no nome acessível do FormGuide */}
      <span className={styles["h2h__form-label"]} aria-hidden>
        {side.label}
      </span>
      <FormGuide results={results} label={side.name} />
    </div>
  );
}

/** "No ranking" (HH13): a posição de cada dupla nas categorias em comum. */
export function StandingRows({ rows }: { rows: H2HStandingView[] }) {
  return (
    <List>
      {rows.map((row) => (
        <StandingSummaryItem
          key={row.enrollment_id}
          position={row.position}
          competitionName={row.competition_name}
          categoryName={row.category_name}
          delta={row.delta ?? undefined}
          complement={row.side_name}
          href={row.href}
        />
      ))}
    </List>
  );
}

/** "Confrontos" (HH14): do mais recente ao mais antigo, sem paginação. */
export function MatchRows({ items }: { items: H2HMatchView[] }) {
  return (
    <List>
      {items.map((item) => (
        <H2HMatchItem
          key={item.match_id}
          outcome={item.outcome}
          score={item.score}
          playedAt={item.played_at}
          context={item.context}
          lineup={item.lineup ? { partnerName: item.lineup.partner_name, opponentNames: item.lineup.opponent_names } : undefined}
          href={item.href}
        />
      ))}
    </List>
  );
}

/** "Jogador contra jogador" (HH2, §4.6): cada par cruzado com confronto, e a seta. */
export function CrossPairRows({ pairs }: { pairs: H2HCrossPairView[] }) {
  return (
    <List>
      {pairs.map((pair) => (
        <ListItem
          key={pair.href}
          href={pair.href}
          title={pair.title}
          trailing={
            <>
              <span aria-hidden>{`${pair.left_wins} × ${pair.right_wins}`}</span>
              <span className={styles["visually-hidden"]}>{`, ${pair.left_wins} a ${pair.right_wins}`}</span>
              <Icon icon={CaretRightIcon} size="sm" />
            </>
          }
        />
      ))}
    </List>
  );
}
