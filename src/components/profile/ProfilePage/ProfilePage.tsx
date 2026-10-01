"use client";

import { GearSixIcon } from "@phosphor-icons/react";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { IconButtonLink } from "@/src/components/ui/IconButton";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { ProfileHeader, ProfileHeaderSkeleton } from "@/src/components/profile/ProfileHeader";
import {
  OWN_HISTORY_PATH,
  SETTINGS_PATH,
  firstName,
  playerMatchesPath,
  type ProfilePageData,
} from "@/src/lib/domain/profile-page";
import { ProfileAction } from "./ProfileAction";
import { ProfileSection } from "./ProfileSection";
import { useFriendship } from "./useFriendship";
import { RankingList, RecentMatches, SeasonList, VersusList } from "./ProfileSections";
import styles from "./ProfilePage.module.css";

interface ProfilePageProps {
  data: ProfilePageData;
}

/**
 * Perfil do jogador (PROFILE.md): rolagem única, na ordem da PF1. O próprio perfil e o de
 * outro jogador são a mesma tela; muda quem vê (PF3). O cabeçalho é da página: o
 * `OwnProfileHeader` na aba Perfil; o de detalhe, com o `ProfileMenu`, no de outro jogador.
 * @example <ProfilePage data={buildProfilePage(mockProfileDomain, request)} />
 */
export function ProfilePage({ data }: ProfilePageProps) {
  const { player } = data;
  const name = firstName(player.name);
  const { relation, friendsCount, announcement, act } = useFriendship(data.relation, data.friends_count, name);
  const isOwn = relation === "self";
  return (
    <div className={styles.profile}>
      <div className={styles.profile__header}>
        <ProfileHeader
          player={player}
          friendsCount={friendsCount}
          wins={data.record.wins}
          losses={data.record.losses}
          action={<ProfileAction relation={relation} firstName={name} onAction={act} />}
        />
        <p className={styles["profile__sr-only"]} role="status">
          {announcement}
        </p>
      </div>
      <ProfileSection title="Vocês" section={data.versus}>
        {(versus) => versus && <VersusList versus={versus} />}
      </ProfileSection>
      <ProfileSection title="Rankings" section={data.rankings}>
        {(items) => (items.length > 0 ? <RankingList items={items} /> : null)}
      </ProfileSection>
      <ProfileSection title="Partidas recentes" section={data.recent_matches}>
        {(items) => (
          <RecentMatches
            items={items}
            isOwn={isOwn}
            firstName={name}
            allMatchesHref={isOwn ? OWN_HISTORY_PATH : playerMatchesPath(player.username)}
          />
        )}
      </ProfileSection>
      <ProfileSection title="Temporadas" section={data.seasons}>
        {(items) => (items.length > 0 ? <SeasonList items={items} /> : null)}
      </ProfileSection>
    </div>
  );
}

/**
 * Cabeçalho da aba Perfil, a raiz da aba: sem "Voltar", com a engrenagem das configurações (N8).
 * O h1 da tela é o nome, no ProfileHeader (PROFILE.md §7): o @username do topo vai como `p`.
 * No perfil de outro jogador, "Voltar" e o menu ⋯ (PF8) vêm do cabeçalho de detalhe da página.
 * @example <OwnProfileHeader username="lucassilva" />
 */
export function OwnProfileHeader({ username }: { username: string }) {
  return (
    <AppHeader
      title={`@${username}`}
      titleAs="p"
      actions={<IconButtonLink href={SETTINGS_PATH} icon={GearSixIcon} label="Configurações" />}
    />
  );
}

/**
 * Carregando (PF21, N23): o esqueleto do cabeçalho do perfil e de 3 linhas de lista. O
 * cabeçalho da tela, que aparece na hora, é da página.
 */
export function ProfilePageSkeleton() {
  return (
    <div className={styles.profile}>
      <div className={styles.profile__header}>
        <ProfileHeaderSkeleton />
      </div>
      <div className={styles["profile__list-skeleton"]} aria-hidden>
        {[0, 1, 2].map((row) => (
          <div key={row} className={styles["profile__row-skeleton"]}>
            <Skeleton shape="circle" size={40} />
            <Skeleton shape="text" textScale="body-md" lines={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

export type { ProfilePageProps };
