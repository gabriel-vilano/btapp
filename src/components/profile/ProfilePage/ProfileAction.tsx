"use client";

import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useRef, useState, type Ref } from "react";
import { Button, ButtonLink } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import type { FriendshipAction } from "@/src/lib/domain/friendship";
import { EDIT_PROFILE_PATH, type ProfileRelation } from "@/src/lib/domain/profile-page";
import { FriendshipConfirm, type ConfirmedAction } from "./FriendshipConfirm";

interface ProfileActionProps {
  relation: ProfileRelation;
  /** Primeiro nome do dono do perfil: "+ Adicionar Lucas", "Aceitar pedido de Lucas". */
  firstName: string;
  /** A ação escolhida, já confirmada quando pede confirmação (cancelar, desfazer). */
  onAction: (action: FriendshipAction) => void;
}

/**
 * Ação do cabeçalho do perfil pelo estado da amizade (PROFILE.md, PF7). Cancelar o pedido e
 * desfazer a amizade abrem a confirmação antes de chamar `onAction`.
 * @example <ProfileAction relation="none" firstName="Lucas" onAction={act} />
 */
export function ProfileAction({ relation, ...props }: ProfileActionProps) {
  if (relation === "self") {
    return (
      <ButtonLink href={EDIT_PROFILE_PATH} variant="secondary">
        Editar perfil
      </ButtonLink>
    );
  }
  return <FriendshipButtons relation={relation} {...props} />;
}

type FriendshipButtonsProps = ProfileActionProps & { relation: Exclude<ProfileRelation, "self"> };

function FriendshipButtons({ relation, firstName, onAction }: FriendshipButtonsProps) {
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState<ConfirmedAction | null>(null);
  // Recusar some com o clique: o foco volta ao botão que fica, em vez de cair no body
  const decline = () => {
    onAction("decline");
    primaryRef.current?.focus();
  };
  const confirm = (action: ConfirmedAction) => {
    setConfirming(null);
    onAction(action);
  };
  // O primeiro botão fica sempre na mesma posição: o React reaproveita o elemento e o
  // foco continua nele quando o estado muda (ex.: "Aceitar" vira "Amigos ✓")
  return (
    <>
      <PrimaryButton
        ref={primaryRef}
        relation={relation}
        firstName={firstName}
        onRequest={() => onAction("request")}
        onAccept={() => onAction("accept")}
        onConfirm={setConfirming}
      />
      {relation === "request_received" && (
        <Button variant="secondary" aria-label={`Recusar pedido de ${firstName}`} onClick={decline}>
          Recusar
        </Button>
      )}
      <FriendshipConfirm
        action={confirming}
        firstName={firstName}
        onCancel={() => setConfirming(null)}
        onConfirm={confirm}
      />
    </>
  );
}

interface PrimaryButtonProps {
  ref: Ref<HTMLButtonElement>;
  relation: Exclude<ProfileRelation, "self">;
  firstName: string;
  onRequest: () => void;
  onAccept: () => void;
  onConfirm: (action: ConfirmedAction) => void;
}

function PrimaryButton({ ref, relation, firstName, onRequest, onAccept, onConfirm }: PrimaryButtonProps) {
  if (relation === "none") {
    return (
      <Button ref={ref} onClick={onRequest}>
        <Icon icon={PlusIcon} size="sm" weight="bold" /> Adicionar {firstName}
      </Button>
    );
  }
  if (relation === "request_received") {
    return (
      <Button ref={ref} aria-label={`Aceitar pedido de ${firstName}`} onClick={onAccept}>
        Aceitar
      </Button>
    );
  }
  if (relation === "request_sent") {
    return (
      <Button
        ref={ref}
        variant="secondary"
        aria-haspopup="dialog"
        aria-label={`Pedido enviado para ${firstName}, abrir opções`}
        onClick={() => onConfirm("cancel")}
      >
        Pedido enviado
      </Button>
    );
  }
  return (
    <Button
      ref={ref}
      variant="secondary"
      aria-haspopup="dialog"
      aria-label={`Amigos de ${firstName}, abrir opções`}
      onClick={() => onConfirm("unfriend")}
    >
      Amigos <Icon icon={CheckIcon} size="sm" weight="bold" />
    </Button>
  );
}

export type { ProfileActionProps };
