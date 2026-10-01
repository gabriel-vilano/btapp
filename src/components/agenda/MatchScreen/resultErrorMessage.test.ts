import { describe, expect, it } from "vitest";
import { resultErrorMessage } from "./resultErrorMessage";

describe("mensagem da recusa ao responder ou desfazer", () => {
  it("o prazo vencido diz o caminho que sobra", () => {
    expect(resultErrorMessage("too_late", "respond")).toBe("O prazo de resposta acabou e o resultado vale como foi lançado.");
    expect(resultErrorMessage("too_late", "undo")).toMatch(/fale com o admin/);
  });

  it("quem não pode agir sabe quem pode", () => {
    expect(resultErrorMessage("not_allowed", "undo")).toBe("Só quem lançou pode desfazer o lançamento.");
    expect(resultErrorMessage("not_allowed", "respond")).toBe("Só o lado adversário de quem lançou responde.");
  });
});
