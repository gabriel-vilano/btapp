"use client";

import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useId, useState, type ReactNode } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { List } from "@/src/components/ui/ListItem";
import { OrganizationContact } from "@/src/components/ui/OrganizationContact";
import type { CompetitionListItemView, OrganizationPageView } from "@/src/lib/domain/explore";
import { readOrganizationContact } from "@/src/lib/organizationContact";
import { CompetitionListItem } from "../CompetitionListItem";
import { NO_OPEN_COMPETITION_TEXT } from "../ExploreShowcase";
import styles from "./OrganizationPage.module.css";

interface OrganizationPageProps {
  data: OrganizationPageView;
}

/**
 * Página da organização (docs/EXPLORE.md, EX22): cabeçalho, contato e
 * competições, sem endereço, mapa nem quadras (EX24). O `h1` é o nome, no
 * conteúdo: o cabeçalho da tela, com o "Voltar", é da página.
 * @example <OrganizationPage data={mockOrganizationPage("clubecajui", now)} />
 */
export function OrganizationPage({ data }: OrganizationPageProps) {
  return (
    <div className={styles["organization-page"]}>
      <div className={styles["organization-page__header"]}>
        <Avatar url={data.avatarUrl} alt={data.name} size={48} />
        <div>
          <h1 className={styles["organization-page__name"]}>{data.name}</h1>
          <p className={styles["organization-page__meta"]}>
            {data.kindLabel} · {data.city}
          </p>
        </div>
      </div>
      {/* Sem contato cadastrado, o bloco some (EX22) */}
      {readOrganizationContact(data.contact) !== null && (
        <PageSection title="Contato">
          <div className={styles["organization-page__body"]}>
            <OrganizationContact contact={data.contact} linkLabel={`Falar com ${data.name}`} />
          </div>
        </PageSection>
      )}
      <OrganizationCompetitions data={data} />
    </div>
  );
}

function PageSection({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section className={styles["organization-page__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["organization-page__section-title"]}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function CompetitionList({ items, id }: { items: CompetitionListItemView[]; id?: string }) {
  return (
    <div id={id}>
      <List>
        {items.map(({ id: competitionId, ...item }) => (
          <CompetitionListItem key={competitionId} {...item} />
        ))}
      </List>
    </div>
  );
}

// Os rankings entre temporadas ficam na lista, no fim; "Ver encerradas" guarda só os torneios passados
function OrganizationCompetitions({ data }: OrganizationPageProps) {
  const { competitions, hasOpenCompetition, closed } = data;
  return (
    <PageSection title="Competições">
      {!hasOpenCompetition && <p className={styles["organization-page__text"]}>{NO_OPEN_COMPETITION_TEXT}</p>}
      {competitions.length > 0 && <CompetitionList items={competitions} />}
      {closed.length > 0 && <ClosedCompetitions items={closed} />}
    </PageSection>
  );
}

// Disclosure (WAI-ARIA APG): o rótulo fica fixo e o estado vai no aria-expanded
function ClosedCompetitions({ items }: { items: CompetitionListItemView[] }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  return (
    <>
      <div className={styles["organization-page__body"]}>
        <Button variant="ghost" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(!expanded)}>
          <span className={styles["organization-page__toggle"]}>
            Ver encerradas ({items.length})
            <Icon icon={expanded ? CaretUpIcon : CaretDownIcon} size="sm" />
          </span>
        </Button>
      </div>
      {expanded && <CompetitionList items={items} id={listId} />}
    </>
  );
}

export type { OrganizationPageProps };
