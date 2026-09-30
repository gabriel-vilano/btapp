"use client";

import { DotsThreeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Dialog } from "@/src/components/ui/Dialog";
import { IconButton } from "@/src/components/ui/IconButton";
import { List, ListItem } from "@/src/components/ui/ListItem";
import type { MatchResultActions } from "./matchResultContext";
import styles from "./MatchResult.module.css";

type UndoReportMenuProps = {
  actions: MatchResultActions;
};

/**
 * Menu "⋯" de quem lançou, com "Desfazer lançamento" (RG16). A ação fica fora
 * do caminho principal, num menu, e pede confirmação antes de valer.
 * @example <UndoReportMenu actions={actions} />
 */
export function UndoReportMenu({ actions }: UndoReportMenuProps) {
  const [step, setStep] = useState<"menu" | "confirm">("menu");
  const open = actions.dialog === "undo";
  const close = () => {
    actions.openDialog(null);
    setStep("menu");
  };
  return (
    <>
      <IconButton icon={DotsThreeIcon} label="Mais opções do resultado" onClick={() => actions.openDialog("undo")} />
      {step === "menu" ? (
        <Dialog open={open} onClose={close} title="Opções do resultado">
          <List>
            <ListItem onClick={() => setStep("confirm")} title="Desfazer lançamento" />
          </List>
        </Dialog>
      ) : (
        <Dialog
          open={open}
          onClose={close}
          title="Desfazer o lançamento?"
          description="A partida volta a esperar o resultado, e o outro lado é avisado. O lançamento desfeito fica no histórico."
          footer={<UndoActions onKeep={close} onUndo={actions.undo} />}
        >
          {actions.error && <Alert status="attention" title={actions.error} />}
        </Dialog>
      )}
    </>
  );
}

function UndoActions({ onKeep, onUndo }: { onKeep: () => void; onUndo: () => void }) {
  return (
    <div className={styles.dialog__actions}>
      <Button variant="secondary" fullWidth onClick={onKeep}>
        Manter
      </Button>
      <Button fullWidth onClick={onUndo}>
        Desfazer lançamento
      </Button>
    </div>
  );
}
