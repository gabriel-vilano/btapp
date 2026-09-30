"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { StandingSummaryItem } from "@/src/components/ui/StandingSummaryItem";
import { formatCount } from "@/src/lib/formatters";
import type { CompetitionCategoryRow } from "@/src/lib/domain/competition-page";
import styles from "./CompetitionPage.module.css";

interface CompetitionCategoriesProps {
  competitionName: string;
  categories: CompetitionCategoryRow[];
}

/**
 * Bloco Categorias (docs/RANKING.md, RK17): uma linha por categoria, com a
 * posição de quem vê quando ele está inscrito nela. Toque → classificação.
 */
export function CompetitionCategories({ competitionName, categories }: CompetitionCategoriesProps) {
  const headingId = useId();
  return (
    <section className={styles["competition-page__section"]} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles["competition-page__section-title"]}>
        Categorias
      </h2>
      <List>
        {categories.map((category) => (
          <CategoryRow key={category.category_id} competitionName={competitionName} category={category} />
        ))}
      </List>
    </section>
  );
}

/** "16 duplas", "20 jogadores": a unidade que compete na categoria (R1). */
export function formatUnitCount(category: Pick<CompetitionCategoryRow, "modality" | "unit_count">): string {
  if (category.modality === "doubles") return formatCount(category.unit_count, "dupla", "duplas");
  return formatCount(category.unit_count, "jogador", "jogadores");
}

const chevron = <Icon icon={CaretRightIcon} size="sm" />;

function CategoryRow({ competitionName, category }: { competitionName: string; category: CompetitionCategoryRow }) {
  const { standing } = category;
  const units = formatUnitCount(category);
  if (standing?.position != null) {
    return (
      <StandingSummaryItem
        position={standing.position}
        competitionName={competitionName}
        categoryName={category.name}
        partnerName={standing.partner_name ?? undefined}
        delta={standing.delta ?? undefined}
        complement={units}
        href={category.href}
      />
    );
  }
  // Inscrito numa categoria ainda sem resultado confirmado: sem posição (RK20)
  const enrolledNote = standing && (standing.partner_name ? `você joga com ${standing.partner_name}` : "você está inscrito");
  return (
    <ListItem
      href={category.href}
      title={category.name}
      supportingText={enrolledNote ? `${units} · ${enrolledNote}` : units}
      trailing={chevron}
    />
  );
}
