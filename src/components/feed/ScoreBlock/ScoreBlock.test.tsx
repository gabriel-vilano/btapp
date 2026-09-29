import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { RetiredScore, Score } from "@/src/types/feed";
import { ScoreBlock, getInterruptedSetName, getOutcomeLabel } from "./ScoreBlock";

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
    const text = renderText({
      type: "retired",
      completed_sets: [],
      interrupted_set: { a: 0, b: 0 },
    });
    expect(text).toContain("Vitória por desistência");
    expect(text).not.toMatch(/\d/);
  });
});

describe("ScoreBlock com sets jogados", () => {
  it("jogo normal não tem rótulo de desfecho", () => {
    expect(getOutcomeLabel({ type: "normal", sets: [{ a: 6, b: 4 }] })).toBeNull();
  });
});

// ENG-33: o card público mostra o placar real da desistência, sem completar
// pelo formato e sem traços nos sets não jogados.
describe("ScoreBlock na desistência", () => {
  const r11: RetiredScore = {
    type: "retired",
    completed_sets: [{ a: 4, b: 6 }],
    interrupted_set: { a: 3, b: 2 },
  };

  it("mostra os games jogados, com o set interrompido rotulado", () => {
    const text = renderText(r11);
    expect(text).toMatch(/Set 1\s+Interrompido\s+4\s+3\s+6\s+2/);
    expect(text).not.toContain("Vitória");
    expect(text).not.toMatch(/[-–—]/);
  });

  it("set interrompido não tem vencedor: os dois números em secundário", () => {
    const html = renderToStaticMarkup(<ScoreBlock score={r11} />);
    expect(html.match(/score__number--winner/g)).toHaveLength(1);
  });

  it("desistência no meio do 1º set ainda mostra o placar e o rótulo", () => {
    const text = renderText({ type: "retired", completed_sets: [], interrupted_set: { a: 3, b: 2 } });
    expect(text).toMatch(/Interrompido\s+3\s+2/);
  });

  it("desistência entre sets não desenha o set que não começou", () => {
    const text = renderText({ type: "retired", completed_sets: [{ a: 6, b: 4 }], interrupted_set: { a: 0, b: 0 } });
    expect(text).not.toContain("Interrompido");
    expect(text).toMatch(/^\s*6\s+4\s*$/);
  });

  it("nomeia o set da desistência", () => {
    expect(getInterruptedSetName(r11)).toBe("2º set");
    expect(
      getInterruptedSetName({
        type: "retired",
        completed_sets: [{ a: 6, b: 4 }, { a: 4, b: 6 }],
        interrupted_set: { a: 5, b: 3 },
      }),
    ).toBe("super tiebreak");
  });

});
