"use client";

import { DotsThreeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Dialog } from "@/src/components/ui/Dialog";
import { IconButton } from "@/src/components/ui/IconButton";
import { List, ListItem } from "@/src/components/ui/ListItem";
import type { FriendlyResultActions } from "./useFriendlyResult";
import styles from "./FriendlyScreen.module.css";

type DialogProps = { actions: FriendlyResultActions };

/**
 * Contestar avisa antes do que acontece: sem admin, o resultado é descartado
 * (R43). Não pede motivo, porque ninguém vai arbitrar (§6.2).
 */
export function ContestFriendlyDialog({ actions }: DialogProps) {
  const close = () => actions.openDialog(null);
  return (
    <Dialog
      open={actions.dialog === "contest"}
      onClose={close}
      title="Contestar o amistoso?"
      description="O resultado é descartado. Para valer, um dos lados lança de novo."
      footer={<DialogActions keepLabel="Voltar" actionLabel="Contestar" onKeep={close} onAct={actions.contest} />}
    >
      {actions.error && <Alert status="attention" title={actions.error} />}
    </Dialog>
  );
}

/**
 * Menu "⋯" de quem lançou, com "Cancelar amistoso" (R43): fora do caminho
 * principal e com confirmação antes de valer, como o desfazer do ranking (RG16).
 */
export function CancelFriendlyMenu({ actions }: DialogProps) {
  const [step, setStep] = useState<"menu" | "confirm">("menu");
  const open = actions.dialog === "cancel";
  const close = () => {
    actions.openDialog(null);
    setStep("menu");
  };
  return (
    <>
      <IconButton icon={DotsThreeIcon} label="Mais opções do amistoso" onClick={() => actions.openDialog("cancel")} />
      {step === "menu" ? (
        <Dialog open={open} onClose={close} title="Opções do amistoso">
          <List>
            <ListItem onClick={() => setStep("confirm")} title="Cancelar amistoso" />
          </List>
        </Dialog>
      ) : (
        <Dialog
          open={open}
          onClose={close}
          title="Cancelar o amistoso?"
          description="Ele sai da agenda de todos e fica só no seu histórico, como cancelado."
          footer={<DialogActions keepLabel="Manter" actionLabel="Cancelar amistoso" onKeep={close} onAct={actions.cancel} />}
        >
          {actions.error && <Alert status="attention" title={actions.error} />}
        </Dialog>
      )}
    </>
  );
}

type DialogActionsProps = { keepLabel: string; actionLabel: string; onKeep: () => void; onAct: () => void };

function DialogActions({ keepLabel, actionLabel, onKeep, onAct }: DialogActionsProps) {
  return (
    <div className={styles["friendly-screen__actions"]}>
      <Button variant="secondary" fullWidth onClick={onKeep}>
        {keepLabel}
      </Button>
      <Button fullWidth onClick={onAct}>
        {actionLabel}
      </Button>
    </div>
  );
}
