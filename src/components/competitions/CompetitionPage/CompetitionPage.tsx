"use client";

import { CaretRightIcon, GearSixIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Avatar } from "@/src/components/ui/Avatar";
import { Icon } from "@/src/components/ui/Icon";
import { List, ListItem } from "@/src/components/ui/ListItem";
import {
  competitionPageBlocks,
  organizationHref,
  type CompetitionPageData,
  type RankingPageData,
  type RegisterInterest,
} from "@/src/lib/domain/competition-page";
import { CompetitionCategories } from "./CompetitionCategories";
import { CompetitionRules } from "./CompetitionRules";
import { CompetitionSeason } from "./CompetitionSeason";
import { EnrollmentBlock } from "./EnrollmentBlock";
import { TournamentInfo } from "./TournamentInfo";
import styles from "./CompetitionPage.module.css";

const COMPETITIONS_HREF = "/competicoes";

const COMPETITION_TYPE_LABEL: Record<CompetitionPageData["type"], string> = {
  ranking: "Ranking",
  tournament: "Torneio",
};

interface CompetitionPageProps {
  data: CompetitionPageData;
  /** Momento da leitura (ISO 8601): prazo da rodada, corte da final e torneio que já aconteceu. */
  now: string;
  /** Registra o "Tenho interesse" desta competição (EX29). */
  registerInterest: RegisterInterest;
}

/**
 * Página da competição. No ranking (docs/RANKING.md, RK17): organizador,
 * categorias, temporada e regras. No torneio, o mínimo do Explorar (EXPLORE.md,
 * EX34): organizador, data e local e categorias. O cabeçalho da tela, com o
 * nome, é da página. Conforme quem vê, a entrada da área "Administrar" (N31) e
 * o "Como se inscrever": completo logo abaixo do cabeçalho (no torneio, logo
 * abaixo de "Data e local"), para quem não tem inscrição na competição, ou
 * compacto abaixo das categorias, para quem já joga uma delas e tem outra
 * livre (EX26 e EX27).
 * @example <CompetitionPage data={mockCompetitionPage.enrolled} now={new Date().toISOString()} registerInterest={…} />
 */
export function CompetitionPage({ data, now, registerInterest }: CompetitionPageProps) {
  const blocks = competitionPageBlocks(data, now);
  const enrollment = (placement: "full" | "compact") => (
    <EnrollmentBlock
      organizer={data.organizer}
      placement={placement}
      interested={data.viewer.interested}
      registerInterest={registerInterest}
    />
  );
  return (
    <div className={styles["competition-page"]}>
      <OrganizerLine organizer={data.organizer} type={data.type} />
      {/* No torneio, a data vem antes da inscrição: é ela que decide se dá para ir (DEC-EXP-7) */}
      {data.type === "tournament" && <TournamentInfo tournament={data} now={now} />}
      {blocks.admin && <AdminEntry slug={data.slug} />}
      {blocks.enrollment === "full" && enrollment("full")}
      <CompetitionCategories competitionName={data.name} categories={data.categories} />
      {blocks.enrollment === "compact" && enrollment("compact")}
      {data.type === "ranking" && <RankingDetails data={data} now={now} />}
    </div>
  );
}

// Temporada e regras: o torneio não tem temporada, e as regras dele são da spec do torneio
function RankingDetails({ data, now }: { data: RankingPageData; now: string }) {
  return (
    <>
      <CompetitionSeason
        competitionName={data.name}
        season={data.season}
        matchesPerRound={data.matches_per_round}
        now={now}
      />
      <CompetitionRules data={data} />
    </>
  );
}

interface OrganizerLineProps {
  organizer: CompetitionPageData["organizer"];
  type: CompetitionPageData["type"];
}

// Avatar e nome levam à página da organização (EX23); o tipo fica fora do link
function OrganizerLine({ organizer, type }: OrganizerLineProps) {
  return (
    <div className={styles["competition-page__organizer"]}>
      <Link href={organizationHref(organizer.username)} className={styles["competition-page__organizer-link"]}>
        {/* O nome ao lado já é o nome do link: o avatar não o repete no leitor de tela */}
        <span aria-hidden className={styles["competition-page__organizer-avatar"]}>
          <Avatar url={organizer.avatar_url} alt={organizer.name} size={40} />
        </span>
        <span className={styles["competition-page__organizer-name"]}>{organizer.name}</span>
      </Link>
      <p className={styles["competition-page__organizer-kind"]}>{COMPETITION_TYPE_LABEL[type]}</p>
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
