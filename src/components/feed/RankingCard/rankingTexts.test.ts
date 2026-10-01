import { describe, expect, it } from "vitest";
import type { PlayerInfo, RankingCard, Side } from "@/src/types/feed";
import {
  competitorNames,
  milestoneLabel,
  rankingActionText,
  rankingPrivateAudience,
} from "./rankingTexts";

const player = (id: string, name: string): PlayerInfo => ({
  id,
  name,
  username: id,
  avatar_url: null,
  total_matches: 0,
});

const lucas = player("lucas", "Lucas Silva");
const rafael = player("rafael", "Rafael Costa");
const singles: Side = { format: "singles", player: lucas };
const doubles: Side = { format: "doubles", players: [lucas, rafael] };

function upCard(competitor: Side): RankingCard {
  return {
    id: "card",
    card_type: "ranking",
    created_at: "2026-09-01T12:00:00Z",
    competitor,
    visibility: "public",
    ranking_name: "Ranking Bacuri — Masculino B",
    position: 3,
    points: 520,
    movement: "up",
    delta: 2,
  };
}

describe("competitorNames", () => {
  it("junta os dois nomes da dupla", () => {
    expect(competitorNames(doubles)).toBe("Lucas Silva e Rafael Costa");
  });
});

describe("rankingActionText", () => {
  it("usa o verbo no singular para o jogador de simples", () => {
    expect(rankingActionText(upCard(singles))).toBe("Lucas Silva subiu no ranking");
  });

  it("usa o verbo no plural para a dupla (R1)", () => {
    expect(rankingActionText(upCard(doubles))).toBe("Lucas Silva e Rafael Costa subiram no ranking");
  });

  it("descreve a queda", () => {
    const card: RankingCard = { ...upCard(doubles), movement: "down", visibility: "private", delta: 1 };
    expect(rankingActionText(card)).toBe("Lucas Silva e Rafael Costa caíram no ranking");
  });

  it("não usa o nome livre da final no cabeçalho, para não errar o artigo", () => {
    const card: RankingCard = {
      ...upCard(singles),
      movement: "final_qualification",
      visibility: "public",
      final_name: "Finals",
    };
    expect(rankingActionText(card)).toBe("Lucas Silva garantiu vaga na final");
  });
});

describe("milestoneLabel", () => {
  it("mostra o N do Top N da temporada (R47)", () => {
    expect(milestoneLabel({ type: "top_n", n: 8 }, doubles)).toBe("Top 8");
  });

  it("concorda a liderança com a unidade", () => {
    expect(milestoneLabel({ type: "leader" }, singles)).toBe("Assumiu a liderança");
    expect(milestoneLabel({ type: "leader" }, doubles)).toBe("Assumiram a liderança");
  });
});

describe("rankingPrivateAudience", () => {
  it("não marca o card público", () => {
    expect(rankingPrivateAudience(upCard(doubles))).toBeUndefined();
  });

  it("marca a queda para o jogador ou para a dupla (R22)", () => {
    const down = (competitor: Side): RankingCard => ({
      ...upCard(competitor),
      movement: "down",
      visibility: "private",
      delta: 1,
    });
    expect(rankingPrivateAudience(down(singles))).toBe("player");
    expect(rankingPrivateAudience(down(doubles))).toBe("pair");
  });
});
