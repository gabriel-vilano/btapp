import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Category } from "@/src/types/feed";
import {
  formatCategoryLabel,
  formatCount,
  formatCountValue,
  formatEnrollmentCount,
  formatEventMoment,
  formatInitials,
  formatTimestamp,
} from "./formatters";

const doublesB: Category = {
  gender: "M",
  modality: "doubles",
  level_min: "B",
  level_max: "B",
  age_group: null,
};

describe("formatCategoryLabel", () => {
  it("usa gênero + nível, sem modalidade em duplas", () => {
    expect(formatCategoryLabel(doublesB)).toBe("Masculino B");
    expect(formatCategoryLabel({ ...doublesB, gender: "F", level_min: "A", level_max: "A" })).toBe(
      "Feminino A",
    );
  });

  it("acrescenta a faixa etária depois do nível", () => {
    const mixed: Category = { ...doublesB, gender: "mixed", level_min: "C", level_max: "C", age_group: "40+" };
    expect(formatCategoryLabel(mixed)).toBe("Mista C 40+");
  });

  it("aceita categoria só com faixa etária", () => {
    const ageOnly: Category = { ...doublesB, gender: "F", level_min: null, level_max: null, age_group: "40+" };
    expect(formatCategoryLabel(ageOnly)).toBe("Feminino 40+");
  });

  it("mostra a faixa de nível quando mínimo e máximo diferem", () => {
    expect(formatCategoryLabel({ ...doublesB, gender: "F", level_min: "A", level_max: "B" })).toBe(
      "Feminino A/B",
    );
  });

  it("marca a modalidade só quando é simples", () => {
    expect(formatCategoryLabel({ ...doublesB, modality: "singles" })).toBe("Masculino B · Simples");
  });
});

describe("formatEnrollmentCount", () => {
  const singlesB: Category = { ...doublesB, modality: "singles" };

  it("conta duplas em categoria de duplas, em qualquer gênero", () => {
    expect(formatEnrollmentCount(16, doublesB)).toBe("16 duplas inscritas");
    expect(formatEnrollmentCount(1, doublesB)).toBe("1 dupla inscrita");
    expect(formatEnrollmentCount(16, { ...doublesB, gender: "F" })).toBe("16 duplas inscritas");
    expect(formatEnrollmentCount(16, { ...doublesB, gender: "mixed" })).toBe("16 duplas inscritas");
  });

  it("conta jogadores em categoria masculina de simples", () => {
    expect(formatEnrollmentCount(24, singlesB)).toBe("24 jogadores inscritos");
    expect(formatEnrollmentCount(1, singlesB)).toBe("1 jogador inscrito");
  });

  it("conta jogadoras em categoria feminina de simples", () => {
    const singlesF: Category = { ...singlesB, gender: "F" };
    expect(formatEnrollmentCount(12, singlesF)).toBe("12 jogadoras inscritas");
    expect(formatEnrollmentCount(1, singlesF)).toBe("1 jogadora inscrita");
  });

  // O banco bloqueia mista em simples (§11.5); o tipo ainda permite, então cai no masculino genérico
  it("usa jogadores em simples mista", () => {
    expect(formatEnrollmentCount(8, { ...singlesB, gender: "mixed" })).toBe("8 jogadores inscritos");
  });
});

describe("formatInitials", () => {
  it("usa a primeira letra do primeiro e do último nome", () => {
    expect(formatInitials("Lucas Silva")).toBe("LS");
    expect(formatInitials("Maria Eduarda Albuquerque de Vasconcelos")).toBe("MV");
  });

  it("usa uma letra só quando o nome tem uma palavra", () => {
    expect(formatInitials("Lucas")).toBe("L");
  });

  it("mantém acento, põe em maiúscula e ignora espaço e pontuação nas bordas", () => {
    expect(formatInitials("  ágata   (Guto) ")).toBe("ÁG");
  });

  it("devolve vazio quando não há letra nem número", () => {
    expect(formatInitials("")).toBe("");
    expect(formatInitials("  -- ")).toBe("");
  });
});

describe("formatEventMoment", () => {
  it("escreve dia da semana, data e hora cheia sem minutos", () => {
    expect(formatEventMoment("2026-09-22T23:00:00Z")).toBe("ter, 22/09, 20h");
  });

  it("mostra os minutos quando não é hora cheia", () => {
    expect(formatEventMoment("2026-09-25T00:10:00Z")).toBe("qui, 24/09, 21h10");
  });

  it("usa o fuso de São Paulo, não o do servidor", () => {
    expect(formatEventMoment("2026-09-27T02:30:00Z")).toBe("sáb, 26/09, 23h30");
  });

  it("escreve a hora sem zero à esquerda, como se fala", () => {
    expect(formatEventMoment("2026-09-25T12:05:00Z")).toBe("sex, 25/09, 9h05");
    expect(formatEventMoment("2026-09-28T03:00:00Z")).toBe("seg, 28/09, 0h");
  });

  it("recusa data inválida dizendo o valor recebido", () => {
    expect(() => formatEventMoment("ontem")).toThrow("recebi 'ontem'");
  });
});

describe("formatCount", () => {
  it("concorda o rótulo com o número", () => {
    expect(formatCount(1, "jogo", "jogos")).toBe("1 jogo");
    expect(formatCount(0, "jogo", "jogos")).toBe("0 jogos");
    expect(formatCount(2, "vitória", "vitórias")).toBe("2 vitórias");
  });

  it("separa o milhar com ponto, já a partir de 4 dígitos", () => {
    expect(formatCount(1204, "jogo", "jogos")).toBe("1.204 jogos");
    expect(formatCountValue(1204)).toBe("1.204");
    expect(formatCountValue(12045)).toBe("12.045");
  });
});

describe("formatTimestamp", () => {
  const NOW = new Date("2026-09-25T12:00:00Z").getTime();
  const ago = (ms: number) => new Date(NOW - ms).toISOString();
  const minutes = (n: number) => ago(n * 60_000);
  const hours = (n: number) => ago(n * 3_600_000);
  const days = (n: number) => ago(n * 86_400_000);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Funções, não valores: o relógio só é congelado no beforeEach.
  it.each([
    ["agora", () => minutes(0), "há 0min"],
    ["59 minutos", () => minutes(59), "há 59min"],
    ["1 hora", () => hours(1), "há 1h"],
    ["23 horas", () => hours(23), "há 23h"],
    ["1 dia", () => days(1), "há 1 dia"],
    ["6 dias (último em dias)", () => days(6), "há 6 dias"],
    ["7 dias (primeiro em semanas)", () => days(7), "há 1 semana"],
    ["21 dias", () => days(21), "há 3 semanas"],
    ["29 dias (último em semanas)", () => days(29), "há 4 semanas"],
    ["30 dias (primeiro em meses)", () => days(30), "há 1 mês"],
    ["150 dias", () => days(150), "há 5 meses"],
    ["329 dias", () => days(329), "há 10 meses"],
    ["330 dias (primeiro em 11 meses)", () => days(330), "há 11 meses"],
    ["360 dias (teto de 11 meses)", () => days(360), "há 11 meses"],
    ["364 dias (último em meses)", () => days(364), "há 11 meses"],
    ["365 dias (primeiro em anos)", () => days(365), "há 1 ano"],
    ["800 dias", () => days(800), "há 2 anos"],
  ])("%s", (_label, compute, expected) => {
    expect(formatTimestamp(compute())).toBe(expected);
  });

  it("rejeita data inválida citando o valor recebido", () => {
    expect(() => formatTimestamp("ontem")).toThrow("recebi 'ontem'");
  });
});
