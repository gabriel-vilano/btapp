"use client";

import { XIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Alert } from "@/src/components/ui/Alert";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { Button } from "@/src/components/ui/Button";
import { IconButtonLink } from "@/src/components/ui/IconButton";
import { OWN_PROFILE_PATH } from "@/src/lib/domain/profile-page";
import styles from "./EditProfile.module.css";

/**
 * "Editar perfil" sem os dados do jogador. Um formulário vazio, se salvo, apagaria a
 * data de nascimento gravada, então a tela para aqui e oferece tentar de novo.
 */
export function EditProfileLoadError() {
  const router = useRouter();
  return (
    <div className={styles["edit-profile"]}>
      <AppHeader
        title="Editar perfil"
        actions={<IconButtonLink href={OWN_PROFILE_PATH} icon={XIcon} label="Fechar" />}
      />
      <div className={styles["edit-profile__load-error"]}>
        <Alert status="attention" title="Não foi possível carregar seu perfil" description="Confira a conexão e tente de novo." />
        <Button variant="secondary" fullWidth onClick={() => router.refresh()}>
          Tentar de novo
        </Button>
      </div>
    </div>
  );
}
