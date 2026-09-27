"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((element) => !element.closest("[inert]"));
}

/** Leva o Tab da última borda para a primeira (e vice-versa), prendendo o foco no painel. */
function wrapTabFocus(event: KeyboardEvent, panel: HTMLElement) {
  const focusables = getFocusableElements(panel);
  if (focusables.length === 0) {
    event.preventDefault();
    panel.focus();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Teclado do Modal Dialog do APG: foco preso no painel e `Esc` fecha.
 * O listener fica no `document` para pegar o `Esc` mesmo com o foco fora do painel.
 */
export function useDialogKeyboard(
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const panel = panelRef.current;
      if (!panel) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      } else if (event.key === "Tab") {
        wrapTabFocus(event, panel);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [panelRef]);
}

/**
 * Ao abrir, move o foco para o painel (ou para `initialFocusRef`).
 * Ao fechar, devolve o foco a quem estava focado antes: normalmente o gatilho.
 */
export function useDialogFocus(
  panelRef: RefObject<HTMLElement | null>,
  initialFocusRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const target = initialFocusRef?.current ?? panelRef.current;
    target?.focus();
    return () => trigger?.focus();
  }, [panelRef, initialFocusRef]);
}

/** Trava o scroll da página enquanto o painel está montado e restaura o valor anterior ao fechar. */
export function useScrollLock() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
}

function subscribeNoop() {
  return () => {};
}

/**
 * `true` só no cliente. O portal precisa do `document.body`, que não existe no SSR.
 * `useSyncExternalStore` evita o setState-dentro-de-effect do padrão "mounted".
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}
