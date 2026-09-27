// Recusa de uma ação da marcação (docs/SCHEDULING.md §3).
//
// O `code` existe para a interface escolher a mensagem ao jogador sem depender
// do texto, que é para quem depura: ele traz o valor recebido e o esperado.

export type ScheduleErrorCode =
  | 'match_not_schedulable' // a partida não é do ranking em "Confronto definido" (M1)
  | 'not_allowed' // quem age não tem esse papel no confronto (M2–M4, M10)
  | 'no_pending_proposal' // a ação precisa de uma proposta pendente, e não há (M8)
  | 'invalid_options' // as opções não são 2 ou 3, distintas, futuras e antes do prazo da rodada (M5, M6)
  | 'invalid_date' // a data informada fora do app não é uma data (M14)
  | 'option_passed'; // o horário da opção já passou e ela não pode mais ser aceita (M12)

export class ScheduleError extends Error {
  readonly code: ScheduleErrorCode;

  constructor(code: ScheduleErrorCode, message: string) {
    super(message);
    this.name = 'ScheduleError';
    this.code = code;
  }
}
