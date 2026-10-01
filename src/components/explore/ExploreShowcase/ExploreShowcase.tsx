"use client";

import { CompassIcon } from "@phosphor-icons/react";
import { useId, type ReactNode } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { List, ListItem } from "@/src/components/ui/ListItem";
import type { ArenaListItemView, ExploreShowcaseView } from "@/src/lib/domain/explore";
import { CompetitionListItem } from "../CompetitionListItem";
import styles from "./ExploreShowcase.module.css";

export const NO_OPEN_COMPETITION_TEXT = "Nenhuma competição aberta agora.";

interface ExploreShowcaseProps {
  showcase: ExploreShowcaseView;
}

/**
 * Vitrine do Explorar, o Explorar sem termo digitado (docs/EXPLORE.md §3):
 * "Competições" na ordem da EX8 e "Arenas" (EX11), sem paginação (EX12). O
 * cabeçalho da tela, com o título, é da página.
 * @example <ExploreShowcase showcase={mockExploreShowcase(now)} />
 */
export function ExploreShowcase({ showcase }: ExploreShowcaseProps) {
  const { competitions, hasOpenCompetition, arenas } = showcase;
  // Os dois vazios juntos só acontecem em desenvolvimento (EX13)
  if (competitions.length === 0 && arenas.length === 0) {
    return <EmptyState icon={CompassIcon} title="Ainda não há competições no LetzPlay." />;
  }
  return (
    <div className={styles["explore-showcase"]}>
      <CompetitionsSection competitions={competitions} hasOpenCompetition={hasOpenCompetition} />
      {arenas.length > 0 && <ArenasSection arenas={arenas} />}
    </div>
  );
}

function ShowcaseSection({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section className={styles["explore-showcase__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["explore-showcase__section-title"]}>
        {title}
      </h2>
      {children}
    </section>
  );
}

// Sem competição aberta, a frase vem antes dos rankings entre temporadas, se houver (EX13)
function CompetitionsSection({ competitions, hasOpenCompetition }: Omit<ExploreShowcaseView, "arenas">) {
  return (
    <ShowcaseSection title="Competições">
      {!hasOpenCompetition && <p className={styles["explore-showcase__empty"]}>{NO_OPEN_COMPETITION_TEXT}</p>}
      {competitions.length > 0 && (
        <List>
          {competitions.map(({ id, ...item }) => (
            <CompetitionListItem key={id} {...item} />
          ))}
        </List>
      )}
    </ShowcaseSection>
  );
}

function ArenasSection({ arenas }: { arenas: ArenaListItemView[] }) {
  return (
    <ShowcaseSection title="Arenas">
      <List>
        {arenas.map((arena) => (
          <ListItem
            key={arena.id}
            href={arena.href}
            leading={<Avatar url={arena.avatarUrl} alt={arena.name} size={40} />}
            title={arena.name}
            supportingText={`${arena.city} · ${arena.openCompetitions}`}
          />
        ))}
      </List>
    </ShowcaseSection>
  );
}

export type { ExploreShowcaseProps };
