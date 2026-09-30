import type { ScheduleErrorCode } from "@/src/lib/domain/schedule-state";

// Mensagem ao jogador quando o domínio recusa uma ação da marcação. Escolhida
// pelo `code`, não pelo texto do erro, que é para quem depura.

const MESSAGES: Record<ScheduleErrorCode, string> = {
  option_passed: "Esse horário já passou. Escolha outro ou proponha novos horários.",
  invalid_options: "Confira os horários: precisam ser futuros, diferentes entre si e antes do fim da rodada.",
  invalid_date: "Confira a data informada.",
  no_pending_proposal: "Essa proposta não está mais pendente. Veja o estado atual da marcação.",
  not_allowed: "Só os jogadores do confronto fazem isso, e cada lado responde à proposta do outro.",
  match_not_schedulable: "Este confronto não aceita mais marcação.",
};

/** @example scheduleErrorMessage("option_passed") // "Esse horário já passou. …" */
export function scheduleErrorMessage(code: ScheduleErrorCode): string {
  return MESSAGES[code];
}
