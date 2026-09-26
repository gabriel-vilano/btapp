import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Score } from "@/src/types/feed";
import { ScoreBlock, getOutcomeLabel } from "./ScoreBlock";

function renderText(score: Score): string {
  return renderToStaticMarkup(<ScoreBlock score={score} />).replace(/<[^>]+>/g, " ");
}

// Regressão ENG-6: o W.O. exibia "0 0" em destaque, como se fosse placar real.
describe("ScoreBlock sem jogo", () => {
  it("W.O. mostra só o rótulo, sem nenhum número", () => {
    const text = renderText({ type: "wo" });
    expect(text).toContain("Vitória por W.O.");
    expect(text).not.toMatch(/\d/);
  });

  it("desistência antes do primeiro set mostra só o rótulo", () => {
    const text = renderText({ type: "retired", completed_sets: [] });
    expect(text).toContain("Vitória por desistência");
    expect(text).not.toMatch(/\d/);
  });
});

describe("ScoreBlock com sets jogados", () => {
  it("desistência mantém o placar parcial", () => {
    const text = renderText({ type: "retired", completed_sets: [{ a: 6, b: 2 }] });
    expect(text).toMatch(/6\s+2/);
    expect(text).not.toContain("Vitória");
  });

  it("jogo normal não tem rótulo de desfecho", () => {
    expect(getOutcomeLabel({ type: "normal", sets: [{ a: 6, b: 4 }] })).toBeNull();
  });
});
