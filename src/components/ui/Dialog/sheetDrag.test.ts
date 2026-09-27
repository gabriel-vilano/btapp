import { describe, expect, it } from "vitest";
import {
  DISMISS_DISTANCE_RATIO,
  DISMISS_VELOCITY,
  MIN_FLICK_OFFSET,
  clampDragOffset,
  shouldDismissSheet,
} from "./sheetDrag";

describe("clampDragOffset", () => {
  it("acompanha o dedo para baixo", () => {
    expect(clampDragOffset(80)).toBe(80);
  });

  it("não deixa o sheet subir", () => {
    expect(clampDragOffset(-40)).toBe(0);
  });
});

describe("shouldDismissSheet", () => {
  const panelHeight = 400;
  const distanceLimit = panelHeight * DISMISS_DISTANCE_RATIO;

  it("fecha quando o arrasto lento passa do limite de distância", () => {
    expect(
      shouldDismissSheet({ offset: distanceLimit, elapsedMs: 2000, panelHeight })
    ).toBe(true);
  });

  it("fecha quando o arrasto curto passa do limite de velocidade", () => {
    const offset = 40;
    const elapsedMs = offset / DISMISS_VELOCITY;
    expect(shouldDismissSheet({ offset, elapsedMs, panelHeight })).toBe(true);
  });

  it("volta à posição quando o arrasto é curto e lento", () => {
    expect(
      shouldDismissSheet({ offset: 40, elapsedMs: 1000, panelHeight })
    ).toBe(false);
  });

  it("volta à posição quando não houve arrasto para baixo", () => {
    expect(shouldDismissSheet({ offset: 0, elapsedMs: 0, panelHeight })).toBe(
      false
    );
  });

  it("não fecha com o tremor de um toque, mesmo instantâneo", () => {
    expect(
      shouldDismissSheet({ offset: MIN_FLICK_OFFSET - 1, elapsedMs: 0, panelHeight })
    ).toBe(false);
  });
});
