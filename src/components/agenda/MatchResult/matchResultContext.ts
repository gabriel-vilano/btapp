import type { MatchSidePlayers } from "@/src/lib/domain/match-state";
import { sideOfPlayer } from "@/src/lib/domain/match-state/guards";
import type { StandingsScope } from "@/src/lib/domain/standingsStats";
import type { ContestDetails, MatchSideKey, ScoringRule } from "@/src/types/domain";
import type { SideVoice } from "../ReportResult/reportSummary";

/** O que a seção do resultado precisa saber da partida, além dela mesma. A tela do confronto já tem tudo isso. */
export interface MatchResultContext {
  sides: MatchSidePlayers;
  /** Nome de cada lado, sem "Você". Ex.: `{ a: "Lucas e Rafael", b: "Caio e Diego" }`. */
  sideNames: Record<MatchSideKey, string>;
  /** Primeiro nome dos 4 jogadores, por player_id. */
  playerNames: Record<string, string>;
  /** Primeiro nome dos admins da competição, por player_id (RG11). */
  adminNames: Record<string, string>;
  viewerId: string;
  competitionName: string;
  responseDeadlineHours: number;
  scoringRule: ScoringRule;
  /** Ex.: "Masculino B". */
  categoryName: string;
  /** A categoria na temporada: a posição ao vivo depois da confirmação (RG18). */
  standings: StandingsScope;
  rankingHref: string;
}

/** Folha aberta na seção: contestar (RG15) ou o menu de desfazer (RG16). */
export type ResultDialog = "contest" | "undo" | null;

/** Estado e ações da seção, de quem guarda a partida (o `useMatchResult` da tela do confronto). */
export interface MatchResultActions {
  dialog: ResultDialog;
  /** Recusa do domínio, já em texto para o jogador. */
  error: string | null;
  openDialog: (dialog: ResultDialog) => void;
  confirm: () => void;
  contest: (details: ContestDetails) => void;
  undo: () => void;
}

/**
 * Como as frases se referem aos lados: o de quem vê vira "Você e Pedro" e "vocês" (RG3).
 * @example voiceOf(context) // { names: { a: "Você e Rafael", b: "Caio e Diego" }, userSide: "a", isSingles: false }
 */
export function voiceOf(context: MatchResultContext): SideVoice {
  const userSide = sideOfPlayer(context.sides, context.viewerId);
  const isSingles = context.sides.a.length === 1;
  if (userSide === null) return { names: context.sideNames, userSide, isSingles };
  const partners = context.sides[userSide].filter((id) => id !== context.viewerId).map((id) => context.playerNames[id]);
  return { names: { ...context.sideNames, [userSide]: ["Você", ...partners].join(" e ") }, userSide, isSingles };
}

/** Jogadores e admins num só mapa, para o histórico. */
export function peopleNamesOf(context: MatchResultContext): Record<string, string> {
  return { ...context.adminNames, ...context.playerNames };
}
