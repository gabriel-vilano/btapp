import { describe, expect, it } from "vitest";
import { MIN_KEYBOARD_HEIGHT, computeKeyboardInset } from "./keyboardInset";

const base = { layoutHeight: 800, visualHeight: 800, visualOffsetTop: 0, visualScale: 1 };

describe("computeKeyboardInset", () => {
  it("é 0 com o teclado fechado", () => {
    expect(computeKeyboardInset(base)).toBe(0);
  });

  it("mede o teclado que encolhe o visual viewport (Android, iOS)", () => {
    expect(computeKeyboardInset({ ...base, visualHeight: 500 })).toBe(300);
  });

  it("desconta o offsetTop que o iOS aplica ao rolar a página com o teclado aberto", () => {
    expect(computeKeyboardInset({ ...base, visualHeight: 500, visualOffsetTop: 40 })).toBe(260);
  });

  it("ignora diferença pequena de barra do navegador", () => {
    const small = base.layoutHeight - (MIN_KEYBOARD_HEIGHT - 1);
    expect(computeKeyboardInset({ ...base, visualHeight: small })).toBe(0);
  });

  it("ignora o zoom de pinça", () => {
    expect(computeKeyboardInset({ ...base, visualHeight: 400, visualScale: 2 })).toBe(0);
  });
});
