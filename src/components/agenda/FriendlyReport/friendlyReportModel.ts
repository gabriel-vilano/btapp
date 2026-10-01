import type { MatchSidePlayers } from "@/src/lib/domain/match-state";
import { brasiliaToday } from "@/src/lib/brasiliaDateTime";
import type { PickablePlayer, SideModality, SideSlots } from "@/src/components/ui/SidePicker";
import type { MatchFormat } from "@/src/types/domain";
import type { SideVoice } from "../ReportResult/reportSummary";

// Regras da tela de registrar o amistoso (docs/RESULTS.md §6.1) que não
// dependem de React: lados, data, formato padrão e como a tela chama cada lado.
// Quem lança é sempre o lado "a": o lado dele vem primeiro, como no lançamento.

/** Sem amistoso anterior, o padrão é o formato mais curto e mais comum (§6.1). */
const FIRST_FRIENDLY_FORMAT: MatchFormat = "one_set_of_6";

/**
 * Formato inicial: o do último amistoso de quem lança, ou "1 set de 6" no primeiro (§6.1, R29).
 * @example defaultFriendlyFormat(null) // "one_set_of_6"
 */
export function defaultFriendlyFormat(lastFormat: MatchFormat | null): MatchFormat {
  return lastFormat ?? FIRST_FRIENDLY_FORMAT;
}

/**
 * Lados da partida a partir das vagas, ou `null` enquanto falta alguém.
 * @example friendlySidesOf("lucas", { partner: "pedro", opponent1: "thiago", opponent2: "andre" }, "doubles") // { a: ["lucas", "pedro"], b: ["thiago", "andre"] }
 */
export function friendlySidesOf(viewerId: string, slots: SideSlots, modality: SideModality): MatchSidePlayers | null {
  if (modality === "singles") return slots.opponent1 === null ? null : { a: [viewerId], b: [slots.opponent1] };
  const { partner, opponent1, opponent2 } = slots;
  if (partner === null || opponent1 === null || opponent2 === null) return null;
  return { a: [viewerId, partner], b: [opponent1, opponent2] };
}

function firstName(player: PickablePlayer | undefined): string {
  return player?.name.split(" ")[0] ?? "Alguém";
}

/**
 * Como as frases chamam os lados: o de quem lança é "Você e Pedro"; o outro, pelos primeiros nomes.
 * @example friendlyVoiceOf({ a: ["lucas", "pedro"], b: ["thiago", "andre"] }, players) // { names: { a: "Você e Pedro", b: "Thiago e André" }, userSide: "a", isSingles: false }
 */
export function friendlyVoiceOf(sides: MatchSidePlayers, players: readonly PickablePlayer[]): SideVoice {
  const byId = new Map(players.map((player) => [player.id, player]));
  const names = (ids: readonly string[]) => ids.map((id) => firstName(byId.get(id))).join(" e ");
  const partners = sides.a.slice(1);
  return {
    names: { a: ["Você", ...partners.map((id) => firstName(byId.get(id)))].join(" e "), b: names(sides.b) },
    userSide: "a",
    isSingles: sides.a.length === 1,
  };
}

/**
 * Quem confirma, ligado por "ou" (R43). Ex.: "Thiago ou André".
 * @example friendlyRespondersText({ a: ["lucas"], b: ["thiago"] }, players) // "Thiago"
 */
export function friendlyRespondersText(sides: MatchSidePlayers, players: readonly PickablePlayer[]): string {
  const byId = new Map(players.map((player) => [player.id, player]));
  return sides.b.map((id) => firstName(byId.get(id))).join(" ou ");
}

/**
 * O que fica depois do envio, para a revisão e o fim do fluxo (§6.1, item 6).
 * @example pendingFriendlyText("Thiago ou André") // "Fica pendente até Thiago ou André confirmarem. Não vale ponto de ranking."
 */
export function pendingFriendlyText(responders: string, isSingles: boolean): string {
  const verb = isSingles ? "confirmar" : "confirmarem";
  return `Fica pendente até ${responders} ${verb}. Não vale ponto de ranking.`;
}

/**
 * Erro do campo de data, ou `null` quando vale: obrigatória e nunca no futuro (§6.1).
 * As datas são do `<input type="date">` (AAAA-MM-DD), em Brasília.
 * @example playedOnError("2026-10-02", "2026-10-01T12:00:00Z") // "A data do jogo não pode ser depois de hoje."
 */
export function playedOnError(playedOn: string, now: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedOn)) return "Informe a data do jogo.";
  return playedOn > brasiliaToday(new Date(now)) ? "A data do jogo não pode ser depois de hoje." : null;
}

/**
 * Dia do jogo em ISO 8601. O amistoso guarda um momento (`played_at`), mas a
 * tela pede só o dia: meio-dia em Brasília cai no mesmo dia em qualquer fuso do Brasil.
 * @example playedAtOf("2026-09-30") // "2026-09-30T15:00:00.000Z"
 */
export function playedAtOf(playedOn: string): string {
  const time = Date.parse(`${playedOn}T12:00:00-03:00`);
  if (Number.isNaN(time)) {
    throw new RangeError(`Data do amistoso inválida: recebi '${playedOn}', esperado AAAA-MM-DD`);
  }
  return new Date(time).toISOString();
}

/** Arena em texto livre e opcional: vazia vira `null` (o modelo guarda `venue`). */
export function venueOf(text: string): string | null {
  const venue = text.trim();
  return venue === "" ? null : venue;
}

