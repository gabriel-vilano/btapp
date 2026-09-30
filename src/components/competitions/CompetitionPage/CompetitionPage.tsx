"use client";

import { CaretRightIcon, GearSixIcon } from "@phosphor-icons/react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { competitionPageBlocks, type CompetitionPageData } from "@/src/lib/domain/competition-page";
import { CompetitionCategories } from "./CompetitionCategories";
import { CompetitionRules } from "./CompetitionRules";
import { CompetitionSeason } from "./CompetitionSeason";
import { EnrollmentBlock } from "./EnrollmentBlock";
import styles from "./CompetitionPage.module.css";

const COMPETITIONS_HREF = "/competicoes";

interface CompetitionPageProps {
  data: CompetitionPageData;
  /** Momento da leitura (ISO 8601), para o prazo da rodada e o corte da final. */
  now: string;
}

/**
 * Página da competição de ranking (docs/RANKING.md, RK17): organizador,
 * categorias, temporada e regras. O cabeçalho da tela, com o nome, é da página. Abaixo do cabeçalho, conforme quem vê, a
 * entrada da área "Administrar" (N31) e "Como se inscrever" (N33).
 * @example <CompetitionPage data={mockCompetitionPage.enrolled} now={new Date().toISOString()} />
 */
export function CompetitionPage({ data, now }: CompetitionPageProps) {
  const blocks = competitionPageBlocks(data);
  return (
    <div className={styles["competition-page"]}>
      <OrganizerLine organizer={data.organizer} />
      {blocks.admin && <AdminEntry slug={data.slug} />}
      {blocks.enrollment && <EnrollmentBlock organizer={data.organizer} interested={data.viewer.interested} />}
      <CompetitionCategories competitionName={data.name} categories={data.categories} />
      <CompetitionSeason
        competitionName={data.name}
        season={data.season}
        matchesPerRound={data.matches_per_round}
        now={now}
      />
      <CompetitionRules data={data} />
    </div>
  );
}

function OrganizerLine({ organizer }: { organizer: CompetitionPageData["organizer"] }) {
  return (
    <div className={styles["competition-page__organizer"]}>
      <Avatar url={organizer.avatar_url} alt={organizer.name} size={40} />
      <div>
        <p className={styles["competition-page__organizer-name"]}>{organizer.name}</p>
        <p className={styles["competition-page__organizer-kind"]}>Ranking</p>
      </div>
    </div>
  );
}

// Só a entrada: o "Lançar sorteio" e as outras decisões moram na área (N31)
function AdminEntry({ slug }: { slug: string }) {
  return (
    <List aria-label="Admin da competição">
      <ListItem
        href={`${COMPETITIONS_HREF}/${slug}/administrar`}
        leading={<Icon icon={GearSixIcon} size="md" />}
        title="Administrar"
        supportingText="Sorteio, arbitragem e partidas da competição"
        trailing={<Icon icon={CaretRightIcon} size="sm" />}
      />
    </List>
  );
}

export type { CompetitionPageProps };
