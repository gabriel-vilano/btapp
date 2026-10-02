"use client";

import {
  CalendarBlankIcon,
  CompassIcon,
  HouseIcon,
  TrophyIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { createContext, Suspense, useContext, type ElementType, type ReactNode } from "react";
import type { CountBadgeInfo } from "@/src/components/ui/CountBadge";
import { ToastProvider } from "@/src/components/ui/Toast";
import { NavigationRail, TabBar, type NavigationItem } from "@/src/components/ui/TabBar";
import { MAIN_TABS, mainTabHref, type MainTab } from "@/src/lib/navigation/mainTabs";
import { isTaskRoute } from "./taskRoutes";
import { TabRootTracker } from "./TabRootTracker";
import { useShellNavigationState, type ShellNavigation } from "./useShellNavigationState";
import styles from "./AppShell.module.css";

const TAB_ICONS: Record<MainTab, ElementType> = {
  feed: HouseIcon,
  jogos: CalendarBlankIcon,
  competicoes: TrophyIcon,
  explorar: CompassIcon,
  perfil: UserIcon,
};

/** Badges das abas (N3): só Jogos e Competições têm. */
export type ShellBadges = Partial<Record<"jogos" | "competicoes", CountBadgeInfo>>;

type AppShellProps = {
  badges: ShellBadges;
  /** Foto do jogador na aba Perfil (N1). Sem perfil carregado, a aba mostra o ícone. */
  profileAvatar: { url: string | null; alt: string } | null;
  children: ReactNode;
};

const ShellNavigationContext = createContext<ShellNavigation | null>(null);

/**
 * Casca das telas logadas: o conteúdo com a TabBar no mobile e o NavigationRail
 * a partir de 600px (NAVIGATION.md, N1, N4 e N27). Decide a aba marcada (N10, N28).
 * @example <AppShell badges={{ jogos: { count: 2, description: "2 pendências" } }} profileAvatar={null}>…</AppShell>
 */
export function AppShell({ badges, profileAvatar, children }: AppShellProps) {
  const pathname = usePathname();
  const { navigation, rememberVisit } = useShellNavigationState(pathname);
  const tab = navigation.currentTab;
  const items = navigationItems(badges, profileAvatar);
  const shellClass = [styles.shell, isTaskRoute(pathname) && styles["shell--task"]].filter(Boolean).join(" ");

  return (
    <ShellNavigationContext.Provider value={navigation}>
      <Suspense fallback={null}>
        <TabRootTracker onVisit={rememberVisit} />
      </Suspense>
      <div className={shellClass}>
        <NavigationRail items={items} currentValue={tab} className={styles.shell__rail} />
        {/* Provider dentro do .shell: o container do toast é fixed e precisa herdar --shell-bottom-offset */}
        <ToastProvider>
          <div className={styles.shell__content}>{children}</div>
        </ToastProvider>
        <TabBar items={items} currentValue={tab} className={styles.shell__tabbar} />
      </div>
    </ShellNavigationContext.Provider>
  );
}

/**
 * A aba marcada, o destino do "Voltar" e a declaração da aba de chegada, para as telas de detalhe.
 * @example const { backHref } = useShellNavigation();
 */
export function useShellNavigation(): ShellNavigation {
  const navigation = useContext(ShellNavigationContext);
  if (!navigation) {
    throw new Error("useShellNavigation: recebi contexto vazio, esperado um <AppShell> acima na árvore");
  }
  return navigation;
}

function navigationItems(
  badges: ShellBadges,
  profileAvatar: AppShellProps["profileAvatar"],
): NavigationItem[] {
  return MAIN_TABS.map(({ value, label }) => ({
    value,
    label,
    href: mainTabHref(value),
    icon: TAB_ICONS[value],
    badge: value === "jogos" || value === "competicoes" ? badges[value] : undefined,
    avatar: value === "perfil" && profileAvatar ? profileAvatar : undefined,
  }));
}
