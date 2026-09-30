import { describe, expect, it } from "vitest";
import type { SeasonHeader } from "@/src/lib/domain/ranking-screen";
import type { CompetitionCategory } from "@/src/types/domain";
import { categoryLabel, cutoffDistanceText, dividerText, profileHref, seasonContextLines } from "./rankingScreenText";

const doubles: CompetitionCategory = {
  id: "cat",
  competition_id: "comp",
  gender: "M",
  modality: "doubles",
  level_min: "B",
  level_max: "B",
  min_age: null,
};

const NOW = "2026-10-01T15:00:00Z";

const header: SeasonHeader = {
  season_name: "2º semestre de 2026",
  phase: "open",
  ends_on: "2026-12-15T15:00:00Z",
  current_round: { number: 3, total: 4, deadline: "2026-10-06T15:00:00Z" },
  final: { name: "Saideira", qualifiers: 8, cutoff_date: "2026-11-30T15:00:00Z" },
  all_qualify: false,
  previous_season_id: null,
};

describe("categoryLabel", () => {
  it("usa o nome derivado da categoria, com a idade", () => {
    expect(categoryLabel(doubles)).toBe("Masculino B");
    expect(categoryLabel({ ...doubles, gender: "mixed", level_min: "C", level_max: "C", min_age: 40 })).toBe("Mista C 40+");
  });
});

describe("seasonContextLines (RK4, RK15)", () => {
  it("aberta: rodada, prazo em dias e data de corte", () => {
    expect(seasonContextLines(header, doubles, NOW)).toEqual([
      "2º semestre de 2026 · Rodada 3 de 4",
      "Rodada fecha em 5 dias · Corte em 30/11",
    ]);
  });

  it("prazo com menos de um dia conta como 1 dia, no singular", () => {
    const soon = { ...header, current_round: { number: 3, total: 4, deadline: "2026-10-01T20:00:00Z" } };
    expect(seasonContextLines(soon, doubles, NOW)[1]).toBe("Rodada fecha em 1 dia · Corte em 30/11");
  });

  it("depois da data de corte: classificação da final definida", () => {
    expect(seasonContextLines({ ...header, phase: "after_cutoff" }, doubles, NOW)[1]).toBe(
      "Classificação final da Saideira definida",
    );
  });

  it("encerrada: data do fim", () => {
    const ended = { ...header, phase: "ended" as const, current_round: null };
    expect(seasonContextLines(ended, doubles, NOW)).toEqual(["2º semestre de 2026", "Temporada encerrada em 15/12"]);
  });

  it("sem final e entre rodadas: só o nome da temporada", () => {
    expect(seasonContextLines({ ...header, final: null, current_round: null }, doubles, NOW)).toEqual([
      "2º semestre de 2026",
    ]);
  });

  it("menos duplas que vagas: todas se classificam (4.5)", () => {
    expect(seasonContextLines({ ...header, all_qualify: true }, doubles, NOW)[2]).toBe(
      "Todas as duplas se classificam para a Saideira",
    );
  });
});

describe("cutoffDistanceText (RK11)", () => {
  it("plural, singular e empate em pontos", () => {
    expect(cutoffDistanceText({ points: 12, position: 8 })).toBe("Faltam 12 pts para o 8º");
    expect(cutoffDistanceText({ points: 1, position: 8 })).toBe("Falta 1 pt para o 8º");
    expect(cutoffDistanceText({ points: 0, position: 8 })).toBe("Empatado em pontos com o 8º");
  });
});

describe("dividerText (RK13, 4.5)", () => {
  const divider = { final_name: "Saideira", qualifiers: 8, after_cutoff: false, awaiting_admin: false };

  it("antes e depois da data de corte", () => {
    expect(dividerText(divider)).toEqual({ label: "Classificam para a Saideira · 8 vagas" });
    expect(dividerText({ ...divider, after_cutoff: true })).toEqual({ label: "Classificados para a Saideira" });
  });

  it("empate atravessando a linha ganha a segunda linha", () => {
    expect(dividerText({ ...divider, qualifiers: 1, awaiting_admin: true })).toEqual({
      label: "Classificam para a Saideira · 1 vaga",
      detail: "Empate na última vaga: decisão do admin",
    });
  });
});

describe("profileHref (RK14)", () => {
  it("o próprio jogador vai para /perfil; os outros, para /jogadores/[username]", () => {
    const player = { id: "p1", name: "Lucas Silva", username: "lucassilva", avatar_url: null };
    expect(profileHref(player, "p1")).toBe("/perfil");
    expect(profileHref(player, "p2")).toBe("/jogadores/lucassilva");
  });
});
