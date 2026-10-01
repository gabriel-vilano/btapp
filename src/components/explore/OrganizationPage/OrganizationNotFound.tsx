"use client";

import { StorefrontIcon } from "@phosphor-icons/react";
import { ButtonLink } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";

const EXPLORE_HREF = "/explorar";

/**
 * @username de organização que não existe. O cabeçalho da tela é da página.
 * @example <OrganizationNotFound />
 */
export function OrganizationNotFound() {
  return (
    <EmptyState
      icon={StorefrontIcon}
      title="Organização não encontrada"
      description="Confira o @username no link."
      action={<ButtonLink href={EXPLORE_HREF}>Ir para o Explorar</ButtonLink>}
    />
  );
}
