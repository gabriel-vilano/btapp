import { draftToResult, EMPTY_SCORE_DRAFT, type ScoreDraft } from "@/src/components/ui/ScoreInput";
import type { ContestDetails, ContestReason, MatchFormat, MatchSideKey } from "@/src/types/domain";

/**
 * O que a folha de contestar manda ao domínio (RG15), ou a mensagem que impede
 * o envio. O placar lembrado é opcional, mas começado pela metade não vai: o
 * jogador completa ou limpa.
 * @example contestDetailsOf("other", EMPTY_SCORE_DRAFT, { format: "one_set_of_6", userSide: "a" }) // { reason: "other" }
 */
export function contestDetailsOf(
  reason: ContestReason | null,
  draft: ScoreDraft,
  options: { format: MatchFormat; userSide: MatchSideKey },
): ContestDetails | string {
  if (reason === null) return "Escolha o motivo da contestação.";
  if (reason !== "different_score") return { reason };
  if (draft === EMPTY_SCORE_DRAFT) return { reason, remembered_result: null };
  const remembered = draftToResult(draft, { ...options, type: "normal" });
  if (remembered.status !== "valid" || remembered.result.type !== "normal") {
    return "O placar que você lembra ainda não fecha a partida. Complete os sets ou limpe o placar.";
  }
  return { reason, remembered_result: remembered.result };
}
