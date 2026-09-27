"use client";

import { useId, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import {
  useDialogFocus,
  useDialogKeyboard,
  useIsClient,
  useScrollLock,
} from "./useDialogBehavior";
import { useSheetDrag } from "./useSheetDrag";
import styles from "./Dialog.module.css";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Ações do rodapé (ex.: Cancelar + Confirmar). Fica fixo abaixo do conteúdo rolável. */
  footer?: ReactNode;
  /** Elemento que recebe o foco ao abrir. Sem ele, o foco vai para o próprio painel. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Modal do DS: BottomSheet no celular, Dialog centralizado a partir de 800px.
 *
 * @example
 * <Dialog open={open} onClose={() => setOpen(false)} title="Propor horários">
 *   …
 * </Dialog>
 */
export function Dialog({ open, onClose, ...panelProps }: DialogProps) {
  const isClient = useIsClient();
  if (!open || !isClient) return null;
  return createPortal(
    <div className={styles.dialog}>
      <div className={styles.dialog__scrim} onClick={onClose} aria-hidden />
      <DialogPanel onClose={onClose} {...panelProps} />
    </div>,
    document.body
  );
}

type DialogPanelProps = Omit<DialogProps, "open">;

function DialogPanel({
  onClose,
  title,
  description,
  children,
  footer,
  initialFocusRef,
}: DialogPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogKeyboard(panelRef, onClose);
  useDialogFocus(panelRef, initialFocusRef);
  useScrollLock();

  return (
    <div
      ref={panelRef}
      className={styles.dialog__panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      tabIndex={-1}
    >
      <SheetGrabber panelRef={panelRef} onClose={onClose} />
      <DialogHeader
        title={title}
        titleId={titleId}
        description={description}
        descriptionId={descriptionId}
        onClose={onClose}
      />
      {/* tabIndex 0: com conteúdo só de texto, é o único jeito de rolar o
          corpo pelo teclado (axe: scrollable-region-focusable) */}
      <div className={styles.dialog__body} tabIndex={0}>
        {children}
      </div>
      {footer && <div className={styles.dialog__footer}>{footer}</div>}
    </div>
  );
}

type SheetGrabberProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
};

/**
 * Alça de arrastar do BottomSheet (some no Dialog de desktop). Só ponteiro:
 * X, Esc e scrim são as alternativas sem arrastar (WCAG 2.5.7), por isso ela
 * fica fora da árvore de acessibilidade.
 */
function SheetGrabber({ panelRef, onClose }: SheetGrabberProps) {
  const dragHandlers = useSheetDrag(panelRef, onClose);
  return (
    <div
      className={styles.dialog__grabber}
      data-dialog-part="grabber"
      aria-hidden
      {...dragHandlers}
    />
  );
}

type DialogHeaderProps = {
  title: string;
  titleId: string;
  description?: string;
  descriptionId: string;
  onClose: () => void;
};

function DialogHeader({
  title,
  titleId,
  description,
  descriptionId,
  onClose,
}: DialogHeaderProps) {
  return (
    <div className={styles.dialog__header}>
      <div className={styles.dialog__heading}>
        <h2 id={titleId} className={styles.dialog__title}>
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className={styles.dialog__description}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        className={styles.dialog__close}
        onClick={onClose}
        aria-label="Fechar"
      >
        <Icon icon={XIcon} size="md" />
      </button>
    </div>
  );
}
