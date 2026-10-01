import type { Match, PendingScheduleProposal, ScheduleHistory } from '@/src/types/domain';
import { sideOfPlayer, type ScheduleSides } from './guards';
import { agreedScheduleOf, expireProposals, pendingProposalOf, type AgreedSchedule } from './history';

// Estado da marcação do confronto do ponto de vista de quem abre a tela
// (docs/SCHEDULING.md §6, tabela "Estados da marcação no confronto"). A tela
// escolhe o que mostrar e quais ações oferecer só a partir deste estado.

export type ScheduleView =
  /** Nenhuma data e nenhuma proposta pendente: "Propor horários". */
  | { kind: 'no_date' }
  /**
   * O outro lado propôs e a vez é de quem vê: escolher uma opção ou "Nenhum
   * serve" (M9). Com data acordada, é a remarcação pedida pelo outro lado, e a
   * data vale até alguém aceitar (M13).
   */
  | { kind: 'awaiting_you'; proposal: PendingScheduleProposal; agreed: AgreedSchedule | null }
  /** O próprio lado propôs: "Trocar horários" ou "Retirar" (M10). */
  | { kind: 'awaiting_other_side'; proposal: PendingScheduleProposal; agreed: AgreedSchedule | null }
  /** Data acordada ou informada no futuro: "Remarcar" (M13). */
  | { kind: 'agreed'; agreed: AgreedSchedule }
  /** A data passou sem resultado: "Lançar resultado". */
  | { kind: 'date_passed'; agreed: AgreedSchedule }
  /**
   * A partida saiu de "Confronto definido" (resultado lançado, prazo da rodada
   * vencido, decisão do admin): a marcação é só leitura, porque vira evidência (M1).
   */
  | { kind: 'frozen'; agreed: AgreedSchedule | null }
  /**
   * Quem vê não é do confronto: só a data e a arena acordadas, como no card
   * público. As propostas e o histórico não aparecem (M18).
   */
  | { kind: 'public'; agreed: AgreedSchedule | null }
  /**
   * Quem vê não é do confronto, e a marcação já congelou (M1): só a data e a
   * arena acordadas, como registro (M18). Sem data acordada, não há o que mostrar.
   */
  | { kind: 'public_frozen'; agreed: AgreedSchedule | null };

export type ScheduleViewKind = ScheduleView['kind'];

/** O que o estado da marcação precisa saber além do histórico. */
export interface ScheduleViewInput {
  history: ScheduleHistory;
  match: Match;
  sides: ScheduleSides;
  viewerId: string;
  now: string; // ISO 8601
}

/**
 * Estado da marcação para quem vê o confronto. Expira antes de ler, porque a
 * proposta cujas opções passaram já expirou mesmo que a rotina não tenha rodado (M12).
 * @example scheduleViewOf({ history, match, sides, viewerId: 'player-lucas', now }).kind // 'awaiting_you'
 */
export function scheduleViewOf({ history, match, sides, viewerId, now }: ScheduleViewInput): ScheduleView {
  const settled = expireProposals(history, now);
  const agreed = agreedScheduleOf(settled);
  const viewerSide = sideOfPlayer(sides, viewerId);
  const frozen = match.kind !== 'ranking' || match.status !== 'defined';
  if (viewerSide === null) return { kind: frozen ? 'public_frozen' : 'public', agreed };
  if (frozen) return { kind: 'frozen', agreed };

  const pending = pendingProposalOf(settled);
  if (pending !== null) {
    const kind = pending.side === viewerSide ? 'awaiting_other_side' : 'awaiting_you';
    return { kind, proposal: pending, agreed };
  }
  if (agreed === null) return { kind: 'no_date' };
  return Date.parse(agreed.starts_at) > Date.parse(now) ? { kind: 'agreed', agreed } : { kind: 'date_passed', agreed };
}
