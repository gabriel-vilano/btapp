"use client";

import { useRef } from "react";
import { Button } from "@/src/components/ui/Button";
import { Dialog } from "@/src/components/ui/Dialog";
import type { FriendshipAction } from "@/src/lib/domain/friendship";

/** As ações de amizade que pedem confirmação (PF7). */
export type ConfirmedAction = Extract<FriendshipAction, "cancel" | "unfriend">;

interface FriendshipConfirmProps {
  /** A ação a confirmar; null fecha o Dialog. */
  action: ConfirmedAction | null;
  firstName: string;
  onCancel: () => void;
  onConfirm: (action: ConfirmedAction) => void;
}

// A descrição diz o motivo da confirmação (PF7): a outra pessoa não é avisada, e
// refazer depende dela. Texto neutro em gênero, como o do feed (R26)
const COPY: Record<ConfirmedAction, (name: string) => { title: string; description: string; keep: string; confirm: string }> = {
  cancel: (name) => ({
    title: `Cancelar o pedido para ${name}?`,
    description: `${name} não recebe aviso. Se você pedir de novo, a amizade volta a depender do aceite de ${name}.`,
    keep: "Manter pedido",
    confirm: "Cancelar pedido",
  }),
  unfriend: (name) => ({
    title: `Desfazer a amizade com ${name}?`,
    description: `${name} não recebe aviso. Para voltarem a ser amigos, um novo pedido precisa do aceite de ${name}.`,
    keep: "Manter amizade",
    confirm: "Desfazer amizade",
  }),
};

/**
 * Confirmação de cancelar o pedido ou desfazer a amizade (PF7), no Dialog do DS.
 * @example <FriendshipConfirm action="unfriend" firstName="Pedro" onCancel={close} onConfirm={act} />
 */
export function FriendshipConfirm({ action, firstName, onCancel, onConfirm }: FriendshipConfirmProps) {
  const keepRef = useRef<HTMLButtonElement>(null);
  if (action === null) return null;
  const copy = COPY[action](firstName);
  // Foco inicial na opção que não desfaz nada, como o APG recomenda para ação destrutiva
  return (
    <Dialog
      open
      onClose={onCancel}
      title={copy.title}
      description={copy.description}
      initialFocusRef={keepRef}
      footer={
        <>
          <Button ref={keepRef} variant="ghost" onClick={onCancel}>
            {copy.keep}
          </Button>
          <Button onClick={() => onConfirm(action)}>{copy.confirm}</Button>
        </>
      }
    />
  );
}
