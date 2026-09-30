"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/src/components/ui/Button";
import { EmptyState } from "@/src/components/ui/EmptyState";

interface AgendaErrorProps {
  onRetry: () => void;
}

/**
 * Erro ao carregar a agenda: no lugar do conteúdo, com "Tentar de novo". O
 * cabeçalho continua funcionando (N24).
 */
export function AgendaError({ onRetry }: AgendaErrorProps) {
  return (
    <div role="alert">
      <EmptyState
        icon={WarningCircleIcon}
        title="Não deu para carregar seus jogos."
        description="Confira a conexão e tente de novo."
        action={
          <Button variant="secondary" onClick={onRetry}>
            Tentar de novo
          </Button>
        }
      />
    </div>
  );
}
