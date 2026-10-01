import type { MatchTransitionErrorCode } from "@/src/lib/domain/match-state";

// Mensagem ao jogador quando o domínio recusa a resposta ao resultado ou o
// desfazer (docs/RESULTS.md §4). Escolhida pelo `code`, não pelo texto do
// erro, que é para quem depura. Com os mocks, o caso real é o prazo acabar
// com a tela aberta; com o Supabase, é também o outro lado responder primeiro.

/** O que o jogador tentou fazer: a mesma recusa pede mensagens diferentes. */
export type ResultAction = "respond" | "undo";

/** @example resultErrorMessage("too_late", "undo") // "O prazo de resposta acabou. …" */
export function resultErrorMessage(code: MatchTransitionErrorCode, action: ResultAction): string {
  switch (code) {
    case "too_late":
      return action === "undo"
        ? "O prazo de resposta acabou e o resultado já vale. Para mudar agora, fale com o admin."
        : "O prazo de resposta acabou e o resultado vale como foi lançado.";
    case "invalid_status":
      return "A partida mudou enquanto você estava na tela. Confira o estado dela.";
    case "not_allowed":
      return action === "undo" ? "Só quem lançou pode desfazer o lançamento." : "Só o lado adversário de quem lançou responde.";
    case "invalid_result":
      return "O placar que você lembra não fecha no formato da partida. Confira os sets ou deixe em branco.";
    case "too_early":
      return "Ainda não dá para fazer isso nesta partida.";
  }
}
