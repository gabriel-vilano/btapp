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
});
