import type { RankingCard, RankingMilestone, Side } from "@/src/types/feed";

// Textos do card de ranking. O sujeito é a unidade competidora (R1): em duplas
// o verbo vai para o plural. Nenhum texto flexiona pelo gênero do jogador (R26).

/** Nomes da unidade como sujeito da frase: "Lucas Silva" ou "Lucas Silva e Rafael Costa". */
export function competitorNames(competitor: Side): string {
  if (competitor.format === "singles") return competitor.player.name;
  return `${competitor.players[0].name} e ${competitor.players[1].name}`;
}

function conjugate(competitor: Side, singular: string, plural: string): string {
  return competitor.format === "singles" ? singular : plural;
}

/**
 * Ação do cabeçalho do card.
 * @example rankingActionText(card) // "Lucas Silva e Rafael Costa subiram no ranking"
 */
export function rankingActionText(card: RankingCard): string {
  const { competitor } = card;
  const names = competitorNames(competitor);
  if (card.movement === "down") {
    return `${names} ${conjugate(competitor, "caiu", "caíram")} no ranking`;
  }
  if (card.movement === "final_qualification") {
    // "na final", e não "na [nome]": o nome é livre e o artigo não concorda
    // com todos ("na Saideira", "nas Finals"). O nome vai no selo.
    return `${names} ${conjugate(competitor, "garantiu", "garantiram")} vaga na final`;
  }
  return `${names} ${conjugate(competitor, "subiu", "subiram")} no ranking`;
}

/** Selo do marco (FEED_CARDS.md §8.6). */
export function milestoneLabel(milestone: RankingMilestone, competitor: Side): string {
  if (milestone.type === "top_n") return `Top ${milestone.n}`;
  return `${conjugate(competitor, "Assumiu", "Assumiram")} a liderança`;
}

/** Quem vê o card privado (R22): o jogador em simples, a dupla em duplas. */
export function rankingPrivateAudience(card: RankingCard): "player" | "pair" | undefined {
  if (card.visibility === "public") return undefined;
  return card.competitor.format === "singles" ? "player" : "pair";
}
