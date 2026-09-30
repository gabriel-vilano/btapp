// Ponte entre o `<input type="datetime-local">` e o ISO 8601 dos dados. O
// horário digitado é o da quadra, em Brasília, não o do aparelho de quem digita
// (mesmo fuso de `formatters.ts` e `scheduleOptionFormat.ts`).

// Brasília está em UTC-3 o ano todo desde o fim do horário de verão (Decreto
// 9.772/2019), então o deslocamento é fixo e não precisa de biblioteca de fuso.
const BRASILIA_OFFSET = "-03:00";
const BRASILIA_OFFSET_MS = -3 * 60 * 60_000;

const LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * Valor do datetime-local, lido como horário de Brasília, em ISO 8601 (UTC).
 * Devolve `null` para campo vazio ou incompleto.
 * @example brasiliaLocalToIso("2026-10-03T14:00") // "2026-10-03T17:00:00.000Z"
 */
export function brasiliaLocalToIso(value: string): string | null {
  if (!LOCAL_PATTERN.test(value)) return null;
  const time = Date.parse(`${value}:00${BRASILIA_OFFSET}`);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

/**
 * ISO 8601 no formato do datetime-local, em Brasília: para `min`, `max` e valor inicial.
 * @example isoToBrasiliaLocal("2026-10-03T17:00:00.000Z") // "2026-10-03T14:00"
 */
export function isoToBrasiliaLocal(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    throw new RangeError(`Data inválida: recebi '${iso}', esperado ISO 8601`);
  }
  return new Date(time + BRASILIA_OFFSET_MS).toISOString().slice(0, 16);
}
