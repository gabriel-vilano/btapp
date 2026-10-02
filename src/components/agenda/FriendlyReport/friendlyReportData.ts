import type { PickablePlayer } from "@/src/components/ui/SidePicker";
import type { MatchFormat } from "@/src/types/domain";

/**
 * O que a tela de registrar o amistoso precisa (docs/RESULTS.md §6.1). Hoje
 * vem dos mocks (`src/mocks/friendlyReport.ts`); com o Supabase, vem da
 * consulta da página e a lista de jogadores vira uma busca no servidor.
 */
export interface FriendlyReportData {
  /** Quem lança: já está no lado dele. */
  viewer: PickablePlayer;
  /** Qualquer jogador com conta, sem quem lança, com os amigos marcados (RG17). */
  players: PickablePlayer[];
  /** Formato do último amistoso de quem lança; `null` no primeiro (§6.1). */
  lastFormat: MatchFormat | null;
}
