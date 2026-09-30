import type { CountBadgeInfo } from "@/src/components/ui/CountBadge";

function pendingsLabel(count: number): string {
  return count === 1 ? "1 pendência" : `${count} pendências`;
}

/**
 * Badge da aba Jogos: as pendências "Sua vez" (NAVIGATION.md, N3).
 * Ex.: `yourTurnBadge(2)` → `{ count: 2, description: "2 pendências" }`, lido "Jogos, 2 pendências".
 */
export function yourTurnBadge(count: number): CountBadgeInfo {
  return { count, description: pendingsLabel(count) };
}

/**
 * Badge da aba Competições: as pendências de admin (N3 e N30).
 * Ex.: `adminPendingBadge(1)` → lido "Competições, 1 pendência de admin".
 */
export function adminPendingBadge(count: number): CountBadgeInfo {
  return { count, description: `${pendingsLabel(count)} de admin` };
}
