"use client";

import { useEffect, type RefObject } from "react";
import { computeKeyboardInset } from "./keyboardInset";

/**
 * Expõe a altura do teclado em `--dialog-keyboard-inset` no painel, para o CSS
 * subir o sheet e descontar do max-height. O `dvh` não acompanha o teclado no
 * iOS nem no Chrome do Android (`resizes-visual`), mas o `visualViewport` sim
 * nos dois. Mesmo padrão do `--dialog-drag-offset`: o hook escreve o número,
 * o CSS decide a apresentação.
 */
export function useKeyboardInset(panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const viewport = window.visualViewport;
    const panel = panelRef.current;
    if (!viewport || !panel) return;

    function update() {
      if (!viewport || !panel) return;
      const inset = computeKeyboardInset({
        layoutHeight: window.innerHeight,
        visualHeight: viewport.height,
        visualOffsetTop: viewport.offsetTop,
        visualScale: viewport.scale,
      });
      panel.style.setProperty("--dialog-keyboard-inset", `${inset}px`);
      if (inset > 0) panel.dataset.keyboard = "true";
      else delete panel.dataset.keyboard;
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [panelRef]);
}
