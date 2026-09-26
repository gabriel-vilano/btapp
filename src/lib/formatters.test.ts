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
  it("conta duplas em categoria de duplas", () => {
    expect(formatEnrollmentCount(16, "doubles")).toBe("16 duplas inscritas");
    expect(formatEnrollmentCount(1, "doubles")).toBe("1 dupla inscrita");
  });

  it("conta jogadores em categoria de simples", () => {
    expect(formatEnrollmentCount(24, "singles")).toBe("24 jogadores inscritos");
    expect(formatEnrollmentCount(1, "singles")).toBe("1 jogador inscrito");
  });
});
