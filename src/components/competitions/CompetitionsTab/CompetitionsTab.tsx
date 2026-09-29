"use client";

import { TrophyIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { List } from "@/src/components/ui/ListItem";
import { StandingSummaryItem } from "@/src/components/ui/StandingSummaryItem";
import {
  competitionsTabContent,
  type CompetitionsTabData,
  type MyCompetitionItem,
  type PastSeasonItem,
} from "@/src/lib/domain/competitions-tab";
import { AdminPendingBlock } from "../AdminPendingBlock";
import { TournamentSummaryItem } from "../TournamentSummaryItem";
import styles from "./CompetitionsTab.module.css";

const EXPLORE_HREF = "/explorar";

interface CompetitionsTabProps {
  data: CompetitionsTabData;
}

/**
 * Aba Competições (docs/NAVIGATION.md §6): o bloco "Pendências de admin" (N30),
 * quando há, e "Minhas competições" (N29), com os vazios da 9.2.
 * @example <CompetitionsTab data={mockCompetitionsTab.admin} />
 */
export function CompetitionsTab({ data }: CompetitionsTabProps) {
  const headingId = useId();
  const { adminPendings, myCompetitions } = competitionsTabContent(data);
  return (
    <div className={styles["competitions-tab"]}>
      <header className={styles["competitions-tab__header"]}>
        <h1 className={styles["competitions-tab__title"]}>Competições</h1>
      </header>
      <AdminPendingBlock pendings={adminPendings} />
      <section className={styles["competitions-tab__section"]} aria-labelledby={headingId}>
        <h2 id={headingId} className={styles["competitions-tab__section-title"]}>
          Minhas competições
        </h2>
        {myCompetitions.kind === "list" && <CompetitionList items={myCompetitions.items} />}
        {myCompetitions.kind === "past_season" && <PastSeason season={myCompetitions.season} />}
        {myCompetitions.kind === "never_enrolled" && <NeverEnrolled />}
      </section>
    </div>
  );
}

function CompetitionList({ items }: { items: MyCompetitionItem[] }) {
  return (
    <List>
      {items.map((item) => (
        <CompetitionListItem key={item.enrollment_id} item={item} />
      ))}
    </List>
  );
}

function CompetitionListItem({ item }: { item: MyCompetitionItem }) {
  if (item.kind === "ranking") {
    return (
      <StandingSummaryItem
        position={item.position}
        competitionName={item.competition_name}
        categoryName={item.category_name}
        partnerName={item.partner_name ?? undefined}
        delta={item.delta ?? undefined}
        href={item.href}
      />
    );
  }
  return (
    <TournamentSummaryItem
      competitionName={item.competition_name}
      categoryName={item.category_name}
      partnerName={item.partner_name ?? undefined}
      startsOn={item.starts_on}
      endsOn={item.ends_on}
      nextMatch={item.next_match ? { startsAt: item.next_match.starts_at, court: item.next_match.court } : undefined}
      href={item.href}
    />
  );
}

function ExploreAction() {
  return (
    <ButtonLink href={EXPLORE_HREF} variant="secondary">
      Explorar competições
    </ButtonLink>
  );
}

// Sem inscrição ativa, com temporada passada: a posição final continua à mão
// e a aba aponta para a próxima competição (9.2)
function PastSeason({ season }: { season: PastSeasonItem }) {
  return (
    <>
      <List>
        <StandingSummaryItem
          position={season.final_position}
          competitionName={season.competition_name}
          categoryName={season.category_name}
          partnerName={season.partner_name ?? undefined}
          complement={`Encerrada · ${season.season_name}`}
          href={season.href}
        />
      </List>
      <EmptyState
        title="Nenhuma competição em andamento."
        description="A inscrição é feita com o organizador. Encontre a próxima no Explorar."
        action={<ExploreAction />}
      />
    </>
  );
}

function NeverEnrolled() {
  return (
    <EmptyState
      icon={TrophyIcon}
      title="Você ainda não está em nenhuma competição."
      description="A inscrição é feita com o organizador. Encontre uma no Explorar."
      action={<ExploreAction />}
    />
  );
}

export type { CompetitionsTabProps };
