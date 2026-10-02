import { describe, expect, it, vi } from "vitest";

// next/font só funciona compilado pelo Next; no teste basta a variável da fonte.
vi.mock("next/font/google", () => ({ Arimo: () => ({ variable: "font-arimo" }) }));

const { viewport } = await import("./layout");

// Regressão: bloquear o zoom falha a WCAG 1.4.4 no Chrome do Android, que respeita
// a tag. O auto-zoom do iOS se resolve com 16px nos campos, não aqui.
describe("viewport do app", () => {
  it("não limita o zoom do navegador", () => {
    expect(viewport).not.toHaveProperty("maximumScale");
    expect(viewport).not.toHaveProperty("minimumScale");
    expect(viewport.userScalable).not.toBe(false);
  });

  it("mantém o viewportFit cover para as safe areas do iPhone", () => {
    expect(viewport.viewportFit).toBe("cover");
  });
});
