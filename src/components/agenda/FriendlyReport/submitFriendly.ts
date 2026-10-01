import {
  MatchTransitionError,
  reportFriendly,
  type MatchSidePlayers,
  type MatchTransitionErrorCode,
} from "@/src/lib/domain/match-state";
import { validateScore, type ScoreErrorCode } from "@/src/lib/domain/matchScore";
import type { FriendlyMatch, FriendlyResult, MatchFormat } from "@/src/types/domain";

// Envio do amistoso. Como no lançamento do ranking, a resposta do servidor é um
// destes três desfechos, e a falha de rede é a promessa rejeitada (RG8).
// Enquanto os dados são mocks, o "servidor" é `reportFriendlyLocally`, com as
// mesmas funções puras que o banco vai usar.

export interface FriendlyReportRequest {
  /** O lado de quem lança é sempre o "a". */
  sides: MatchSidePlayers;
  format: MatchFormat;
  played_at: string; // ISO 8601
  venue: string | null;
  result: FriendlyResult;
  at: string; // ISO 8601
}

export type FriendlyReportOutcome =
  | { status: "reported"; match: FriendlyMatch }
  | { status: "score_rejected"; code: ScoreErrorCode }
  | { status: "transition_rejected"; code: MatchTransitionErrorCode };

export type SubmitFriendly = (request: FriendlyReportRequest) => Promise<FriendlyReportOutcome>;

/** Quem lança e os ids que o banco gera. Sem o Supabase, saem da sessão do navegador. */
export interface LocalFriendlyContext {
  viewerId: string;
  createId: () => string;
}

/**
 * O servidor valida o placar de novo (§3.7) e cria o amistoso já em Aguardando
 * confirmação (R42, R43). A unidade de cada lado é o par de jogadores (R2):
 * com o banco, ela é encontrada ou criada; aqui, o id sai dos jogadores.
 * @example reportFriendlyLocally(request, { viewerId: "player-lucas", createId: () => "match-1" })
 */
export function reportFriendlyLocally(request: FriendlyReportRequest, context: LocalFriendlyContext): FriendlyReportOutcome {
  const check = validateScore(request.result, request.format);
  if (!check.valid) return { status: "score_rejected", code: check.code };
  const draft = {
    id: context.createId(),
    side_a_unit_id: localUnitId(request.sides.a),
    side_b_unit_id: localUnitId(request.sides.b),
    format: request.format,
    played_at: request.played_at,
    venue: request.venue,
  };
  try {
    const actor = { playerId: context.viewerId, at: request.at };
    return { status: "reported", match: reportFriendly(draft, request.result, actor, request.sides) };
  } catch (caught) {
    if (!(caught instanceof MatchTransitionError)) throw caught;
    return { status: "transition_rejected", code: caught.code };
  }
}

// A ordem dos ids não muda a dupla (R2)
function localUnitId(playerIds: readonly string[]): string {
  return `unit-${[...playerIds].sort().join("-")}`;
}
