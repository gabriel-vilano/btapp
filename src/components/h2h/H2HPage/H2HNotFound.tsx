"use client";

import { UsersThreeIcon } from "@phosphor-icons/react";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { FEED_PATH } from "@/src/lib/domain/profile-page";
import styles from "./H2HPage.module.css";

/**
 * "H2H não encontrado" (HEAD_TO_HEAD.md §6.1): @username inexistente, lados iguais ou
 * dupla que nunca existiu. Como o perfil inexistente, não diz qual foi o motivo.
 * O cabeçalho da tela é da página.
 * @example <H2HNotFound />
 */
export function H2HNotFound() {
  return (
    <div className={styles.h2h}>
      <EmptyState
        icon={UsersThreeIcon}
        title="H2H não encontrado"
        description="Confira os jogadores no link."
        action={<ButtonLink href={FEED_PATH}>Voltar ao feed</ButtonLink>}
      />
    </div>
  );
}
