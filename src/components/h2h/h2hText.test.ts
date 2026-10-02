import { describe, expect, it } from "vitest";
import {
  formatFormGuideLabel,
  formatGamesCount,
  formatH2HDate,
  formatH2HSpokenDate,
  formatLeader,
  formatNeverMet,
  formatSummaryLine,
  formatSummarySentence,
  type H2HSummaryText,
} from "./h2hText";

const base: H2HSummaryText = {
  leftWins: 3,
  rightWins: 1,
  lastPlayedAt: "2026-09-12T13:00:00Z",
  leftLabel: "Você",
  rightLabel: "Pedro",
  sideKind: "player",
};

describe("datas do H2H", () => {
  it("formata a data curta e a falada no fuso de São Paulo", () => {
    expect(formatH2HDate(base.lastPlayedAt)).toBe("12/09/2026");
    expect(formatH2HSpokenDate(base.lastPlayedAt)).toBe("12 de setembro de 2026");
  });

  it("usa o dia de São Paulo, não o de UTC", () => {
    // 01h UTC do dia 13 ainda é 22h do dia 12 em São Paulo
    expect(formatH2HDate("2026-09-13T01:00:00Z")).toBe("12/09/2026");
  });

  it("recusa data inválida dizendo o valor recebido", () => {
    expect(() => formatH2HDate("ontem")).toThrow("recebi 'ontem'");
  });
});

describe("formatGamesCount", () => {
  it("concorda com o número", () => {
    expect(formatGamesCount(1)).toBe("1 jogo");
    expect(formatGamesCount(4)).toBe("4 jogos");
  });
});

describe("formatLeader", () => {
  it("diz quem lidera, de qualquer lado", () => {
    expect(formatLeader(base)).toBe("Você venceu 3");
    expect(formatLeader({ ...base, leftWins: 1, rightWins: 3 })).toBe("Pedro venceu 3");
  });

  it("concorda no plural quando os lados são duplas", () => {
    expect(formatLeader({ ...base, leftLabel: "Vocês", sideKind: "pair" })).toBe("Vocês venceram 3");
  });

  it("diz o empate com os dois números", () => {
    expect(formatLeader({ ...base, leftWins: 2, rightWins: 2 })).toBe("Empate em 2 a 2");
  });
});

describe("formatSummaryLine", () => {
  it("junta quem lidera e a data do último confronto", () => {
    expect(formatSummaryLine(base)).toBe("Você venceu 3 · Último: 12/09/2026");
  });
});

describe("formatSummarySentence", () => {
  it("lê o resumo como uma frase", () => {
    expect(formatSummarySentence(base)).toBe(
      "Você venceu 3, Pedro venceu 1, em 4 jogos. Último confronto em 12 de setembro de 2026.",
    );
  });

  it("diz 'não venceu nenhum' em vez de 'venceu 0'", () => {
    expect(formatSummarySentence({ ...base, leftWins: 1, rightWins: 0 })).toBe(
      "Você venceu 1, Pedro não venceu nenhum, em 1 jogo. Último confronto em 12 de setembro de 2026.",
    );
  });
});

describe("formatFormGuideLabel", () => {
  it("lê a sequência por extenso, da mais antiga para a mais recente", () => {
    expect(formatFormGuideLabel(["win", "win", "loss"], "Lucas")).toBe(
      "Últimas 3 de Lucas: vitória, vitória, derrota, da mais antiga para a mais recente",
    );
  });

  it("usa o singular com uma partida e avisa quando não há nenhuma", () => {
    expect(formatFormGuideLabel(["loss"], "Lucas")).toBe("Última partida de Lucas: derrota");
    expect(formatFormGuideLabel([], "Lucas")).toBe("Lucas: sem partidas");
  });
});

describe("formatNeverMet", () => {
  const names = { leftName: "Lucas", rightName: "Pedro" };

  it("fala com quem vê quando ele está num dos lados", () => {
    expect(formatNeverMet({ ...names, viewerIsLeft: true, sideKind: "player" })).toBe("Vocês ainda não se enfrentaram.");
    expect(formatNeverMet({ ...names, viewerIsLeft: true, sideKind: "pair" })).toBe("Vocês ainda não se enfrentaram.");
  });

  it("de fora, usa os nomes em simples e fala das duplas em duplas", () => {
    expect(formatNeverMet({ ...names, viewerIsLeft: false, sideKind: "player" })).toBe(
      "Lucas e Pedro ainda não se enfrentaram.",
    );
    expect(formatNeverMet({ leftName: "Lucas e Rafael", rightName: "Pedro e Thiago", viewerIsLeft: false, sideKind: "pair" })).toBe(
      "As duplas ainda não se enfrentaram.",
    );
  });
});
