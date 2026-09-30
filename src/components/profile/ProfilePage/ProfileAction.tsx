"use client";

import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { EDIT_PROFILE_PATH, type ProfileRelation } from "@/src/lib/domain/profile-page";

interface ProfileActionProps {
  relation: ProfileRelation;
  /** Primeiro nome do dono do perfil: "+ Adicionar Lucas", "Aceitar pedido de Lucas". */
  firstName: string;
}

/**
 * Ação do cabeçalho do perfil pelo estado da amizade (PROFILE.md, PF7).
 * Os botões de amizade ainda não agem: os handlers e as confirmações vêm com as ações de amizade.
 * @example <ProfileAction relation="none" firstName="Lucas" />
 */
export function ProfileAction({ relation, firstName }: ProfileActionProps) {
  if (relation === "self") {
    return (
      <ButtonLink href={EDIT_PROFILE_PATH} variant="secondary">
        Editar perfil
      </ButtonLink>
    );
  }
  if (relation === "none") {
    return (
      <Button>
        <Icon icon={PlusIcon} size="sm" weight="bold" /> Adicionar {firstName}
      </Button>
    );
  }
  return <FriendshipAction relation={relation} firstName={firstName} />;
}

function FriendshipAction({ relation, firstName }: ProfileActionProps) {
  if (relation === "request_sent") return <Button variant="secondary">Pedido enviado</Button>;
  if (relation === "request_received") {
    return (
      <>
        <Button aria-label={`Aceitar pedido de ${firstName}`}>Aceitar</Button>
        <Button variant="secondary" aria-label={`Recusar pedido de ${firstName}`}>
          Recusar
        </Button>
      </>
    );
  }
  return (
    <Button variant="secondary" aria-label={`Amigos de ${firstName}, abrir opções`}>
      Amigos <Icon icon={CheckIcon} size="sm" weight="bold" />
    </Button>
  );
}

export type { ProfileActionProps };
