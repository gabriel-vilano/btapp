import {
  CalendarBlankIcon,
  CompassIcon,
  HouseIcon,
  TrophyIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { STORY_AVATAR_URL } from "@/src/components/ui/Avatar/storyFixtures";
import type { NavigationItem } from "./types";

// As 5 abas da NAVIGATION.md (N1), com os badges da N3
export const STORY_NAVIGATION_ITEMS: NavigationItem[] = [
  { value: "feed", href: "/feed", label: "Feed", icon: HouseIcon },
  {
    value: "jogos",
    href: "/jogos",
    label: "Jogos",
    icon: CalendarBlankIcon,
    badge: { count: 2, description: "2 pendências" },
  },
  { value: "competicoes", href: "/competicoes", label: "Competições", icon: TrophyIcon },
  { value: "explorar", href: "/explorar", label: "Explorar", icon: CompassIcon },
  {
    value: "perfil",
    href: "/perfil",
    label: "Perfil",
    icon: UserIcon,
    avatar: { url: STORY_AVATAR_URL, alt: "Lucas Silva" },
  },
];

/** As abas com o badge de admin na aba Competições (N30). */
export function withAdminBadge(items: NavigationItem[]): NavigationItem[] {
  return items.map((item) =>
    item.value === "competicoes"
      ? { ...item, badge: { count: 1, description: "1 pendência de admin" } }
      : item,
  );
}
