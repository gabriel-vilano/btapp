import { describe, expect, it } from "vitest";
import {
  competitorNameParts,
  formatCompetitorName,
  formatMatchRecord,
  formatRankingRowLabel,
  type RankingRowPlayer,
  type RankingRowSummary,
  splitPlayerName,
} from "./rankingRowText";

const pedro: RankingRowPlayer = { id: "p", name: "Pedro Alves", avatarUrl: null };
const viewer: RankingRowPlayer = { id: "v", name: "Gabriel Vilano", avatarUrl: null, isViewer: true };
const lucas: RankingRowPlayer = { id: "l", name: "Lucas Silva", avatarUrl: null };

const ownRow: RankingRowSummary = {
  position: 9,
  players: [pedro, viewer],
  points: 390,
  matches: 5,
  wins: 3,
  delta: 2,
  closed: false,
  awaitingAdmin: false,
};

describe("formatCompetitorName", () => {
  it("põe o jogador logado na frente, como Você", () => {
    expect(formatCompetitorName([pedro, viewer])).toBe("Você e Pedro Alves");
  });

  it("mantém a ordem da dupla sem o jogador logado", () => {
    expect(formatCompetitorName([lucas, pedro])).toBe("Lucas Silva e Pedro Alves");
  });

  it("em simples, mostra só o nome", () => {
    expect(formatCompetitorName([lucas])).toBe("Lucas Silva");
    expect(formatCompetitorName([viewer])).toBe("Você");
  });
});

describe("formatMatchRecord", () => {
  it("usa o plural", () => {
    expect(formatMatchRecord(6, 5)).toBe("6 jogos · 5 vitórias");
  });

  it("usa o singular com 1", () => {
    expect(formatMatchRecord(1, 1)).toBe("1 jogo · 1 vitória");
  });

  it("zero é plural", () => {
    expect(formatMatchRecord(0, 0)).toBe("0 jogos · 0 vitórias");
  });
});

describe("formatRankingRowLabel", () => {
  it("lê a linha na ordem da spec", () => {
    expect(formatRankingRowLabel(ownRow)).toBe(
      "9º, Você e Pedro Alves, 390 pontos, subiu 2 posições, 5 jogos, 3 vitórias",
    );
  });

  it("lê a queda no singular", () => {
    expect(formatRankingRowLabel({ ...ownRow, delta: -1 })).toContain("caiu 1 posição,");
  });

  it("sem delta ou com delta zero, não fala de movimento", () => {
    const label = "9º, Você e Pedro Alves, 390 pontos, 5 jogos, 3 vitórias";
    expect(formatRankingRowLabel({ ...ownRow, delta: undefined })).toBe(label);
    expect(formatRankingRowLabel({ ...ownRow, delta: 0 })).toBe(label);
  });

  it("diz a situação especial logo depois do nome", () => {
    const label = formatRankingRowLabel({ ...ownRow, closed: true, awaitingAdmin: true });
    expect(label).toMatch(/^9º, Você e Pedro Alves, inscrição encerrada, empate, 390 pontos/);
  });

  it("termina com a distância da vaga", () => {
    const label = formatRankingRowLabel({ ...ownRow, cutoffDistance: "Faltam 12 pts para o 8º" });
    expect(label).toMatch(/3 vitórias, Faltam 12 pts para o 8º$/);
  });

  it("usa ponto no singular", () => {
    expect(formatRankingRowLabel({ ...ownRow, points: 1 })).toContain(", 1 ponto,");
  });
});

describe("splitPlayerName", () => {
  it("separa o primeiro nome do resto", () => {
    expect(splitPlayerName("Maria Eduarda de Vasconcelos")).toEqual({ first: "Maria", surname: "Eduarda de Vasconcelos" });
  });

  it("normaliza espaços repetidos e nas pontas", () => {
    expect(splitPlayerName("  Pedro   Alves ")).toEqual({ first: "Pedro", surname: "Alves" });
  });

  it("deixa o sobrenome vazio em nome de uma palavra", () => {
    expect(splitPlayerName("Pelé")).toEqual({ first: "Pelé", surname: "" });
  });
});

describe("competitorNameParts", () => {
  it("põe Você na frente, sem sobrenome", () => {
    expect(competitorNameParts([pedro, viewer])).toEqual([
      { id: "v", first: "Você", surname: "", isViewer: true },
      { id: "p", first: "Pedro", surname: "Alves", isViewer: false },
    ]);
  });

  it("parte os dois nomes da dupla, na ordem recebida", () => {
    expect(competitorNameParts([lucas, pedro]).map(({ first, surname }) => [first, surname])).toEqual([
      ["Lucas", "Silva"],
      ["Pedro", "Alves"],
    ]);
  });
});
