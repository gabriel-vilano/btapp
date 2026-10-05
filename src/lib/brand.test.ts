import { describe, expect, it } from "vitest";
import { brand } from "./brand";

describe("brand", () => {
  it.each(Object.entries(brand))(
    "%s não é vazio nem tem espaço nas pontas",
    (field, value) => {
      expect(value, `brand.${field} = '${value}'`).not.toBe("");
      expect(value, `brand.${field} = '${value}'`).toBe(value.trim());
    },
  );

  it("nameNoBreak é o name com espaço que não quebra no lugar do espaço comum", () => {
    expect(brand.nameNoBreak).not.toContain(" ");
    expect(brand.nameNoBreak.replaceAll(" ", " ")).toBe(brand.name);
  });
});
