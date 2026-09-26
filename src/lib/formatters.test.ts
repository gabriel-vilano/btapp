import { describe, expect, it } from "vitest";
import type { Category } from "@/src/types/feed";
import { formatCategoryLabel, formatEnrollmentCount } from "./formatters";

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
