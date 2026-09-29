import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { RetiredScore, Score } from "@/src/types/feed";
import type { ScorePerspective } from "./CompactScore";
import { ScoreBlock } from "./ScoreBlock";

function renderCompact(score: Score, perspective: ScorePerspective): string {
  return renderToStaticMarkup(<ScoreBlock score={score} variant="compact" perspective={perspective} />);
}

function textOf(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

const stb: Score = { type: "normal", sets: [{ a: 6, b: 4 }, { a: 4, b: 6 }, { a: 10, b: 7 }] };

// Exemplo da R11: o desistente venceu o 1º set e desistiu perdendo o 2º por 2/3
const r11: RetiredScore = {
  type: "retired",
  completed_sets: [{ a: 4, b: 6 }],
  interrupted_set: { a: 3, b: 2 },
};

describe("ScoreBlock compacto: lado da leitura", () => {
  it("do vencedor, os sets saem como gravados", () => {
    expect(textOf(renderCompact(stb, "winner"))).toBe("6/4 4/6 10/7");
  });

  it("do perdedor, cada set se inverte: a derrota se lê 4/6 3/6", () => {
    const loss: Score = { type: "normal", sets: [{ a: 6, b: 4 }, { a: 6, b: 3 }] };
    expect(textOf(renderCompact(loss, "loser"))).toBe("4/6 3/6");
  });

  it("o set vencido pelo lado da leitura fica em destaque, o perdido não", () => {
    const winnerHtml = renderCompact(stb, "winner");
    const loserHtml = renderCompact(stb, "loser");
    expect(winnerHtml.match(/compact__set--won/g)).toHaveLength(2);
    expect(loserHtml.match(/compact__set--won/g)).toHaveLength(1);
  });
});

describe("ScoreBlock compacto sem jogo", () => {
  it("W.O. mostra só o texto, sem número", () => {
    const text = textOf(renderCompact({ type: "wo" }, "loser"));
    expect(text).toBe("W.O.");
  });

  it("desistência antes do primeiro game mostra só o marcador", () => {
    const score: Score = { type: "retired", completed_sets: [], interrupted_set: { a: 0, b: 0 } };
    expect(textOf(renderCompact(score, "winner"))).toBe("desist.");
  });
});

describe("ScoreBlock compacto na desistência", () => {
  it("mostra o placar real com o marcador depois do set interrompido", () => {
    expect(textOf(renderCompact(r11, "winner"))).toBe("4/6 3/2 desist.");
    expect(textOf(renderCompact(r11, "loser"))).toBe("6/4 2/3 desist.");
  });

  it("set interrompido não tem vencedor: não fica em destaque", () => {
    // Do vencedor: 4/6 perdido, 3/2 interrompido. Nenhum set em destaque.
    expect(renderCompact(r11, "winner")).not.toContain("compact__set--won");
  });

  it("desistência entre sets não escreve o set que não começou", () => {
    const score: Score = { type: "retired", completed_sets: [{ a: 6, b: 4 }], interrupted_set: { a: 0, b: 0 } };
    expect(textOf(renderCompact(score, "winner"))).toBe("6/4 desist.");
  });
});

describe("ScoreBlock sem variante", () => {
  it("continua a grade do card: perspective não muda nada", () => {
    const html = renderToStaticMarkup(<ScoreBlock score={stb} />);
    expect(html).toBe(renderToStaticMarkup(<ScoreBlock score={stb} perspective="loser" />));
    expect(html).toContain("STB");
  });
});
