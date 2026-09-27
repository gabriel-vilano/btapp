// Mesmos limites do Vaul (emilkowalski/vaul), a lib de drawer mais usada no
// ecossistema React: 25% da altura ou 0,4 px/ms.

/** Fração da altura do painel que, arrastada para baixo, fecha o sheet. */
export const DISMISS_DISTANCE_RATIO = 0.25;

/** Velocidade (px/ms) acima da qual um arrasto curto e rápido também fecha. */
export const DISMISS_VELOCITY = 0.4;

/** Distância mínima (px) para o critério de velocidade valer: um toque com tremor não fecha. */
export const MIN_FLICK_OFFSET = 16;

type SheetRelease = {
  offset: number;
  elapsedMs: number;
  panelHeight: number;
};

/** O sheet só desce: arrastar para cima fica preso em 0. */
export function clampDragOffset(deltaY: number): number {
  return Math.max(0, deltaY);
}

/**
 * Decide, ao soltar, se o sheet fecha ou volta à posição.
 *
 * @example
 * shouldDismissSheet({ offset: 120, elapsedMs: 600, panelHeight: 400 }); // true (30% da altura)
 */
export function shouldDismissSheet({
  offset,
  elapsedMs,
  panelHeight,
}: SheetRelease): boolean {
  if (offset <= 0) return false;
  if (offset >= panelHeight * DISMISS_DISTANCE_RATIO) return true;
  if (offset < MIN_FLICK_OFFSET) return false;
  const velocity = offset / Math.max(elapsedMs, 1);
  return velocity >= DISMISS_VELOCITY;
}
