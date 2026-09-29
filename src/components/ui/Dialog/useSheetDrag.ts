"use client";

import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { clampDragOffset, shouldDismissSheet } from "./sheetDrag";

/** Igual a --motion-duration-medium-1: a saída termina antes de desmontar o painel. */
const SLIDE_OUT_MS = 250;

type DragStart = { startY: number; startTime: number; offset: number };

// O deslocamento vai numa custom property que o CSS lê no transform: o
// componente não escreve estilo de apresentação, só o número do gesto.
function setDragOffset(panel: HTMLElement, offset: number) {
  panel.style.setProperty("--dialog-drag-offset", `${offset}px`);
}

/** Mantém os eventos na alça mesmo quando o dedo sai dela durante o arrasto. */
function capturePointer(event: ReactPointerEvent<HTMLElement>) {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Ponteiro sintético (fireEvent nas stories) não é "ativo" e o navegador
    // lança NotFoundError; sem captura, o gesto funciona do mesmo jeito.
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Arrastar a alça do BottomSheet para baixo: o painel acompanha o dedo e, ao
 * soltar, fecha (passou do limite de distância ou de velocidade) ou volta.
 */
export function useSheetDrag(
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void
) {
  const dragRef = useRef<DragStart | null>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  function slideOutAndClose(panel: HTMLElement) {
    if (prefersReducedMotion()) return onClose();
    setDragOffset(panel, panel.offsetHeight);
    closeTimerRef.current = window.setTimeout(onClose, SLIDE_OUT_MS);
  }

  function endDrag(): { drag: DragStart; panel: HTMLElement } | null {
    const drag = dragRef.current;
    const panel = panelRef.current;
    dragRef.current = null;
    if (!drag || !panel) return null;
    delete panel.dataset.dragging;
    return { drag, panel };
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    const panel = panelRef.current;
    if (!panel || !event.isPrimary) return;
    capturePointer(event);
    dragRef.current = { startY: event.clientY, startTime: event.timeStamp, offset: 0 };
    panel.dataset.dragging = "true";
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;
    drag.offset = clampDragOffset(event.clientY - drag.startY);
    setDragOffset(panel, drag.offset);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLElement>) {
    const ended = endDrag();
    if (!ended) return;
    const { drag, panel } = ended;
    const dismiss = shouldDismissSheet({
      offset: drag.offset,
      elapsedMs: event.timeStamp - drag.startTime,
      panelHeight: panel.offsetHeight,
    });
    if (dismiss) return slideOutAndClose(panel);
    setDragOffset(panel, 0);
  }

  function onPointerCancel() {
    const ended = endDrag();
    if (ended) setDragOffset(ended.panel, 0);
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
