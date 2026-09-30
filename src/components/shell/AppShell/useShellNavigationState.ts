"use client";

import { useCallback, useMemo, useState } from "react";
import { rememberTabRoot, tabBackHref, type MainTab, type TabRoots } from "@/src/lib/navigation/mainTabs";
import { useCurrentTab } from "./useCurrentTab";

/** Aba da N28 que uma tela declarou, valendo só para a rota dela. */
type DeclaredArrival = { pathname: string; tab: MainTab };

export type ShellNavigation = {
  currentTab: MainTab;
  /** Destino do "Voltar" num detalhe: a raiz da aba marcada, com a query que ela tinha (N10 e N28). */
  backHref: string;
  /** Uma tela declara a aba de quem chega a ela sem origem, quando a rota não basta (N28). */
  declareArrivalTab: (pathname: string, tab: MainTab) => void;
};

/**
 * Estado de navegação da casca: a aba marcada, a última URL da raiz de cada aba
 * e a aba de chegada declarada pela tela.
 * @example const { navigation, rememberVisit } = useShellNavigationState(usePathname());
 */
export function useShellNavigationState(pathname: string) {
  const [declared, setDeclared] = useState<DeclaredArrival | null>(null);
  const [tabRoots, setTabRoots] = useState<TabRoots>({});
  const tab = useCurrentTab(pathname, declared?.pathname === pathname ? declared.tab : null);

  const declareArrivalTab = useCallback((declaredPathname: string, declaredTab: MainTab) => {
    setDeclared({ pathname: declaredPathname, tab: declaredTab });
  }, []);
  const rememberVisit = useCallback((visitedPathname: string, search: string) => {
    setTabRoots((roots) => rememberTabRoot(roots, visitedPathname, search));
  }, []);

  const navigation = useMemo<ShellNavigation>(
    () => ({ currentTab: tab, backHref: tabBackHref(tabRoots, tab), declareArrivalTab }),
    [tab, tabRoots, declareArrivalTab],
  );
  return { navigation, rememberVisit };
}
