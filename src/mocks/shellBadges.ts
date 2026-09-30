import type { ShellBadges } from "@/src/components/shell/AppShell";
import { playerAgenda, yourTurnCount } from "@/src/lib/domain/agenda";
import { adminPendingCount } from "@/src/lib/domain/competitions-tab";
import { adminPendingBadge, yourTurnBadge } from "@/src/lib/navigation/tabBadges";
import { MOCK_AGENDA_VIEWER_ID } from "./agendaViewer";
import { mockCompetitionsTab } from "./competitionsTab";
import { mockDomain } from "./domain";

/** Badges da casca com os mocks: "Sua vez" da agenda da aba Jogos e o cenário de admin da aba Competições. */
export function mockShellBadges(): ShellBadges {
  const agenda = playerAgenda(mockDomain, { playerId: MOCK_AGENDA_VIEWER_ID, now: new Date().toISOString() });
  return {
    jogos: yourTurnBadge(yourTurnCount(agenda)),
    competicoes: adminPendingBadge(adminPendingCount(mockCompetitionsTab.admin)),
  };
}
