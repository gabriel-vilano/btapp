import { describe, expect, it } from "vitest";
import { gameSet, interruptedSet, superTiebreak } from "@/src/mocks/domain/builders";
import { scoreErrorMessage } from "./scoreErrorMessage";

describe("scoreErrorMessage", () => {
  it("pede o set 1 quando não veio nenhum set", () => {
    expect(scoreErrorMessage("no_sets", "one_set_of_6", [])).toBe("Informe o placar do set 1.");
  });

  it("diz o placar recebido e os válidos no set de 6", () => {
    expect(scoreErrorMessage("set_score", "one_set_of_6", [gameSet(6, 5)])).toBe(
      "6/5 não fecha o set de 6. Placares válidos: 6/0 a 6/4, 7/5 e 7/6.",
    );
  });

  it("aponta o set que falhou no formato de 2 sets", () => {
    expect(scoreErrorMessage("set_score", "two_sets_of_6_stb", [gameSet(6, 4), gameSet(3, 8)])).toBe(
      "8/3 não fecha o set de 6. Placares válidos: 6/0 a 6/4, 7/5 e 7/6.",
    );
  });

  it("lista os válidos do set de 8 e do super tiebreak", () => {
    expect(scoreErrorMessage("set_score", "one_set_of_8", [gameSet(8, 7)])).toContain("8/0 a 8/6, 9/7 e 9/8");
    const stb = [gameSet(6, 4), gameSet(4, 6), superTiebreak(11, 10)];
    expect(scoreErrorMessage("set_score", "two_sets_of_6_stb", stb)).toBe(
      "11/10 não fecha o super tiebreak. Placares válidos: a 10, com 2 de vantagem (ex.: 10/8, 12/10).",
    );
  });

  it("recusa o placar parcial impossível do set interrompido", () => {
    expect(scoreErrorMessage("set_score", "one_set_of_6", [interruptedSet(7, 4)])).toBe(
      "7/4 não é um placar parcial no set de 6. Confira os games de cada lado.",
    );
  });

  it("pede o super tiebreak com 1 set para cada lado", () => {
    expect(scoreErrorMessage("undecided", "two_sets_of_6_stb", [gameSet(6, 4), gameSet(4, 6)])).toBe(
      "Com 1 set para cada lado, falta o super tiebreak.",
    );
  });

  it("diz em que set a partida já estava decidida", () => {
    const sets = [gameSet(6, 4), gameSet(6, 2), superTiebreak(10, 3)];
    expect(scoreErrorMessage("too_many_sets", "two_sets_of_6_stb", sets)).toBe(
      "A partida já estava decidida no set 2. Remova o set 3.",
    );
  });

  it("cobre os demais códigos com a mensagem da spec", () => {
    expect(scoreErrorMessage("set_type", "two_sets_of_6_stb", [])).toBe(
      "O super tiebreak só existe no 3º set do formato de 2 sets.",
    );
    expect(scoreErrorMessage("interrupted_set", "one_set_of_6", [])).toBe(
      "Na desistência, informe o placar do set em que ela aconteceu.",
    );
    expect(scoreErrorMessage("winner_mismatch", "one_set_of_6", [])).toContain("Confira quem venceu");
  });
});
