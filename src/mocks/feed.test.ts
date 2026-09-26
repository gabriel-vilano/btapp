import { describe, expect, it } from "vitest";
import type { FeedCard } from "@/src/types/feed";
import { mockFeedCards } from "./feed";

// Modalidade declarada na categoria vs formato de quem joga. O mock é a
// vitrine do feed: incoerência aqui vira card errado no Storybook.
function modalityMismatch(card: FeedCard): string | null {
  if (card.card_type === "result") {
    const { modality } = card.header.category;
    return modality === card.winner.format ? null : `${modality} × ${card.winner.format}`;
  }
  if (card.card_type === "match") {
    const { modality } = card.header.category;
    return modality === card.side_a.format ? null : `${modality} × ${card.side_a.format}`;
  }
  if (card.card_type === "enrollment") {
    const { modality } = card.competition.category;
    return modality === card.enrollment_format ? null : `${modality} × ${card.enrollment_format}`;
  }
  return null;
}

describe("mockFeedCards", () => {
  it.each(mockFeedCards.map((card) => [card.id, card] as const))(
    "%s tem modalidade coerente com os jogadores",
    (_id, card) => {
      expect(modalityMismatch(card)).toBeNull();
    },
  );

  it("não tem nome de competição truncado ou placeholder", () => {
    const names = mockFeedCards.flatMap((card) => {
      if (card.card_type === "result" || card.card_type === "match") {
        return [card.header.competition_name];
      }
      if (card.card_type === "enrollment") return [card.competition.name];
      return [];
    });
    expect(names).not.toContain("Rankin");
    for (const name of names) expect(name.split(" ").length).toBeGreaterThan(1);
  });

  it("resultado foi jogado antes de publicado e confronto está no futuro", () => {
    const now = Date.now();
    for (const card of mockFeedCards) {
      const createdAt = Date.parse(card.created_at);
      expect(createdAt, card.id).toBeLessThanOrEqual(now);
      if (card.card_type === "result") {
        expect(Date.parse(card.date), card.id).toBeLessThanOrEqual(createdAt);
      }
      if (card.card_type === "match") {
        expect(Date.parse(card.date), card.id).toBeGreaterThan(now);
      }
    }
  });

  it("feed vem do mais recente para o mais antigo", () => {
    const times = mockFeedCards.map((card) => Date.parse(card.created_at));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
});
