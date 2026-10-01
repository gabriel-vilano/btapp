import { describe, expect, it } from "vitest";
import { gameSet } from "@/src/mocks/domain/builders";
import { resultRoleOf } from "./resultRole";

const SIDES = { a: ["pedro", "thiago"], b: ["caio", "diego"] };
const REPORT = { result: { type: "normal" as const, winner: "a" as const, sets: [gameSet(6, 4)] }, reported_by: "pedro", reported_at: "2026-10-01T12:00:00.000Z" };

describe("papel de quem vê diante do lançamento (R13)", () => {
  it("separa quem lançou, o parceiro, o lado adversário e quem é de fora", () => {
    expect(resultRoleOf(REPORT, SIDES, "pedro")).toBe("reporter");
    expect(resultRoleOf(REPORT, SIDES, "thiago")).toBe("reporter_partner");
    expect(resultRoleOf(REPORT, SIDES, "diego")).toBe("responder");
    expect(resultRoleOf(REPORT, SIDES, "ana")).toBe("outsider");
  });
});
