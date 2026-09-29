/**
 * As 5 abas da navegação principal e as regras de qual delas fica marcada
 * (docs/NAVIGATION.md, N1, N10 e N28). Sem ícones nem React: roda no servidor,
 * no cliente e nos testes.
 */

export const MAIN_TABS = [
  { value: "feed", label: "Feed" },
  { value: "jogos", label: "Jogos" },
  { value: "competicoes", label: "Competições" },
  { value: "explorar", label: "Explorar" },
  { value: "perfil", label: "Perfil" },
] as const;

export type MainTab = (typeof MAIN_TABS)[number]["value"];

// N28: o primeiro segmento da rota diz o tipo da entidade. O que não está aqui
// (jogador, H2H, notificações e rota desconhecida) cai no Feed.
const ARRIVAL_TAB_BY_SEGMENT: Record<string, MainTab> = {
  jogos: "jogos",
  competicoes: "competicoes",
  ranking: "competicoes",
  explorar: "explorar",
  arenas: "explorar",
  perfil: "perfil",
};

function segmentsOf(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/** Endereço da raiz de uma aba. Ex.: `mainTabHref("jogos")` → `"/jogos"`. */
export function mainTabHref(tab: MainTab): string {
  return `/${tab}`;
}

/**
 * A aba cuja raiz é esta rota, ou `null` numa tela de detalhe.
 * Ex.: `tabAtRoot("/jogos")` → `"jogos"`; `tabAtRoot("/jogos/p-123")` → `null`.
 */
export function tabAtRoot(pathname: string): MainTab | null {
  const segments = segmentsOf(pathname);
  if (segments.length !== 1) return null;
  return MAIN_TABS.find((tab) => tab.value === segments[0])?.value ?? null;
}

/**
 * Aba de quem chega a uma rota sem origem no app: notificação, link externo ou URL digitada (N28).
 * Ex.: `arrivalTab("/jogos/p-123")` → `"jogos"`; `arrivalTab("/jogadores/lucas")` → `"feed"`.
 */
export function arrivalTab(pathname: string): MainTab {
  const [firstSegment = ""] = segmentsOf(pathname);
  return ARRIVAL_TAB_BY_SEGMENT[firstSegment] ?? "feed";
}

/**
 * Aba marcada numa rota: a própria, na raiz de uma aba; a de origem, num detalhe
 * aberto de dentro do app (N10); a da N28, num detalhe sem origem.
 * Ex.: `currentTab("/jogos/p-123", "feed")` → `"feed"`; `currentTab("/jogos/p-123", null)` → `"jogos"`.
 */
export function currentTab(pathname: string, originTab: MainTab | null): MainTab {
  return tabAtRoot(pathname) ?? originTab ?? arrivalTab(pathname);
}

/** Type guard para o valor lido do `sessionStorage`, que pode ser qualquer string. */
export function isMainTab(value: string | null): value is MainTab {
  return MAIN_TABS.some((tab) => tab.value === value);
}
