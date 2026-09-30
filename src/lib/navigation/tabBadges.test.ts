import { describe, expect, it } from "vitest";
import { badgeAccessibleName } from "@/src/components/ui/CountBadge";
import { adminPendingBadge, yourTurnBadge } from "./tabBadges";

describe("badges das abas (N3)", () => {
  it("a aba Jogos lê as pendências no singular e no plural", () => {
    expect(badgeAccessibleName("Jogos", yourTurnBadge(1))).toBe("Jogos, 1 pendência");
    expect(badgeAccessibleName("Jogos", yourTurnBadge(3))).toBe("Jogos, 3 pendências");
  });

  it("a aba Competições diz que as pendências são de admin", () => {
    expect(badgeAccessibleName("Competições", adminPendingBadge(1))).toBe(
      "Competições, 1 pendência de admin",
    );
    expect(badgeAccessibleName("Competições", adminPendingBadge(2))).toBe(
      "Competições, 2 pendências de admin",
    );
  });

  it("sem pendência, o nome é só o rótulo", () => {
    expect(badgeAccessibleName("Jogos", yourTurnBadge(0))).toBe("Jogos");
  });
});
