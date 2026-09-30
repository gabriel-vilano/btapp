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
// (jogador, H2H, notificações e rota desconhecida) cai no Feed. A competição
// em que o jogador não está inscrito cai no Explorar, mas só a página sabe
// disso: ela declara a aba (`competitionArrivalTab`).
const ARRIVAL_TAB_BY_SEGMENT: Record<string, MainTab> = {
  jogos: "jogos",
  competicoes: "competicoes",
  ranking: "competicoes",
  explorar: "explorar",
  organizacoes: "explorar",
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
 * Aba de quem chega à competição sem origem no app (N28): Competições para quem
 * está inscrito; Explorar para quem não está.
 */
export function competitionArrivalTab(isEnrolled: boolean): MainTab {
  return isEnrolled ? "competicoes" : "explorar";
}

/**
 * Aba marcada numa rota: a própria, na raiz de uma aba; a de origem, num detalhe
 * aberto de dentro do app (N10); a da N28, num detalhe sem origem. `declaredArrival`
 * é a aba da N28 que a própria tela declarou, quando a rota não basta.
 * Ex.: `currentTab("/jogos/p-123", "feed")` → `"feed"`; `currentTab("/jogos/p-123", null)` → `"jogos"`.
 */
export function currentTab(pathname: string, originTab: MainTab | null, declaredArrival: MainTab | null = null): MainTab {
  return tabAtRoot(pathname) ?? originTab ?? declaredArrival ?? arrivalTab(pathname);
}

/** A última URL visitada na raiz de cada aba, com a query (N10: cada aba tem a própria pilha). */
export type TabRoots = Partial<Record<MainTab, string>>;

/**
 * Guarda a URL quando ela é a raiz de uma aba; num detalhe, não muda nada.
 * Ex.: `rememberTabRoot({}, "/explorar", "q=ana")` → `{ explorar: "/explorar?q=ana" }`.
 */
export function rememberTabRoot(roots: TabRoots, pathname: string, search: string): TabRoots {
  const tab = tabAtRoot(pathname);
  if (tab === null) return roots;
  const url = search === "" ? mainTabHref(tab) : `${mainTabHref(tab)}?${search}`;
  return roots[tab] === url ? roots : { ...roots, [tab]: url };
}

/**
 * Destino do "Voltar" num detalhe: a raiz da aba marcada como ela estava, com o
 * termo e o filtro (EXPLORE.md, EX4); a raiz limpa quando a aba não foi visitada.
 * Ex.: `tabBackHref({ explorar: "/explorar?q=ana" }, "explorar")` → `"/explorar?q=ana"`.
 */
export function tabBackHref(roots: TabRoots, tab: MainTab): string {
  return roots[tab] ?? mainTabHref(tab);
}

/** Type guard para o valor lido do `sessionStorage`, que pode ser qualquer string. */
export function isMainTab(value: string | null): value is MainTab {
  return MAIN_TABS.some((tab) => tab.value === value);
}
