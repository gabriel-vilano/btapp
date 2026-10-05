"use client";

import { UsersThreeIcon } from "@phosphor-icons/react";
import { Avatar } from "@/src/components/ui/Avatar";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { List, ListItem } from "@/src/components/ui/ListItem";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { brand } from "@/src/lib/brand";
import { formatCount } from "@/src/lib/formatters";
import { EXPLORE_PATH, firstName, type FriendsListData } from "@/src/lib/domain/profile-page";
import styles from "./FriendsList.module.css";

interface FriendsListProps {
  data: FriendsListData;
}

/**
 * Título da tela, no cabeçalho de detalhe: "Seus amigos" ou "Amigos de Lucas".
 * @example <DetailHeader title={friendsListTitle(data)} />
 */
export function friendsListTitle(data: FriendsListData): string {
  return data.is_own ? "Seus amigos" : `Amigos de ${firstName(data.owner.name)}`;
}

/**
 * Lista de amigos de um jogador (PROFILE.md PF5): cada linha leva ao perfil do amigo.
 * O cabeçalho, com o título e o "Voltar" ao perfil, é da página.
 * @example <FriendsList data={buildFriendsList(domain, { username, viewerId })} />
 */
export function FriendsList({ data }: FriendsListProps) {
  if (data.friends.length === 0) return <FriendsListEmpty data={data} />;
  return (
    <div className={styles.friends}>
      <p className={styles.friends__count}>{formatCount(data.friends.length, "amigo", "amigos")}</p>
      <List divided aria-label={friendsListTitle(data)}>
        {data.friends.map((friend) => (
          <ListItem
            key={friend.id}
            href={friend.href}
            leading={<Avatar url={friend.avatar_url} alt={friend.name} size={40} />}
            title={friend.name}
            supportingText={`@${friend.username} · ${formatCount(friend.total_matches, "jogo", "jogos")}`}
          />
        ))}
      </List>
    </div>
  );
}

function FriendsListEmpty({ data }: FriendsListProps) {
  if (!data.is_own) {
    return (
      <div className={styles.friends}>
        <EmptyState icon={UsersThreeIcon} title={`${firstName(data.owner.name)} ainda não tem amigos no ${brand.nameNoBreak}.`} />
      </div>
    );
  }
  return (
    <div className={styles.friends}>
      <EmptyState
        icon={UsersThreeIcon}
        title={`Você ainda não tem amigos no ${brand.nameNoBreak}.`}
        description="Adicione jogadores pelo perfil deles ou pela busca."
        action={<ButtonLink href={EXPLORE_PATH}>Buscar jogadores</ButtonLink>}
      />
    </div>
  );
}

/** Carregando: o cabeçalho da tela aparece na hora (N23); a lista, em esqueleto de 5 linhas. */
export function FriendsListSkeleton() {
  return (
    <div className={styles.friends} aria-hidden>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className={styles["friends__row-skeleton"]}>
          <Skeleton shape="circle" size={40} />
          <Skeleton shape="text" textScale="body-md" lines={2} />
        </div>
      ))}
    </div>
  );
}

export type { FriendsListProps };
