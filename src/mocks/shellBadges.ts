import type { ShellBadges } from "@/src/components/shell/AppShell";
import { adminPendingCount } from "@/src/lib/domain/competitions-tab";
import { adminPendingBadge, yourTurnBadge } from "@/src/lib/navigation/tabBadges";
import { mockCompetitionsTab } from "./competitionsTab";

// Mock até a agenda da aba Jogos entrar com a contagem de "Sua vez" (N3):
// troca-se por essa contagem sobre os dados da agenda
const MOCK_YOUR_TURN_COUNT = 2;

/** Badges da casca com os mocks: o mesmo cenário de admin que a aba Competições mostra. */
export function mockShellBadges(): ShellBadges {
  return {
    jogos: yourTurnBadge(MOCK_YOUR_TURN_COUNT),
    competicoes: adminPendingBadge(adminPendingCount(mockCompetitionsTab.admin)),
  };
}
