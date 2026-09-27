// Recusa de uma transição da máquina de estados da partida (docs/DOMAIN.md §3).
//
// O `code` existe para a interface escolher a mensagem ao jogador sem depender
// do texto, que é para quem depura: ele traz o valor recebido e o esperado.

export type MatchTransitionErrorCode =
  | 'invalid_status' // a partida não está no estado de onde a ação parte
  | 'not_allowed' // quem age não tem esse papel na partida
  | 'too_early' // o prazo que libera a ação ainda não passou
  | 'too_late' // o prazo para a ação já passou
  | 'invalid_result'; // o resultado não vale para essa ação

export class MatchTransitionError extends Error {
  readonly code: MatchTransitionErrorCode;

  constructor(code: MatchTransitionErrorCode, message: string) {
    super(message);
    this.name = 'MatchTransitionError';
    this.code = code;
  }
}
