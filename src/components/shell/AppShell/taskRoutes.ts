// Rotas dos fluxos modais de tarefa (NAVIGATION.md N4): abrem em tela cheia,
// com "Fechar", e a casca esconde a TabBar e o NavigationRail. O layout não
// desmonta, então a aba de origem e o "Voltar" continuam valendo (N10).
const TASK_ROUTE_PATTERNS: readonly RegExp[] = [
  /^\/jogos\/[^/]+\/resultado\/?$/, // lançar o resultado (N18)
  /^\/perfil\/editar\/?$/, // editar perfil (PROFILE.md PF9)
];

/**
 * A rota é de um fluxo modal de tarefa, sem navegação principal à vista.
 * @example isTaskRoute("/jogos/match-1/resultado") // true
 */
export function isTaskRoute(pathname: string): boolean {
  return TASK_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
