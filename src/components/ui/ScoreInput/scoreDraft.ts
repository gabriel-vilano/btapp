import type { MatchFormat, MatchSet, MatchSideKey, ReportableResult } from "@/src/types/domain";
import { setKindsOf, validateScore, type ScoreErrorCode, type ScoredResult } from "@/src/lib/domain/matchScore";
import { isFinishedSet, setWinner, type SetKind } from "@/src/lib/domain/setRules";

// Rascunho da entrada de placar (docs/RESULTS.md §3.3 e §3.4). O ScoreInput só
// desenha; quem diz que sets aparecem, que placar sai e se ele vale é este módulo.

export type ScoreInputType = "normal" | "retired" | "wo";

/** Set de games completo, em dois toques: quem venceu e os games de quem perdeu (RG12). */
export interface GamesSetEntry {
  winner: MatchSideKey | null;
  loserGames: number | null;
}

export interface ScoreDraft {
  gamesSets: GamesSetEntry[];
  /** Super tiebreak completo: texto cru dos dois campos numéricos. */
  superTiebreak: Record<MatchSideKey, string>;
  /** Desistência: índice do set interrompido. Nos formatos de 1 set, é sempre o 0. */
  interruptedIndex: number | null;
  /** Placar parcial do set interrompido, um Stepper por lado. */
  interrupted: Record<MatchSideKey, number>;
}

export const EMPTY_SCORE_DRAFT: ScoreDraft = {
  gamesSets: [],
  superTiebreak: { a: "", b: "" },
  interruptedIndex: null,
  interrupted: { a: 0, b: 0 },
};

const EMPTY_ENTRY: GamesSetEntry = { winner: null, loserGames: null };

export type ScoreSlot =
  | { kind: "games"; index: number; target: 6 | 8; entry: GamesSetEntry; blockedWinner: MatchSideKey | null }
  | { kind: "super_tiebreak"; index: number }
  | { kind: "interrupted"; index: number; setKind: SetKind };

export type ScoreDraftResult =
  | { status: "incomplete" }
  | { status: "invalid"; code: ScoreErrorCode; message: string }
  | { status: "valid"; result: ReportableResult };

// ----- sets isolados -----

/** Games de quem venceu o set: 7 quando o perdedor fez 5 ou 6 no set de 6 (R29). */
export function winnerGamesFor(loserGames: number, target: number): number {
  return loserGames >= target - 1 ? target + 1 : target;
}

/** Set montado a partir dos dois toques. Ex.: vencedor A, perdedor com 5 no set de 6 → 7/5. */
export function gamesSetFrom(entry: GamesSetEntry, target: number): MatchSet | null {
  if (entry.winner === null || entry.loserGames === null) return null;
  const high = winnerGamesFor(entry.loserGames, target);
  const games = entry.winner === "a" ? [high, entry.loserGames] : [entry.loserGames, high];
  return { games_a: games[0], games_b: games[1], super_tiebreak: false, interrupted: false };
}

function parsePoints(text: string): number | null {
  return /^\d{1,2}$/.test(text.trim()) ? Number(text.trim()) : null;
}

/** STB completo lido dos campos numéricos; `null` enquanto algum estiver vazio. */
export function superTiebreakSetFrom(points: Record<MatchSideKey, string>): MatchSet | null {
  const a = parsePoints(points.a);
  const b = parsePoints(points.b);
  if (a === null || b === null) return null;
  return { games_a: a, games_b: b, super_tiebreak: true, interrupted: false };
}

/** O STB está preenchido, mas o placar não fecha (a 10, com 2 de vantagem). */
export function isInvalidSuperTiebreak(points: Record<MatchSideKey, string>): boolean {
  const set = superTiebreakSetFrom(points);
  return set !== null && !isFinishedSet(set, { type: "super_tiebreak" });
}

function interruptedSetFrom(draft: ScoreDraft, kind: SetKind): MatchSet {
  const { a, b } = draft.interrupted;
  return { games_a: a, games_b: b, super_tiebreak: kind.type === "super_tiebreak", interrupted: true };
}

/**
 * Limites do Stepper de um lado no set interrompido, dado o placar do outro:
 * só se chega a placar parcial válido. No set de 6, o lado vai a 6 só com o
 * outro em 5 ou 6 (6/4 já fecharia o set). Vale para o STB com alvo 10.
 */
export function interruptedBounds(otherSide: number, target: number): { min: number; max: number } {
  return {
    min: otherSide === target ? target - 1 : 0,
    max: otherSide >= target - 1 ? target : target - 1,
  };
}

/** Alvo de um tipo de set: 6 ou 8 games, ou 10 pontos no STB. */
export function targetOf(kind: SetKind): number {
  return kind.type === "games" ? kind.target : 10;
}

// ----- partida -----

function setsToWin(format: MatchFormat): number {
  return Math.ceil(setKindsOf(format).length / 2);
}

function setsWonBy(sets: MatchSet[], side: MatchSideKey): number {
  return sets.filter((set) => setWinner(set) === side).length;
}

function isDecided(sets: MatchSet[], format: MatchFormat): boolean {
  return setsWonBy(sets, "a") >= setsToWin(format) || setsWonBy(sets, "b") >= setsToWin(format);
}

/** Nos formatos de 1 set, a desistência só pode ser no set 1. */
export function interruptedIndexOf(draft: ScoreDraft, format: MatchFormat): number | null {
  return setKindsOf(format).length === 1 ? 0 : draft.interruptedIndex;
}

function gamesTarget(kind: SetKind): 6 | 8 {
  if (kind.type !== "games") throw new Error(`Set de games esperado, recebi ${kind.type}`);
  return kind.target;
}

/** Sets do jogo normal, na ordem em que aparecem: o próximo só quando o anterior fecha. */
function normalSlots(draft: ScoreDraft, format: MatchFormat): ScoreSlot[] {
  const slots: ScoreSlot[] = [];
  const sets: MatchSet[] = [];
  for (const [index, kind] of setKindsOf(format).entries()) {
    if (kind.type === "super_tiebreak") return [...slots, { kind: "super_tiebreak", index }];
    const entry = draft.gamesSets[index] ?? EMPTY_ENTRY;
    slots.push({ kind: "games", index, target: kind.target, entry, blockedWinner: null });
    const set = gamesSetFrom(entry, kind.target);
    if (set === null) return slots;
    sets.push(set);
    if (isDecided(sets, format)) return slots;
  }
  return slots;
}

// Lado que, vencendo este set, fecharia a partida antes do set interrompido
function blockedWinnerAfter(sets: MatchSet[], format: MatchFormat): MatchSideKey | null {
  if (setsWonBy(sets, "a") + 1 >= setsToWin(format)) return "a";
  if (setsWonBy(sets, "b") + 1 >= setsToWin(format)) return "b";
  return null;
}

function withoutBlockedWinner(entry: GamesSetEntry, blocked: MatchSideKey | null): GamesSetEntry {
  return entry.winner !== null && entry.winner === blocked ? EMPTY_ENTRY : entry;
}

/** Sets da desistência: os completos antes do interrompido, depois o interrompido. */
function retiredSlots(draft: ScoreDraft, format: MatchFormat): ScoreSlot[] {
  const interruptedIndex = interruptedIndexOf(draft, format);
  if (interruptedIndex === null) return [];
  const kinds = setKindsOf(format);
  const slots: ScoreSlot[] = [];
  const sets: MatchSet[] = [];
  for (let index = 0; index < interruptedIndex; index++) {
    const blockedWinner = blockedWinnerAfter(sets, format);
    const entry = withoutBlockedWinner(draft.gamesSets[index] ?? EMPTY_ENTRY, blockedWinner);
    const target = gamesTarget(kinds[index]);
    slots.push({ kind: "games", index, target, entry, blockedWinner });
    const set = gamesSetFrom(entry, target);
    if (set === null) return slots;
    sets.push(set);
  }
  return [...slots, { kind: "interrupted", index: interruptedIndex, setKind: kinds[interruptedIndex] }];
}

/** O que a entrada mostra agora, set a set. W.O. não tem placar (R10). */
export function scoreSlots(draft: ScoreDraft, format: MatchFormat, type: ScoreInputType): ScoreSlot[] {
  if (type === "wo") return [];
  return type === "normal" ? normalSlots(draft, format) : retiredSlots(draft, format);
}

function slotSet(slot: ScoreSlot, draft: ScoreDraft): MatchSet | null {
  if (slot.kind === "games") return gamesSetFrom(slot.entry, slot.target);
  if (slot.kind === "super_tiebreak") return superTiebreakSetFrom(draft.superTiebreak);
  return interruptedSetFrom(draft, slot.setKind);
}

/** Placar real montado do rascunho; `null` enquanto faltar algum set. */
export function draftToSets(draft: ScoreDraft, format: MatchFormat, type: ScoreInputType): MatchSet[] | null {
  const slots = scoreSlots(draft, format, type);
  const sets = slots.map((slot) => slotSet(slot, draft));
  if (slots.length === 0 || sets.some((set) => set === null)) return null;
  const complete = sets as MatchSet[];
  if (type === "normal" && !isDecided(complete, format)) return null;
  return complete;
}

function buildResult(sets: MatchSet[], type: "normal" | "retired", userSide: MatchSideKey): ScoredResult {
  if (type === "retired") return { type: "retired", winner: userSide, sets };
  const winner = setsWonBy(sets, "a") > setsWonBy(sets, "b") ? "a" : "b";
  return { type: "normal", winner, sets };
}

/**
 * Resultado pronto para a revisão, validado pelo `validateScore`. O vencedor
 * do normal sai do placar (RG5); desistência e W.O. são a favor de quem lança (RG4).
 * Ex.: `draftToResult(draft, { format: "one_set_of_6", type: "normal", userSide: "a" })`.
 */
export function draftToResult(
  draft: ScoreDraft,
  options: { format: MatchFormat; type: ScoreInputType; userSide: MatchSideKey },
): ScoreDraftResult {
  const { format, type, userSide } = options;
  if (type === "wo") return { status: "valid", result: { type: "wo", winner: userSide } };
  const sets = draftToSets(draft, format, type);
  if (sets === null) return { status: "incomplete" };
  const result = buildResult(sets, type, userSide);
  const validation = validateScore(result, format);
  if (!validation.valid) return { status: "invalid", code: validation.code, message: validation.message };
  return { status: "valid", result };
}
