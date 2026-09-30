/**
 * Volta para a tela do link depois do login (docs/EXPLORE.md EX21,
 * docs/PROFILE.md PF20). O proxy guarda o caminho pedido neste parâmetro de
 * `/entrar`, e a action de login o lê para decidir o destino.
 */

export const LOGIN_RETURN_PARAM = "next";
export const DEFAULT_AFTER_LOGIN = "/feed";

// Só serve para resolver caminhos relativos: o que resolve para outra origem é externo
const INTERNAL_ORIGIN = "http://letzplay.internal";

/**
 * Caminho interno para onde ir depois do login; qualquer outro valor vira `/feed`.
 * Ex: `safeReturnPath("/explorar?q=ana")` → `"/explorar?q=ana"`;
 * `safeReturnPath("//evil.com")` → `"/feed"`.
 */
export function safeReturnPath(candidate: string | null | undefined): string {
  if (!candidate?.startsWith("/")) return DEFAULT_AFTER_LOGIN;
  // O parser de URL segue o navegador: `//evil.com`, `/\evil.com` e `/\t/evil.com`
  // viram outra origem, coisa que um teste de prefixo deixaria passar.
  const resolved = new URL(candidate, INTERNAL_ORIGIN);
  if (resolved.origin !== INTERNAL_ORIGIN) return DEFAULT_AFTER_LOGIN;
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}
