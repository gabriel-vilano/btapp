"use client";

import { StarIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Badge } from "@/src/components/ui/Badge";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { ScoreBlock } from "@/src/components/ui/ScoreBlock";
import { StandingSummaryItem } from "@/src/components/ui/StandingSummaryItem";
import { TextLink } from "@/src/components/ui/TextLink";
import { formatCount, formatEventMoment, formatTimestamp } from "@/src/lib/formatters";
import {
  FRIENDLY_PATH,
  type ProfileMatchItem,
  type ProfileRankingItem,
  type ProfileSeasonItem,
  type ProfileVersusView,
} from "@/src/lib/domain/profile-page";
import type { SeasonMilestone } from "@/src/lib/domain/profile";
import styles from "./ProfilePage.module.css";

// O conteúdo de cada seção do perfil (PROFILE.md §4 e §5). A seção em si,
// com o título e o erro, é o ProfileSection.

/** Bloco "Vocês" (PF16, PF17): o confronto definido primeiro, depois o H2H. */
export function VersusList({ versus }: { versus: ProfileVersusView }) {
  const { next_match: next, head_to_head: h2h } = versus;
  return (
    <List>
      {next && (
        <ListItem
          href={next.href}
          title={`Próximo confronto · ${next.stage}`}
          supportingText={next.scheduled_at ? formatEventMoment(next.scheduled_at) : "Data a combinar"}
        />
      )}
      {h2h && (
        <ListItem
          href={h2h.href}
          title={`Vocês se enfrentaram ${formatCount(h2h.matches, "vez", "vezes")}`}
          supportingText={`Você venceu ${h2h.viewer_wins}`}
        />
      )}
    </List>
  );
}

/** Linhas de "Rankings" (PF10), com "Melhor: 3º" no próprio perfil (PF14). */
export function RankingList({ items }: { items: ProfileRankingItem[] }) {
  return (
    <List>
      {items.map((item) => (
        <StandingSummaryItem
          key={item.enrollment_id}
          position={item.position}
          competitionName={item.competition_name}
          categoryName={item.category_name}
          partnerName={item.partner_name ?? undefined}
          delta={item.delta ?? undefined}
          complement={item.best_position === null ? undefined : `Melhor: ${item.best_position}º`}
          href={item.href}
        />
      ))}
    </List>
  );
}

// Como no card de resultado (FEED_CARDS.md §3.3): quem perdeu por desistência leva "Desistência"
function outcomeBadge(item: ProfileMatchItem): ReactNode {
  if (item.outcome === "win") return <Badge tone="success">Vitória</Badge>;
  return <Badge tone="attention">{item.result_type === "retired" ? "Desistência" : "Derrota"}</Badge>;
}

function MatchRow({ item }: { item: ProfileMatchItem }) {
  return (
    <ListItem
      href={item.href}
      title={item.opponents}
      supportingText={`${item.context} · ${formatTimestamp(item.played_at)}`}
      trailing={
        <span className={styles.profile__result}>
          {outcomeBadge(item)}
          <ScoreBlock score={item.score} variant="compact" perspective={item.outcome === "win" ? "winner" : "loser"} />
        </span>
      }
    />
  );
}

interface RecentMatchesProps {
  items: ProfileMatchItem[];
  isOwn: boolean;
  firstName: string;
  /** "Ver todas": o Histórico da aba Jogos no próprio perfil, a lista do jogador no de outro. */
  allMatchesHref: string;
}

/** "Partidas recentes" (PF18). Vazia, vira o EmptyState da seção 6.2, e nunca some (PF2). */
export function RecentMatches({ items, isOwn, firstName, allMatchesHref }: RecentMatchesProps) {
  if (items.length === 0) return <NoMatches isOwn={isOwn} firstName={firstName} />;
  return (
    <>
      <List>
        {items.map((item) => (
          <MatchRow key={item.match_id} item={item} />
        ))}
      </List>
      <div className={styles["profile__see-all"]}>
        <TextLink href={allMatchesHref}>Ver todas</TextLink>
      </div>
    </>
  );
}

function NoMatches({ isOwn, firstName }: { isOwn: boolean; firstName: string }) {
  if (!isOwn) return <EmptyState title="Nenhuma partida ainda." description={`As partidas de ${firstName} aparecem aqui.`} />;
  return (
    <EmptyState
      title="Nenhuma partida ainda."
      description="Suas partidas confirmadas aparecem aqui."
      action={
        <ButtonLink href={FRIENDLY_PATH} variant="secondary">
          Registrar amistoso
        </ButtonLink>
      }
    />
  );
}

function milestoneLabel(milestone: SeasonMilestone): string {
  return milestone.type === "leader" ? "Líder" : `Top ${milestone.n}`;
}

function SeasonBadges({ item }: { item: ProfileSeasonItem }) {
  const labels = [...item.milestones.map(milestoneLabel), item.final_name].filter((label) => label !== null);
  if (labels.length === 0) return null;
  return (
    <span className={styles.profile__milestones}>
      {labels.map((label) => (
        <Badge key={label} tone="accent" icon={StarIcon}>
          {label}
        </Badge>
      ))}
    </span>
  );
}

function SeasonRow({ item }: { item: ProfileSeasonItem }) {
  const position = item.final_position === null ? "–" : `${item.final_position}º`;
  const spoken = item.final_position === null ? "Sem posição" : `${item.final_position}º`;
  const partner = item.partner_name ? ` · com ${item.partner_name}` : "";
  return (
    <ListItem
      href={item.href}
      leading={<span className={styles.profile__position}>{position}</span>}
      title={
        <>
          {/* O leading sai da leitura de tela: a posição final entra pelo título */}
          <span className={styles["profile__visually-hidden"]}>{spoken}, </span>
          {item.competition_name} · {item.category_name}
        </>
      }
      supportingText={`${item.season_name}${partner}`}
      trailing={<SeasonBadges item={item} />}
    />
  );
}

/** "Temporadas" (PF19): posição final e marcos, a mais recente primeiro. */
export function SeasonList({ items }: { items: ProfileSeasonItem[] }) {
  return (
    <List>
      {items.map((item) => (
        <SeasonRow key={item.enrollment_id} item={item} />
      ))}
    </List>
  );
}
