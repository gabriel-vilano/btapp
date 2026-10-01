// Regras do SidePicker que não dependem de tela: que vagas existem em cada
// modalidade, quem já foi escolhido e a busca, com os amigos primeiro.

/** Jogador que pode ocupar uma vaga. Ex.: `{ id, name: "Pedro Henrique", username: "pedrohenrique", … }`. */
export interface PickablePlayer {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  /** Amigos aparecem primeiro e com o selo "Amigo" (docs/RESULTS.md RG17). */
  isFriend: boolean;
}

/** Vagas a escolher: o parceiro de quem lança (duplas) e um ou dois adversários. */
export type SideSlot = "partner" | "opponent1" | "opponent2";

/** Quem ocupa cada vaga, por id. `null` é vaga vazia. */
export type SideSlots = Record<SideSlot, string | null>;

export type SideModality = "singles" | "doubles";

export const EMPTY_SIDE_SLOTS: SideSlots = { partner: null, opponent1: null, opponent2: null };

/** Mais que isso a lista não mostra: quem não achou refina o termo. */
export const MAX_PICKER_RESULTS = 20;

/**
 * Vagas de cada modalidade, na ordem da tela.
 * @example slotsOf("singles") // ["opponent1"]
 */
export function slotsOf(modality: SideModality): SideSlot[] {
  return modality === "singles" ? ["opponent1"] : ["partner", "opponent1", "opponent2"];
}

/**
 * Vagas da modalidade, sem as que ela não tem: trocar de duplas para simples
 * solta o parceiro e o segundo adversário.
 * @example slotsForModality({ partner: "p1", opponent1: "p2", opponent2: "p3" }, "singles") // { partner: null, opponent1: "p2", opponent2: null }
 */
export function slotsForModality(slots: SideSlots, modality: SideModality): SideSlots {
  const kept = slotsOf(modality);
  return {
    partner: kept.includes("partner") ? slots.partner : null,
    opponent1: slots.opponent1,
    opponent2: kept.includes("opponent2") ? slots.opponent2 : null,
  };
}

/** Todas as vagas da modalidade preenchidas. */
export function areSlotsComplete(slots: SideSlots, modality: SideModality): boolean {
  return slotsOf(modality).every((slot) => slots[slot] !== null);
}

// "André" e "andre" se encontram: a busca ignora acento e caixa
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function matchesTerm(player: PickablePlayer, term: string): boolean {
  return normalize(player.name).includes(term) || normalize(player.username).includes(term);
}

/**
 * Busca por nome ou @username, sem quem já está numa vaga. Amigos primeiro,
 * cada grupo em ordem alfabética (RG17). Sem termo, só os amigos: são a
 * sugestão de quem ainda não digitou.
 * @example searchPickablePlayers(players, "ped", ["player-lucas"]) // [Pedro Henrique]
 */
export function searchPickablePlayers(
  players: readonly PickablePlayer[],
  rawTerm: string,
  excludedIds: readonly string[],
): PickablePlayer[] {
  // "@pedro" busca o username "pedro"
  const term = normalize(rawTerm).replace(/^@/, "");
  const available = players.filter((player) => !excludedIds.includes(player.id));
  const found = term === "" ? available.filter((player) => player.isFriend) : available.filter((p) => matchesTerm(p, term));
  return [...found].sort(friendsFirst).slice(0, MAX_PICKER_RESULTS);
}

function friendsFirst(first: PickablePlayer, second: PickablePlayer): number {
  if (first.isFriend !== second.isFriend) return first.isFriend ? -1 : 1;
  return first.name.localeCompare(second.name, "pt-BR");
}
