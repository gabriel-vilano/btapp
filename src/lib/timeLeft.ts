// Prazo em tempo restante, como a agenda mostra (docs/NAVIGATION.md, tabela
// 5.2): o jogador decide pelo quanto falta, não pela data do prazo.

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Até 48h a conta é em horas: "em 31h" diz mais que "em 1 dia" quando o prazo
// fecha amanhã à noite.
const HOURS_LIMIT_MS = 48 * HOUR_MS;

/**
 * Quanto falta até `deadline`, arredondado para baixo. Prazo vencido vira "agora".
 * @example formatTimeLeft("2026-10-02T19:00:00Z", "2026-10-01T12:00:00Z") // "em 31h"
 */
export function formatTimeLeft(deadline: string, now: string): string {
  const diff = Date.parse(deadline) - Date.parse(now);
  if (Number.isNaN(diff)) {
    throw new RangeError(`Prazo inválido: recebi '${deadline}' e agora '${now}', esperado ISO 8601`);
  }
  if (diff < MINUTE_MS) return "agora";
  if (diff < HOUR_MS) return `em ${Math.floor(diff / MINUTE_MS)}min`;
  if (diff < HOURS_LIMIT_MS) return `em ${Math.floor(diff / HOUR_MS)}h`;
  return `em ${Math.floor(diff / DAY_MS)} dias`;
}
