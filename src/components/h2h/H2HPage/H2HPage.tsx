"use client";

import { EmptyState } from "@/src/components/ui/EmptyState";
import { Skeleton } from "@/src/components/ui/Skeleton";
import type { H2HPageView, H2HSideView } from "@/src/lib/domain/h2h-page";
import { H2HSides, type H2HSidesPlayer } from "../H2HSides";
import { H2HSummary } from "../H2HSummary";
import { formatNeverMet, type H2HSideKind } from "../h2hText";
import { H2HSection } from "./H2HSection";
import { CrossPairRows, FormRows, MatchRows, StandingRows } from "./H2HPageSections";
import styles from "./H2HPage.module.css";

interface H2HPageProps {
  view: H2HPageView;
}

function sidesPlayers(side: H2HSideView): H2HSidesPlayer[] {
  return side.players.map((player) => ({
    id: player.id,
    name: player.name,
    shownName: player.shown_name,
    avatarUrl: player.avatar_url,
    href: player.href,
  }));
}

/**
 * Página de H2H (HEAD_TO_HEAD.md): rolagem única na ordem da HH8. Seção sem conteúdo some.
 * O cabeçalho da tela (DetailHeader) é da página.
 * @example <H2HPage view={mockH2HPages.doubles} />
 */
export function H2HPage({ view }: H2HPageProps) {
  const sideKind: H2HSideKind = view.kind === "doubles" ? "pair" : "player";
  return (
    <div className={styles.h2h}>
      <div className={styles.h2h__top}>
        {/* O h1 é o confronto por extenso (§7); os lados são a versão visual dele */}
        <h1 className={styles["visually-hidden"]}>{view.title}</h1>
        <H2HSides left={sidesPlayers(view.left)} right={sidesPlayers(view.right)} />
        <Summary view={view} sideKind={sideKind} />
      </div>
      <H2HSection title="Forma recente" section={view.form}>
        {(form) => <FormRows left={view.left} right={view.right} form={form} />}
      </H2HSection>
      <H2HSection title="No ranking" section={view.rankings}>
        {(rows) => (rows.length > 0 ? <StandingRows rows={rows} /> : null)}
      </H2HSection>
      <H2HSection title="Confrontos" section={{ status: "ready", data: view.confrontations }}>
        {(items) => (items.length > 0 ? <MatchRows items={items} /> : null)}
      </H2HSection>
      <H2HSection title="Jogador contra jogador" section={{ status: "ready", data: view.cross_pairs }}>
        {(pairs) => (pairs.length > 0 ? <CrossPairRows pairs={pairs} /> : null)}
      </H2HSection>
    </div>
  );
}

// Sem confronto, o resumo vira o vazio da §6.1, sem CTA (DEC-H2H HQ4)
function Summary({ view, sideKind }: { view: H2HPageView; sideKind: H2HSideKind }) {
  const { summary, left, right } = view;
  if (summary === null) {
    const title = formatNeverMet({ viewerIsLeft: view.viewer_is_left, sideKind, leftName: left.name, rightName: right.name });
    return <EmptyState title={title} description="Os confrontos entre os dois lados aparecem aqui." />;
  }
  return (
    <H2HSummary
      leftWins={summary.left_wins}
      rightWins={summary.right_wins}
      lastPlayedAt={summary.last_played_at}
      leftLabel={left.label}
      rightLabel={right.label}
      sideKind={sideKind}
    />
  );
}

/** Carregando (HH21): o formato dos lados, do resumo e de 3 linhas de lista. */
export function H2HPageSkeleton() {
  return (
    <div className={styles.h2h}>
      <p className={styles["visually-hidden"]} role="status">
        Carregando H2H
      </p>
      <div className={`${styles.h2h__top} ${styles["h2h__sides-skeleton"]}`} aria-hidden>
        <Skeleton shape="circle" size={48} />
        <Skeleton shape="circle" size={48} />
      </div>
      <div className={styles["h2h__summary-skeleton"]} aria-hidden>
        <Skeleton shape="text" textScale="title-md" />
        <Skeleton shape="text" textScale="label-md" />
      </div>
      <div className={styles["h2h__list-skeleton"]} aria-hidden>
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} shape="text" textScale="body-md" lines={2} />
        ))}
      </div>
    </div>
  );
}

export type { H2HPageProps };
