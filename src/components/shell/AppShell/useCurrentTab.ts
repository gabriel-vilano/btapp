"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { currentTab, isMainTab, type MainTab } from "@/src/lib/navigation/mainTabs";

const ORIGIN_STORAGE_KEY = "bt:aba-de-origem";

/** A tela atual e a aba que estava marcada na tela anterior (`null` na primeira tela). */
type TabTrail = { pathname: string; originTab: MainTab | null };

// Lida uma vez, quando o módulo carrega no navegador: antes da hidratação e,
// portanto, antes de o efeito abaixo gravar a aba da primeira tela por cima
const RESTORED_ORIGIN_TAB = typeof window === "undefined" ? null : restoredOriginTab();

/**
 * A aba marcada na rota atual, lembrando a aba de origem entre navegações (NAVIGATION.md, N10).
 * A URL não carrega a aba, então a origem vive no estado do layout, que não
 * desmonta ao trocar de tela, e no `sessionStorage`, que sobrevive ao recarregar.
 * `declaredArrival` é a aba da N28 que a tela atual declarou (a competição sem inscrição).
 */
export function useCurrentTab(pathname: string, declaredArrival: MainTab | null = null): MainTab {
  const [trail, setTrail] = useState<TabTrail>({ pathname, originTab: null });
  // No servidor e na hidratação vale `null`; logo depois, o valor do navegador
  const restoredOrigin = useSyncExternalStore(subscribeToNothing, () => RESTORED_ORIGIN_TAB, () => null);
  const tab = currentTab(trail.pathname, trail.originTab ?? restoredOrigin, declaredArrival);

  // Ajuste de estado durante a renderização, em vez de efeito: a aba certa já
  // sai na primeira pintura da tela nova (react.dev, "You Might Not Need an Effect")
  if (trail.pathname !== pathname) {
    setTrail({ pathname, originTab: tab });
  }

  useEffect(() => {
    saveOriginTab(tab);
  }, [tab]);

  return trail.pathname === pathname ? tab : currentTab(pathname, tab);
}

// A origem salva não muda enquanto a página está aberta: não há o que assinar
function subscribeToNothing(): () => void {
  return () => {};
}

/**
 * Origem salva, só quando a página foi recarregada ou reaberta pelo voltar do navegador.
 * Numa chegada nova (URL digitada, link externo, notificação), vale a N28, mesmo
 * com uma origem antiga guardada na mesma aba do navegador.
 */
function restoredOriginTab(): MainTab | null {
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  if (entry?.type !== "reload" && entry?.type !== "back_forward") return null;
  try {
    const saved = sessionStorage.getItem(ORIGIN_STORAGE_KEY);
    return isMainTab(saved) ? saved : null;
  } catch {
    return null;
  }
}

function saveOriginTab(tab: MainTab): void {
  try {
    sessionStorage.setItem(ORIGIN_STORAGE_KEY, tab);
  } catch {
    // Sem storage (aba anônima, cota cheia), a origem só não sobrevive ao recarregar
  }
}
