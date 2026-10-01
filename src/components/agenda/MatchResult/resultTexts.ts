import { formatEventMoment } from "@/src/lib/formatters";
import { formatTimeLeft } from "@/src/lib/timeLeft";
import type {
  CompetitionResult,
  ContestReason,
  MatchConfirmation,
  MatchSet,
  MatchSideKey,
} from "@/src/types/domain";

// Textos da seção do resultado na tela do confronto (docs/RESULTS.md §4),
// escritos para quem está vendo: "Você lançou", "Diego contestou".

const DAY_MS = 24 * 3_600_000;

/** Nome de quem agiu, ou "Você" quando é quem está vendo. `names` inclui os admins (RG11). */
export function actorName(playerId: string, viewerId: string, names: Record<string, string>): string {
  if (playerId === viewerId) return "Você";
  return names[playerId] ?? "Alguém";
}

/** Primeiros nomes de um lado ligados por "ou": quem pode responder. Ex.: "Caio ou Diego". */
export function sideOr(playerIds: readonly string[], names: Record<string, string>): string {
  return playerIds.map((id) => names[id] ?? "Alguém").join(" ou ");
}

/** Prazo de resposta em contagem e em data absoluta, lado a lado (RG9). */
export interface ResponseDeadlineParts {
  /** "em 18h". */
  countdown: string;
  /** "qui, 01/10, 21h10". */
  absolute: string;
  /** Últimas 24h: só a contagem ganha a cor de atenção (RG9). */
  urgent: boolean;
  /** O prazo passou: a resposta não vale mais, o resultado confirma sozinho (R14). */
  expired: boolean;
}

/** @example responseDeadlineParts("2026-10-02T00:10:00Z", "2026-10-01T06:00:00Z").countdown // "em 18h" */
export function responseDeadlineParts(deadline: string, now: string): ResponseDeadlineParts {
  const left = Date.parse(deadline) - Date.parse(now);
  return {
    countdown: formatTimeLeft(deadline, now),
    absolute: formatEventMoment(deadline),
    urgent: left <= DAY_MS,
    expired: left < 0,
  };
}

/** Motivo da contestação, como aparece na lista e no histórico (RG15). */
export const CONTEST_REASON_LABEL: Record<ContestReason, string> = {
  different_score: "Placar diferente",
  different_winner: "Outro vencedor",
  not_played: "O jogo não aconteceu",
  other: "Outro motivo",
};

/** Motivos na ordem da lista da RG15. */
export const CONTEST_REASONS: readonly ContestReason[] = ["different_score", "different_winner", "not_played", "other"];

/**
 * Como a partida foi confirmada (§4.3): pelo adversário, pelo prazo ou pelo admin, e quem (R39).
 * @example confirmationText({ via: "deadline", confirmed_at }, viewerId, names) // "Confirmado pelo prazo, sem resposta"
 */
export function confirmationText(confirmation: MatchConfirmation, viewerId: string, names: Record<string, string>): string {
  switch (confirmation.via) {
    case "opponent":
      return `Confirmado por ${lowerYou(actorName(confirmation.responded_by, viewerId, names))}`;
    case "deadline":
      return "Confirmado pelo prazo, sem resposta";
    case "admin":
      return `Definido por ${actorName(confirmation.admin_id, viewerId, names)} (admin)`;
  }
}

/** Quando a confirmação aconteceu, para a linha "Confirmado por … · qui, 01/10, 21h". */
export function confirmedAt(confirmation: MatchConfirmation): string {
  switch (confirmation.via) {
    case "opponent":
      return confirmation.responded_at;
    case "deadline":
      return confirmation.confirmed_at;
    case "admin":
      return confirmation.acted_at;
  }
}

function lowerYou(name: string): string {
  return name === "Você" ? "você" : name;
}

function setText(set: MatchSet, winner: MatchSideKey): string {
  const score = winner === "a" ? `${set.games_a}/${set.games_b}` : `${set.games_b}/${set.games_a}`;
  return set.super_tiebreak ? `${score} (STB)` : score;
}

/**
 * O resultado numa linha, lido do vencedor, para o histórico.
 * @example resultLine({ type: "normal", winner: "b", sets: [gameSet(4, 6)] }, names) // "6/4 para Caio e Diego"
 */
export function resultLine(result: CompetitionResult, sideNames: Record<MatchSideKey, string>): string {
  switch (result.type) {
    case "normal":
      return `${result.sets.map((set) => setText(set, result.winner)).join(" ")} para ${sideNames[result.winner]}`;
    case "retired":
      return `Desistência, vitória de ${sideNames[result.winner]} (${result.sets.map((set) => setText(set, result.winner)).join(" ")})`;
    case "wo":
      return `W.O., vitória de ${sideNames[result.winner]}`;
    case "double_wo":
      return "W.O. duplo, sem pontos para ninguém";
  }
}
