"use client";

import {
  CalendarBlankIcon,
  CompassIcon,
  HouseIcon,
  TrophyIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ElementType, type ReactNode } from "react";
import type { CountBadgeInfo } from "@/src/components/ui/CountBadge";
import { NavigationRail, TabBar, type NavigationItem } from "@/src/components/ui/TabBar";
import { MAIN_TABS, mainTabHref, type MainTab } from "@/src/lib/navigation/mainTabs";
import { useCurrentTab } from "./useCurrentTab";
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

type ShellNavigation = {
  currentTab: MainTab;
  /** Destino do "Voltar" num detalhe: a raiz da aba marcada (N10 e N28). */
  backHref: string;
};

const ShellNavigationContext = createContext<ShellNavigation | null>(null);

/**
 * Casca das telas logadas: o conteúdo com a TabBar no mobile e o NavigationRail
 * a partir de 600px (NAVIGATION.md, N1, N4 e N27). Decide a aba marcada (N10, N28).
 * @example <AppShell badges={{ jogos: { count: 2, description: "2 pendências" } }} profileAvatar={null}>…</AppShell>
 */
export function AppShell({ badges, profileAvatar, children }: AppShellProps) {
  const tab = useCurrentTab(usePathname());
  const items = navigationItems(badges, profileAvatar);

  return (
    <ShellNavigationContext.Provider value={{ currentTab: tab, backHref: mainTabHref(tab) }}>
      <div className={styles.shell}>
        <NavigationRail items={items} currentValue={tab} className={styles.shell__rail} />
        <div className={styles.shell__content}>{children}</div>
        <TabBar items={items} currentValue={tab} className={styles.shell__tabbar} />
      </div>
    </ShellNavigationContext.Provider>
  );
}

/**
 * A aba marcada e o destino do "Voltar", para as telas de detalhe.
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
