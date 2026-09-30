import type { MatchSet, MatchSideKey } from "@/src/types/domain";
import { setWinner } from "@/src/lib/domain/setRules";

// Textos da entrada de placar escritos do ponto de vista de quem lança
// (docs/RESULTS.md RG13): "6/4 para vocês", "4/6 para Lucas e Rafael".

export interface ScorePerspective {
  /** Lado de quem está lançando. */
  userSide: MatchSideKey;
  /** Nome de cada lado, como no cabeçalho da partida. Ex.: "Você e Pedro". */
  sideNames: Record<MatchSideKey, string>;
  /** Simples: "você" no lugar de "vocês". */
  isSingles: boolean;
  /** Quem lança não fala por um lado (admin do torneio): a prévia usa o nome dos dois. */
  neutral?: boolean;
}

export function otherSide(side: MatchSideKey): MatchSideKey {
  return side === "a" ? "b" : "a";
}

/** Como a frase se refere a um lado: "vocês" (ou "você") para quem lança, o nome para o outro. */
export function sideReference(side: MatchSideKey, perspective: ScorePerspective): string {
  if (side !== perspective.userSide || perspective.neutral) return perspective.sideNames[side];
  return perspective.isSingles ? "você" : "vocês";
}

/** Placar com o lado de quem lança primeiro. Ex.: 4/6 quando ele perdeu o set. */
export function scoreFromUserSide(set: MatchSet, userSide: MatchSideKey): string {
  const [mine, theirs] = userSide === "a" ? [set.games_a, set.games_b] : [set.games_b, set.games_a];
  return `${mine}/${theirs}`;
}

/** Prévia de um set. Ex.: "6/4 para vocês"; no interrompido, "3/2 quando o jogo parou". */
export function setPreview(set: MatchSet, perspective: ScorePerspective): string {
  const score = scoreFromUserSide(set, perspective.userSide);
  if (set.interrupted) return `${score} quando o jogo parou`;
  return `${score} para ${sideReference(setWinner(set), perspective)}`;
}

/** Título do set. Ex.: "Set 1 · até 6", "Super tiebreak · a 10". */
export function setTitle(index: number, kind: "games" | "super_tiebreak", target: number): string {
  if (kind === "super_tiebreak") return `Super tiebreak · a ${target}`;
  return `Set ${index + 1} · até ${target}`;
}
