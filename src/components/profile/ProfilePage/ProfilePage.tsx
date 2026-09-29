"use client";

import { GearIcon } from "@phosphor-icons/react";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { IconButtonLink } from "@/src/components/ui/IconButton";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { ProfileHeader, ProfileHeaderSkeleton } from "@/src/components/profile/ProfileHeader";
import {
  FEED_PATH,
  OWN_HISTORY_PATH,
  SETTINGS_PATH,
  firstName,
  playerMatchesPath,
  type ProfilePageData,
} from "@/src/lib/domain/profile-page";
import { ProfileAction } from "./ProfileAction";
import { ProfileMenu } from "./ProfileMenu";
import { ProfileSection } from "./ProfileSection";
import { RankingList, RecentMatches, SeasonList, VersusList } from "./ProfileSections";
import styles from "./ProfilePage.module.css";

interface ProfilePageProps {
  data: ProfilePageData;
}

/**
 * Perfil do jogador (PROFILE.md): rolagem única, na ordem da PF1. O próprio perfil e o de
 * outro jogador são a mesma tela; muda quem vê (PF3).
 * @example <ProfilePage data={buildProfilePage(mockProfileDomain, request)} />
 */
export function ProfilePage({ data }: ProfilePageProps) {
  const { player, relation } = data;
  const isOwn = relation === "self";
  const name = firstName(player.name);
  return (
    <div className={styles.profile}>
      <ProfileTopBar data={data} />
      <div className={styles.profile__header}>
        <ProfileHeader
          player={player}
          friendsCount={data.friends_count}
          wins={data.record.wins}
          losses={data.record.losses}
          action={<ProfileAction relation={relation} firstName={name} />}
        />
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

// No próprio perfil, a engrenagem das configurações (N8); no de outro, "Voltar" e o menu ⋯ (PF8).
// O "Voltar" leva ao Feed, a aba dona do jogador (N28), até a aba de origem (N10) existir.
function ProfileTopBar({ data }: ProfilePageProps) {
  const { username, name } = data.player;
  if (data.relation === "self") {
    return (
      <AppHeader
        title={`@${username}`}
        actions={<IconButtonLink href={SETTINGS_PATH} icon={GearIcon} label="Configurações" />}
      />
    );
  }
  return <AppHeader title={`@${username}`} backHref={FEED_PATH} actions={<ProfileMenu username={username} name={name} />} />;
}

/**
 * Carregando (PF21, N23): o cabeçalho da tela na hora e o esqueleto do cabeçalho do perfil
 * e de 3 linhas de lista.
 */
export function ProfilePageSkeleton({ title = "Perfil" }: { title?: string }) {
  return (
    <div className={styles.profile}>
      <AppHeader title={title} />
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
