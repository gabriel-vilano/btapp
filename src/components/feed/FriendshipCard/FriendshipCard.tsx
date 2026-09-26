"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { Button } from "@/src/components/ui/Button";
import { ProfileMiniCard } from "@/src/components/feed/ProfileMiniCard";
import type { FriendshipCard as FriendshipCardData, PlayerInfo } from "@/src/types/feed";
import styles from "./FriendshipCard.module.css";

interface FriendshipCardProps {
  data: FriendshipCardData;
}

export function FriendshipCard({ data }: FriendshipCardProps) {
  const target = pickAddTarget(data);

  return (
    <>
      <div className={styles.minicards}>
        <ProfileMiniCard player={data.player_a} />
        <ProfileMiniCard player={data.player_b} />
      </div>

      {target && (
        <Button variant="primary" fullWidth>
          <Icon icon={PlusIcon} size="sm" weight="regular" />
          Adicionar {target.name.split(" ")[0]}
        </Button>
      )}
    </>
  );
}

function pickAddTarget(data: FriendshipCardData): PlayerInfo | null {
  const { player_a, player_b, user_is_friend_of_a, user_is_friend_of_b } = data;

  if (user_is_friend_of_a && user_is_friend_of_b) return null;
  if (user_is_friend_of_a) return player_b;
  if (user_is_friend_of_b) return player_a;
  // Sem dado de "distância social" no MVP — referencia player_b por convenção.
  return player_b;
}
