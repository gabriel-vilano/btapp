"use client";

import { UserCircleIcon } from "@phosphor-icons/react";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { FEED_PATH } from "@/src/lib/domain/profile-page";
import styles from "./ProfilePage.module.css";

/**
 * @username inexistente (PROFILE.md §6.2). O texto não diz se a conta existiu um dia.
 * @example <PlayerNotFound />
 */
export function PlayerNotFound() {
  return (
    <div className={styles.profile}>
      <AppHeader title="Perfil" backHref={FEED_PATH} />
      <EmptyState
        icon={UserCircleIcon}
        title="Jogador não encontrado"
        description="Confira o @username no link."
        action={<ButtonLink href={FEED_PATH}>Voltar ao feed</ButtonLink>}
      />
    </div>
  );
}
